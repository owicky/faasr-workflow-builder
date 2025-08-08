import {createContext, useContext, useState} from "react";

const WorkflowContext = createContext();


//  Provides the Workflow, Edges, and Nodes to children wrapped within
export const WorkflowProvider = ( {children} ) => {

    


    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const [selectedFunctionId, setSelectedFunctionId] = useState(null)

    const [deletedActions, setDeletedActions] = useState([]);

    
    const [workflow, setWorkflow] = useState({
        FunctionList : {},
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

    return(
        <WorkflowContext.Provider value={{
            nodes, setNodes,
            edges, setEdges,
            selectedFunctionId, setSelectedFunctionId,
            deletedActions, setDeletedActions,
            workflow, setWorkflow,
            history, setHistory,
            undoHistory, setUndoHistory
        }}>

            {children}
        </WorkflowContext.Provider>
    )
}

export const useWorkflowContext = () => useContext(WorkflowContext);
