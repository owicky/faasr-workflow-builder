import './App.css';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import { useCallback, useMemo, useState } from 'react';
import { useReactFlow, ReactFlow, Controls, applyEdgeChanges, applyNodeChanges, addEdge, Panel, MarkerType, Background, useUpdateNodeInternals} from '@xyflow/react';
import Toolbar from './components/ToolBar/Toolbar';
import FunctionNode from './components/FunctionNode';
import { useWorkflowContext } from './WorkflowContext';
import EditorPanel from './components/EditorPanel';
import VisibleWorkflow from './components/ToolBar/VisibleWorkflow';
import VisibleGraph from './components/ToolBar/VisibleGraph';
import useUndo from './components/Utils/Undo';
import { IoMdUndo, IoMdRedo } from 'react-icons/io';
import { TbGridDots } from "react-icons/tb";
import useFunctionUtils from './components/Functions/FunctionsUtils';
import { MdDarkMode, MdOutlineDarkMode } from "react-icons/md";
import useWorkflowAndLayoutUtils from './components/Utils/WorkflowAndLayoutUtils';
import useUtils from './components/Utils/Utils';

const defaultEdgeOptions = { animated: false };

function App() {
  const { edges, setEdges, nodes, setNodes, workflow, colorMode, setColorMode} = useWorkflowContext();
  const [editType, setEditType] = useState(null)
  const [ isDragging, setIsDragging] = useState(false);
  const [ dots, setDots ] = useState(false)
  const [visibleObjects, setVisibleObjects] = useState({workflow: false, graph: false})
  const { updateLayout, updateWorkflow, updateWorkflowAndLayout, updateSelectedFunctionId, undo, redo, canUndo, canRedo } = useUndo();
  const { listInvokeNext, parseInvoke, getInvokeCondition, deleteInvoke, updateInvoke, isValidNewRankedEdge, createEdge, add_edge, createNewEdge} = useFunctionUtils ();
  const { fitView } = useReactFlow()
  const { cycleDetection } = useUtils()
  const updateNodeInternals = useUpdateNodeInternals()
  const { createInvokeAndEdge, deleteInvokeAndEdge, deleteActionAndNode} = useWorkflowAndLayoutUtils() 

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
              data : {...node.data, direct : (options.direction === 'TB') ? 1:0}
              };
    }),
    edges,//
  };
};

  const onNodeDragStart = (event, nodeType) => setIsDragging(true);
  const onNodeDragStop = (event, nodeType) => {
      setIsDragging(false);
      updateLayout(nodes, edges)
  };
    
  // Called when two nodes are connected (nodes socket dragged to another nodes socket)
  const onConnect = (params) => {
    createInvokeAndEdge(params.source, params.target)
  };
    
  // Applies layout to the flow panel 
  // ('TB') = Top-to-Bottom
  // ('LR') = Left-to-Right 
  const onLayout = useCallback(
      (direction) => {
      const layouted = getLayoutedElements(nodes, edges, { direction });
      updateLayout([...layouted.nodes], [...layouted.edges]);
      updateNodeInternals(nodes.map( (node) => node.id))
    },
    [nodes, edges, updateLayout],

  );

  // Called when a node is Clicked in the flow panel
  const onNodeClick = (event, object) => {
    updateSelectedFunctionId(object.id)
    setEditType("Functions")
  };

  // Called when node is deleted in flow panel
  const onNodesDelete = 
    (deleted) => {
      deleteActionAndNode(deleted[0].id)
    };

  // Called when edge is deleted in flow panel
  const onEdgesDelete = 
    (deleted) => {
      deleteInvokeAndEdge(deleted[0].source, deleted[0].target)
    };

  // Adds new node given (xpos : num, ypos : num, name : string, id : string) to nodes obj
  const createNewNode = (x, y, name, id) => {
    name = name == null ?  "undefined" : name 
    const newNode = {
        id : id,
        type: 'functionNode',
        position: ({
        x: x,
        y: y}),
        data: { id: id, name : name, direct: 1, rank: 1},
        origin: [0.5, 0.0],
    };
    return newNode;
  }

  const createNode = (x, y, name, id) => {
    const newNode = createNewNode(x, y, name, id);

    // Attach the edges on creation
    const workflowAction = workflow.ActionList[id];
    let newEdges = [];

    if (workflowAction && workflowAction.InvokeNext.length > 0) {
        for (let j of workflowAction.InvokeNext[1]) {
            newEdges.push(createNewEdge(id, j));
        }
    }
    updateLayout(nodes.concat(newNode), edges.concat(newEdges));
  }

    

  document.addEventListener('keydown', function(event) {    
    if (event.ctrlKey && event.key === 'z') {
        undo();
    } else if (event.ctrlKey && event.key === 'y') {
        redo();
    }
  })

  return (
    <div className="App" data-theme={colorMode}>

      {/* <header className="App-header"> */}
        <Toolbar setLayout={() => onLayout("TB")} toggleGraphVisible={() => setVisibleObjects({...visibleObjects, graph : !visibleObjects.graph})} toggleWorkflowVisible={() => setVisibleObjects({...visibleObjects, workflow : !visibleObjects.workflow})} visibleObjects={visibleObjects}  setVisibleObjects={setVisibleObjects} setEditType={setEditType} createNode={ createNode} createNewNode={createNewNode} createEdge={ createEdge } createNewEdge={createNewEdge} updateWorkflowAndLayout={updateWorkflowAndLayout}></Toolbar>
      {/* </header> */}

      <div id="mid-panel" >
        {/* <VisibleGraph nodes={nodes} edges={edges} visible={visibleObjects.graph}></VisibleGraph>
        <VisibleWorkflow visible={visibleObjects.workflow}></VisibleWorkflow> */}
        <EditorPanel id="editor-panel-component" addEdge={(eds, newEdge) => addEdge(eds, newEdge)} createEdge={(a,b, c, d) => createEdge(a,b, c, d)} createNode={createNode} createNewEdge={createNewEdge} type={editType}/>

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
              defaultEdgeOptions={defaultEdgeOptions}
              tabIndex={0}
              style={{
                backgroundColor: colorMode === "dark" ? "#242222ff" : "white"
              }}
              maxZoom={3}
              minZoom={.1}
              colorMode={colorMode}
              fitView
            > <Controls/>

              <Panel position="top-right">
                <button onClick={() => { onLayout('TB'); fitView()}}>vertical layout</button>
                <button onClick={() => { onLayout('LR'); fitView()}  }>horizontal layout</button>
                <button onClick={undo} disabled={!canUndo}><IoMdUndo /></button>
                <button onClick={redo} disabled={!canRedo}><IoMdRedo /></button>
                <button onClick={() => setDots(!dots)}><TbGridDots /></button>
                <button onClick={() => setColorMode(colorMode === "dark" ? "light": "dark")}>{colorMode === "dark" ? <MdOutlineDarkMode/> : <MdDarkMode />}</button>
              </Panel>
              {dots && <Background variant="dots" gap={12} size={1} />}
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
