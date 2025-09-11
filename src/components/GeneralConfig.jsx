import { useWorkflowContext } from "../WorkflowContext"
import { useRef, useState } from "react";
import useUndo from './Utils/Undo'
import TextInput from "./Utils/TextInput";
import useWorkflowUtils from "./Utils/WorkflowUtils";
import GenericLabel from "./Utils/GenericLabel";


export default function GeneralConfig(props){
    const {workflow, setWorkflow} = useWorkflowContext();
    const { updateWorkflow } = useUndo();
    const { applyWorkflowChanges } = useWorkflowUtils()
    const [ invocationIDType, setInvokationIDType] = useState("UUID")

    const handleBlur = () => {
        updateWorkflow(workflow);
    }
    
    const exampleUUID = useRef(crypto.randomUUID());

    const invokationIDInput = ( type ) => {
        switch (type) {
            case "Custom":
                return (
                    <TextInput value={workflow.InvocationID} onChange={(e) => {
                        applyWorkflowChanges( { InvocationID : e.target.value})
                    }} onBlur={handleBlur} placeholder={"custom-id"}></TextInput>
                )
            default : 
                return null                
        }
    }
    

    return(
        <div className="editor-panel">
            
            {/* Workflow properties */}
            <h1>Workflow properties</h1>

            {/* Workflow Name */}
            <GenericLabel required={true} value={"Workflow Name"} size={"20px"}>
            <TextInput value={workflow.WorkflowName} onChange={(e) => {

                applyWorkflowChanges( { WorkflowName : e.target.value})

            }} onBlur={handleBlur} placeholder={"workflow-name"}></TextInput>
            </GenericLabel>

            {/* Entry Point */}
            <div>
                <GenericLabel required={true} value={"Entry Point"} size={"20px"}>
                <select placeholder="funcInvokeNext" onChange={(e)=> updateWorkflow({
                    ...workflow,
                    FunctionInvoke : e.target.value
                    })
                    }
                            type="text" value={workflow.FunctionInvoke}>
                            
                            <option value={""}> NONE </option>
                            
                            {Object.entries(workflow.ActionList).map(([key]) => (
                            
                            <option value={key}>{key}</option>
                            ))}
                </select>
                </GenericLabel>
            </div>

            {/* Log */}
            <GenericLabel value={"Log File Name"} size={"20px"}>
            <TextInput value={workflow.FaaSrLog} onChange={(e) => {

                applyWorkflowChanges( { FaaSrLog : e.target.value})

            }} onBlur={handleBlur} placeholder={"workflow-name"}></TextInput>
            </GenericLabel>

            {/* Invocation Id */}
            <div style={{ display : "flex"}}>
                <GenericLabel value={"InvocationID"} size={"20px"}>
                <select style={ { alignSelf : "center"}} onChange={ (e) =>  { setInvokationIDType(e.target.value)}} >
                    <option value={"UUID"}>UUID</option>
                    <option value={"Timestamp"}>Timestamp</option>
                    <option value={"Custom"}>Custom</option>
                </select>
            </GenericLabel>
            </div>
            {
                invokationIDInput(invocationIDType)
            }

            
            {/* Data and Logs */}
            <h1>Data and logs</h1>

            {/* Default DataStore */}
            <div>
                <GenericLabel required={true} value={"Default Data Store"} size={"20px"}>
                <select placeholder="DefaultDataStore" onChange={(e)=>  updateWorkflow({
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
                </GenericLabel>
            </div>

            
            {/* Logging DataStore */}
            <div>
                <GenericLabel value={"Data Store for Logs"} size={"20px"}>
                <select placeholder="LoggingDataStore" onChange={(e)=> updateWorkflow({
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
                </GenericLabel>
            </div>

        </div>
    )
}
