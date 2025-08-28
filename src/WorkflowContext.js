import {createContext, useContext, useState} from "react";
import Dagre from '@dagrejs/dagre';

const WorkflowContext = createContext();


//  Provides the Workflow, Edges, and Nodes to children wrapped within
export const WorkflowProvider = ( {children} ) => {

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const [selectedFunctionId, setSelectedFunctionId] = useState(null)

    const [deletedActions, setDeletedActions] = useState([]);

    
    const [workflow, setWorkflow] = useState({
        ActionList : {},
        ComputeServers : {},
        DataStores : {},
        ActionContainers : {},
        FunctionInvoke : "None",
        DefaultDataStore : "None",
        FunctionGitRepo : {},
        FunctionCRANPackage : {},
        FunctionGitHubPackage : {},
        FaaSrLog : "",
        LoggingDataStore : "",
        InvocationID : "",
        WorkflowName : "unnamed-workflow"
    });

    const [history, setHistory] = useState([{
        nodes: [],
        edges: [],
        selectedFunctionId: null,
        deletedActions: [],
        workflow: structuredClone(workflow)
    }]);
    const [undoHistory, setUndoHistory] = useState([]);

    // Uses Dagre to apply layout
    const getLayoutedElements = (nodes, edges, options) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: options.direction });
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 172,
        height: node.measured?.height ?? 52,
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

    return(
        <WorkflowContext.Provider value={{
            nodes, setNodes,
            edges, setEdges,
            selectedFunctionId, setSelectedFunctionId,
            deletedActions, setDeletedActions,
            workflow, setWorkflow,
            history, setHistory,
            undoHistory, setUndoHistory,
            getLayoutedElements
        }}>

            {children}
        </WorkflowContext.Provider>
    )
}

export const useWorkflowContext = () => useContext(WorkflowContext);
