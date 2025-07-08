import {createContext, useContext, useState} from "react";

const WorkflowContext = createContext();



//  Provides the Workflow, Edges, and Nodes to children wrapped within
export const WorkflowProvider = ( {children} ) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    
    const [functions, setFunctions] = useState([]);
    
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
        InvocationID : ""
    });

    return(
        <WorkflowContext.Provider value={{
            nodes, setNodes,
            edges, setEdges,
            functions, setFunctions,
            workflow, setWorkflow
        }}>

            {children}
        </WorkflowContext.Provider>
    )
}

export const useWorkflowContext = () => useContext(WorkflowContext);