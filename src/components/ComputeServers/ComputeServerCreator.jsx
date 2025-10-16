import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import Popup from "../Utils/Popup";
import useUndo from "../Utils/Undo";


export default function ComputeServerCreator(props){
    const {workflow} = useWorkflowContext();
    const [newType, setNewType] = useState("GitHubActions")
    const [ popupEnabled, setPopupEnabled] = useState(false)
    const { updateWorkflow } = useUndo();

    const computeServerDefaults = {
        "GitHubActions": { prefix : "GH", UseSecretStore : true },
        "OpenWhisk": { prefix : "OW", UseSecretStore : false },
        "Lambda": { prefix : "AWS", UseSecretStore : true },
        "SLURM": { prefix : "SLURM", UseSecretStore : false },
        "GoogleCloud": { prefix : "GCP", UseSecretStore : true },
    }

    const setPopupEnabledAndRestoreDefaultComputeServer = (enabled) => {
        if (!enabled) setNewType('GitHubActions');
        setPopupEnabled(enabled);
    }

    return(
        <>
            <button onClick={() => setPopupEnabled(true)}>Add New Compute Server</button>
            <Popup enabled={popupEnabled} setEnabled={() => setPopupEnabledAndRestoreDefaultComputeServer()}>
                <select defaultValue={newType} onChange={
                    (e)=>{
                        setNewType(e.target.value)
                    }}>
                    <option value={"GitHubActions"}>GitHubActions</option>
                    <option value={"OpenWhisk"}>OpenWhisk</option>
                    <option value={"Lambda"}>Lambda</option>
                    <option value={"SLURM"}>SLURM</option>
                    <option value={"GoogleCloud"}>GoogleCloud</option>
                </select>
                <button onClick={() => {

                    const newName = computeServerDefaults[newType].prefix;

                    if (newName in workflow.ComputeServers) {
                        console.log('Identical server already exists');
                    }
                    else if (newName){
                        updateWorkflow({
                        ...workflow,
                        ComputeServers: {
                            ...workflow.ComputeServers,
                            [newName]: {
                                FaaSType: newType || "GitHubActions"
                                }
                            }
                        })
                        props.setServer(newName);
                        setPopupEnabled(false);
                    }
                    else{
                        alert(`Compute server type ${newType} wasn't recognized`);
                    }
                }
            }>Create New Compute Server</button>
            </Popup>
        </>
    )
}
