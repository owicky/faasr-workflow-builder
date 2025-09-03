import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import Popup from "../Utils/Popup";
import useUndo from "../Utils/Undo";


export default function ComputeServerCreator(props){
    const {workflow, setWorkflow} = useWorkflowContext();
    const [newName, setNewName] = useState("")
    const [newType, setNewType] = useState("")
    const [ popupEnabled, setPopupEnabled] = useState(false)
    const { updateWorkflow } = useUndo();

    return(
        <>
            <button onClick={() => setPopupEnabled(true)}>Add New Compute Server</button>
            <Popup enabled={popupEnabled} setEnabled={() => setPopupEnabled()}>
                <input type="text" placeholder="Compute-server-name" onChange={(e) => setNewName(e.target.value)}/>
                <select onChange={
                    (e)=>{
                        setNewType(e.target.value)
                    }}>
                    <option value={"None"}>None</option>
                    <option value={"GitHubActions"}>GitHubActions</option>
                    <option value={"OpenWhisk"}>OpenWhisk</option>
                    <option value={"Lambda"}>Lambda</option>
                </select>
                <button onClick={() => {

                    if (!/\s/.test(newName) && newName !== ""){
                        updateWorkflow({
                        ...workflow,
                        ComputeServers: {
                            ...workflow.ComputeServers,
                            [newName]: {
                                FaaSType: newType,
                                    Region:"",
                                    Endpoint:"",
                                    Namespace:"",
                                    UserName:"",
                                    ActionRepoName:"FaaSr-Workflows",
                                    Branch: "main",
                                }
                            }
                        })
                    }
                    else{
                        alert("FaaS server name must neither be empty nor contain whitespaces.")
                    }
                }
            }>Create New Compute Server</button>
            </Popup>
        </>
    )
}
