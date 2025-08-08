import { useWorkflowContext } from "../WorkflowContext"
import { useRef } from "react";

export default function GeneralConfig(props){
    const {workflow, setWorkflow} = useWorkflowContext();

    

    
    const exampleUUID = useRef(crypto.randomUUID());

    return(
        <div className="editor-panel">
            <h1>Data Server Assignment</h1>

            {/* Default DataStore */}
            <div>
                <button>Default Data Server</button>
                <select placeholder="DefaultDataStore" onChange={(e)=> setWorkflow({
                    ...workflow,
                    DefaultDataStore : e.target.value
                    })
                    }
                            type="text" value={workflow.DefaultDataStore}>
                            
                            <option value={""}> NONE </option>
                            
                            {Object.entries(workflow.DataStores).map(([key]) => (
                            
                            <option value={key}>{key}</option>
                            ))}
                </select>
            </div>

            
            {/* Logging DataStore */}
            <div>
                <button>Data Server to Store Logs</button>
                <select placeholder="LoggingDataStore" onChange={(e)=> setWorkflow({
                    ...workflow,
                    LoggingDataStore : e.target.value
                    })
                    }
                            type="text" value={workflow.LoggingDataStore}>
                            
                            <option value={""}> NONE </option>
                            
                            {Object.entries(workflow.DataStores).map(([key]) => (
                            
                            <option value={key}>{key}</option>
                            ))}
                </select>
            </div>

            <h1>Other</h1>

            {/* Workflow Name */}
            <div>
                <button>Workflow Name</button>
                <input type="text" placeholder="workflow" onChange={(e)=>setWorkflow({
                    ...workflow,
                    WorkflowName : e.target.value
                    
                })} value={workflow.WorkflowName}/>
            </div>

            {/* Function Invoke */}
            <div>
                <button>First Function to Execute</button>
                <select placeholder="funcInvokeNExt" onChange={(e)=> setWorkflow({
                    ...workflow,
                    FunctionInvoke : e.target.value
                    })
                    }
                            type="text" value={workflow.FunctionInvoke}>
                            
                            <option value={""}> NONE </option>
                            
                            {Object.entries(workflow.FunctionList).map(([key]) => (
                            
                            <option value={key}>{key}</option>
                            ))}
                </select>
            </div>

            {/* FaaSR Log */}
            <div>
                <button>Log File Name</button>
                <input type="text" placeholder="FaaSrLog" onChange={(e)=>setWorkflow({
                    ...workflow,
                    FaaSrLog : e.target.value
                    
                })} value={workflow.FaaSrLog}/>
            </div>

            {/* Invocation Id */}
            <div>
                <button>InvocationID (Optional/UUID Format)</button>
                <input type="text" placeholder={exampleUUID.current} onChange={(e)=>setWorkflow({
                    ...workflow,
                    InvocationID : e.target.value
                    
                })} />
            </div>

        </div>
    )
}
