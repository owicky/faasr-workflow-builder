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
  const [visibleObjects, setVisibleObjects] = useState({workflow: false, graph: false})

  const nodeTypes = useMemo(() => ({ functionNode: FunctionNode }), []);

  // Updates flow panel to reflect nodes changes
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  // Updates flow panel to reflect edges changes
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

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
    
    if (!edges[id]){

      add_edge(params.source, params.target)
      setEdges((eds) => addEdge(customEdge, eds));
    }
    
  };

  // Applies layout to the flow panel 
  // ('TB') = Top-to-Bottom
  // ('LR') = Left-to-Right 
  const onLayout = useCallback(
      (direction) => {
      const layouted = getLayoutedElements(nodes, edges, { direction });
      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);
      console.log([edges])
    },
    [nodes, edges],
  );

  // Called when a node is Clicked in the flow panel
  const onNodeClick = (event, object) => {
    setEditType("Functions")
    setSelectedFunctionId(object.id)
  };

  // Called when node is deleted in flow panel
  const onNodesDelete = useCallback(
    (deleted) => {
      const id = deleted[0].id
      for (let i in workflow.FunctionList){
        workflow.FunctionList[i].InvokeNext = workflow.FunctionList[i].InvokeNext.filter(
          item => item !== id
        )
      }
      delete workflow.FunctionList[id]
    },
  );

  // Called when edge is deleted in flow panel
  const onEdgesDelete = useCallback(
    (deleted) => {
      let  coolEdge = deleted[0]
      let source = coolEdge.source
      let target = coolEdge.target
      workflow.FunctionList[source].InvokeNext = workflow.FunctionList[source].InvokeNext.filter(
        item => item !== target
      )
    },
  );

  // Adds new node given (xpos : num, ypos : num, name : string, id : string) to nodes obj
  const  createNode = (x, y, name, id) => {
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
    setNodes((nds) => nds.concat(newNode));

    // Attach the edges on creation
    const workflowAction = workflow.FunctionList[id];

    if (workflowAction && workflowAction.InvokeNext.length > 0) {
        for (let j of workflowAction.InvokeNext) {
            createEdge(id, j);
        }
    }
  }

    // Creates a new edge with specified (Source id, Target id)
  const createEdge = (id1, id2) => {
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
    // console.log("New edge" + JSON.stringify(newEdge));
    setEdges((eds) => eds.concat(newEdge));
  }
  
  /* Adds a new edge to the workflow, given a (Source id, Target id)
  */
  const add_edge = (sourceId, targetId) => {
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
  
    setWorkflow(updatedWorkflow);
  };

  return (
      <div className="App">

      <header className="App-header">
        <Toolbar setLayout={() => onLayout("TB")} toggleGraphVisible={() => setVisibleObjects({...visibleObjects, graph : !visibleObjects.graph})} toggleWorkflowVisible={() => setVisibleObjects({...visibleObjects, workflow : !visibleObjects.workflow})} visibleObjects={visibleObjects}  setVisibleObjects={setVisibleObjects} setEditType={setEditType} createNode={ createNode} createEdge={ createEdge }></Toolbar>
      </header>

      <div id="mid-panel">
        <VisibleGraph nodes={nodes} edges={edges} visible={visibleObjects.graph}></VisibleGraph>
        <VisibleWorkflow visible={visibleObjects.workflow}></VisibleWorkflow>
        <EditorPanel createEdge={(a,b) => createEdge(a,b)} createNode={createNode} type={editType}/>

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
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              maxZoom={3}
              minZoom={.1}
              fitView
            > <Controls/>

              <Panel position="top-right">
                <button onClick={() => onLayout('TB')}>vertical layout</button>
                <button onClick={() => onLayout('LR')}>horizontal layout</button>
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
