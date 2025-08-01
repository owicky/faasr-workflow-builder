import './App.css';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import { useCallback, useMemo, useState } from 'react';
import { ReactFlow, Controls, applyEdgeChanges, applyNodeChanges, addEdge, Panel, MarkerType} from '@xyflow/react';
import Toolbar from './components/ToolBar/Toolbar';
import FunctionNode from './components/FunctionNode';
import { useWorkflowContext } from './WorkflowContext';
import EditorPanel from './components/EditorPanel';
import VisibleWorkflow from './components/ToolBar/VisibleWorkflow';
import VisibleGraph from './components/ToolBar/VisibleGraph';
import useUndo from './components/Utils/Undo';
import { IoMdUndo, IoMdRedo } from 'react-icons/io';

const defaultEdgeOptions = { animated: false };

// Uses Dagre to apply layout
const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;
      return { ...node,
              position: { x, y },
              };
    }),
    edges,
  };
};



function App() {
  const { edges, setEdges, nodes, setNodes, workflow, setWorkflow, setSelectedFunctionId } = useWorkflowContext();
  const [editType, setEditType] = useState(null)
  const [isDragging, setIsDragging] = useState(false);
  const [visibleObjects, setVisibleObjects] = useState({workflow: false, graph: false})
  const { updateLayout, updateWorkflow, updateWorkflowAndLayout, updateSelectedFunctionId, undo, redo, canUndo, canRedo } = useUndo();

  const nodeTypes = useMemo(() => ({ functionNode: FunctionNode }), []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  // Updates flow panel to reflect edges changes
  const onEdgesChange = useCallback(
    (changes) => {
        //alert(`Edges changed: ${edges}`);
        setEdges((eds) => applyEdgeChanges(changes, eds))
    },
    [setEdges],
  );

  const onNodeDragStart = (event, nodeType) => setIsDragging(true);
  const onNodeDragStop = (event, nodeType) => {
      setIsDragging(false);
      updateLayout(nodes, edges)
  };
    
  // Called when two nodes are connected (nodes socket dragged to another nodes socket)
  const onConnect = (params) => {
    const customEdge = {
      ...params,
      id: `${params.source}-${params.target}`,
      markerEnd: {
        width: 20,
        height: 20,
        type: MarkerType.ArrowClosed,
      },
    };
    const id = params.source+ "-"+ params.target
    
    if (cycleDetection(nodes, addEdge(customEdge, edges))) {
      alert("Cycle Detected!")
    }
    else if (!edges[id]){

      // modified add_edge to update both workflow and edges
      add_edge(params.source, params.target, customEdge);
    }
    
  };


  

      // DFS cycle check from https://www.geeksforgeeks.org/dsa/detect-cycle-in-a-graph/

    // Helper function to perform DFS and detect cycle
    function isCyclicUtil(adj, u, visited, recStack)
    {
        // If node is already in the recursion stack, cycle
        // detected
        if (recStack[u]){
            return true;
        }

        // If node is already visited and not in recStack, no
        // need to check again
        if (visited[u])
            return false;

        // Mark the node as visited and add it to the recursion
        // stack
        visited[u] = true;
        recStack[u] = true;

        // Recur for all neighbors of the current node
        for (let v of adj[u]) {
            if (isCyclicUtil(adj, v, visited, recStack)){
                
                return true; // If any path leads to a cycle,
                                // return true
            }
        }

        // Backtrack: remove the node from recursion stack
        recStack[u] = false;
        return false; // No cycle found in this path
    }

    // Function to construct adjacency list from edge list
    function constructadj(V, edges)
    {
        let adj = Array.from(
            {length : V},
            () => []); // Create an empty list for each vertex
        for (let [u, v] of edges) {
            adj[u].push(v); // Add directed edge from u to v
        }
        return adj;
    }

    // Main function to detect cycle in directed graph
    const isCyclic = (V, edges) =>
    {
        let adj
            = constructadj(V, edges); // Build adjacency list
        let visited
            = new Array(V).fill(false); // Track visited nodes
        let recStack
            = new Array(V).fill(false); // Track recursion stack


        // Check each vertex (for disconnected components)
        for (let i = 0; i < V; i++) {
            if (!visited[i] && isCyclicUtil(adj, i, visited, recStack))
                return true; // Cycle found
        }

        return false; // No cycle detected
    }

    // Cycle detection and edge recoloration to reflect presence of cycles
    const cycleDetection = (nds, eds) => {

        const V = nds.length

        const dfsEdges = eds.map( (edge) => [nds.findIndex( (node) => (node.id === edge.source) ), nds.findIndex( (node) => (node.id === edge.target) )])

        return(isCyclic(V, dfsEdges)); 
    }

    
  // Applies layout to the flow panel 
  // ('TB') = Top-to-Bottom
  // ('LR') = Left-to-Right 
  const onLayout = useCallback(
      (direction) => {
      const layouted = getLayoutedElements(nodes, edges, { direction });
      updateLayout([...layouted.nodes], [...layouted.edges]);
      console.log([edges])
    },
    [nodes, edges],
  );

  // Called when a node is Clicked in the flow panel
  const onNodeClick = (event, object) => {
    setEditType("Functions")
    updateSelectedFunctionId(object.id)
  };

  // Called when node is deleted in flow panel
  const onNodesDelete = useCallback(
    (deleted) => {
      const id = deleted[0].id
      let newWorkflow = structuredClone(workflow)
      for (let i in workflow.FunctionList){
        newWorkflow.FunctionList[i].InvokeNext = newWorkflow.FunctionList[i].InvokeNext.filter(
          item => item !== id
        )
      }
      delete newWorkflow.FunctionList[id];
      updateWorkflowAndLayout(
        newWorkflow, 
        nodes.filter((node) => node.id !== id),
        edges.filter((edge) => edge.source !== id && edge.target !== id)
      );
    },
  );

  // Called when edge is deleted in flow panel
  const onEdgesDelete = useCallback(
    (deleted) => {
      let coolEdge = deleted[0]
      let source = coolEdge.source
      let target = coolEdge.target
      let newWorkflow = structuredClone(workflow);
      newWorkflow.FunctionList[source].InvokeNext = newWorkflow.FunctionList[source].InvokeNext.filter(
        item => item !== target
      )
      updateWorkflowAndLayout(newWorkflow, nodes, edges.filter(
        (edge) => edge.source !== source && edge.target !== target
      ));
    },
  );

  // Adds new node given (xpos : num, ypos : num, name : string, id : string) to nodes obj
  const createNewNode = (x, y, name, id) => {
    name = name == null ?  "undefined" : name 
    const newNode = {
        id : id,
        type: 'functionNode',
        position: ({
        x: x,
        y: y}),
        data: { id: id, name : name, direct: 1},
        origin: [0.5, 0.0],
    };
    return newNode;
  }

  const createNode = (x, y, name, id) => {
    const newNode = createNewNode(x, y, name, id);

    // Attach the edges on creation
    const workflowAction = workflow.FunctionList[id];
    let newEdges = [];

    if (workflowAction && workflowAction.InvokeNext.length > 0) {
        for (let j of workflowAction.InvokeNext) {
            newEdges.push(createNewEdge(id, j));
        }
    }
    updateLayout(nodes.concat(newNode), edges.concat(newEdges));
  }

    // Creates a new edge with specified (Source id, Target id)
  const createNewEdge = (id1, id2) => {
    const newEdge = {
      animated : false,
      source : id1,
      target : id2,
      markerEnd: {
        width: 20,
        height: 20,
        type: MarkerType.ArrowClosed,
      },
      id : id1+"-"+id2
    };
    
    return newEdge;  
  }

  // creates a new edge and applies it
  const createEdge = (id1, id2) => {
    const newEdge = createNewEdge(id1, id2);
    updateLayout(nodes, edges.concat(newEdge));
  }
  
  /* Adds a new edge to the workflow and layout given a (Source id, Target id)
  */
  const add_edge = (sourceId, targetId, customEdge) => {
    // Get the function object for the source
    const sourceFunction = workflow.FunctionList[sourceId];
  
    if (!sourceFunction) {
      console.error(`Source function '${sourceId}' not found.`);
      return;
    }
  
    // Update the InvokeNext array
    const updatedInvokeNext = [...(sourceFunction.InvokeNext || []), targetId];
  
    // Create updated source function with new InvokeNext
    const updatedSourceFunction = {
      ...sourceFunction,
      InvokeNext: updatedInvokeNext,
    };
  
    // Build new FunctionList with updated source function
    const updatedFunctionList = {
      ...workflow.FunctionList,
      [sourceId]: updatedSourceFunction,
    };
  
    // Update entire workflow
    const updatedWorkflow = {
      ...workflow,
      FunctionList: updatedFunctionList,
    };
  
    updateWorkflowAndLayout(updatedWorkflow, nodes, edges.concat(customEdge));
  };

  const handleOnKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'z') {
        undo();
    } else if (event.ctrlKey && event.key === 'y') {
        redo();
    }
  }

  return (
      <div className="App">

      <header className="App-header">
        <Toolbar setLayout={() => onLayout("TB")} toggleGraphVisible={() => setVisibleObjects({...visibleObjects, graph : !visibleObjects.graph})} toggleWorkflowVisible={() => setVisibleObjects({...visibleObjects, workflow : !visibleObjects.workflow})} visibleObjects={visibleObjects}  setVisibleObjects={setVisibleObjects} setEditType={setEditType} createNode={ createNode} createNewNode={createNewNode} createEdge={ createEdge } createNewEdge={createNewEdge} updateWorkflowAndLayout={updateWorkflowAndLayout}></Toolbar>
      </header>

      <div id="mid-panel">
        <VisibleGraph nodes={nodes} edges={edges} visible={visibleObjects.graph}></VisibleGraph>
        <VisibleWorkflow visible={visibleObjects.workflow}></VisibleWorkflow>
        <EditorPanel addEdge={(eds, newEdge) => addEdge(eds, newEdge)} checkCycle={ (nds,eds) => cycleDetection(nds, eds) } createEdge={(a,b) => createEdge(a,b)} createNode={createNode} type={editType}/>

          <div id="workflow-panel">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onConnect={onConnect}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onNodeDragStart={onNodeDragStart}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={nodeTypes}
              onKeyDown={handleOnKeyDown}
              defaultEdgeOptions={defaultEdgeOptions}
              maxZoom={3}
              minZoom={.1}
              fitView
            > <Controls/>

              <Panel position="top-right">
                <button onClick={() => onLayout('TB')}>vertical layout</button>
                <button onClick={() => onLayout('LR')}>horizontal layout</button>
                <button onClick={undo} disabled={!canUndo}><IoMdUndo /></button>
                <button onClick={redo} disabled={!canRedo}><IoMdRedo /></button>
              </Panel>

            </ReactFlow>
          </div>

        </div>
      {/* <footer>
        <a href="https://github.com/FaaSr/FaaSr-package">@Github</a>
      </footer> */}
      </div>
  )
}

export default App;
