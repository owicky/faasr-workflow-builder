import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";
import ComputeServerPropertyEditor from "./ComputeServerPropertyEditor";
import useWorkflowUtils from "../Utils/WorkflowUtils";

export default function ComputeServerEditor(props){
    const {workflow, setWorkflow, setNodes, nodes} = useWorkflowContext();
    const server = props.server
    const { updateWorkflow } = useUndo();
    const { applyWorkflowChanges } = useWorkflowUtils()

    const handleBlur = (e) => {
        updateWorkflow(workflow);
    };

    const handleSwitchComputeServer = (e) => {
            const newType = e.target.value
                switch (newType){
                    case "Lambda":
                        updateWorkflow({
                            ...workflow,
                            ComputeServers: {
                                ...workflow.ComputeServers,
                                [server]: {
                                ...workflow.ComputeServers[server],
                                
                                    FaaSType: e.target.value,
                                    Region: workflow.ComputeServers[server].Region ? workflow.ComputeServers[server].Region : "" 
                                }
                            }
                        })
                        break;
                    case "OpenWhisk": 
                        updateWorkflow({
                            ...workflow,
                            ComputeServers: {
                                ...workflow.ComputeServers,
                                [server]: {
                                ...workflow.ComputeServers[server],
                                
                                    FaaSType: e.target.value,
                                    Endpoint: workflow.ComputeServers[server].Endpoint ? workflow.ComputeServers[server].Endpoint : "",
                                    Namespace: workflow.ComputeServers[server].Namespace ? workflow.ComputeServers[server].Namespace : ""
                                }
                            }
                        })
                        break;
                    case "GitHubActions":
                        updateWorkflow({
                            ...workflow,
                            ComputeServers: {
                                ...workflow.ComputeServers,
                                [server]: {
                                ...workflow.ComputeServers[server],
                                
                                    FaaSType: e.target.value,
                                    UserName: workflow.ComputeServers[server].UserName ? workflow.ComputeServers[server].UserName : "",
                                    ActionRepoName: workflow.ComputeServers[server].ActionRepoName ? workflow.ComputeServers[server].ActionRepoName : ""
                                }
                            }
                        })
                        break;

                }
        }

    if(server in workflow.ComputeServers){
        const type = workflow.ComputeServers[server].FaaSType
        return (
            <div style={{ }}>
                <h1>Function ID: {server}</h1>

                <div>
                    <button>FaaSType</button>
                    <select key={server+"-FaasType-input"} value={workflow.ComputeServers[server].FaaSType} onChange={
                        (e)=>{
                            applyWorkflowChanges({
                                ComputeServers: {
                                    [server]: {
                                        ["FaaSType"]: e.target.value
                                    }
                                }
                            })
                        }}>
                        <option value={"None"}>None</option>
                        <option value={"GitHubActions"}>GitHubActions</option>
                        <option value={"OpenWhisk"}>OpenWhisk</option>
                        <option value={"Lambda"}>Lambda</option>
                        <option value={"SLURM"}>SLURM</option>
                        <option value={"GoogleCloud"}>GoogleCloud</option>
                    </select>
                </div>

                {/* UserName */}
                {["SLURM", "GitHubActions"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="UserName" />
                ) : null}  
                
                {/* ActionRepoName */}
                {["GitHubActions"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="ActionRepoName" />
                ) : null}                  
                
                {/* Branch */}
                {["GitHubActions"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="Branch" />
                ) : null}                  
                
                {/* Endpoint */}
                {["SLURM", "OpenWhisk"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="Endpoint" />
                ) : null}

                {/* NameSpace */}
                {["GoogleCloud","OpenWhisk"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="NameSpace" />
                ) : null}
                
                {/* Region */}
                {["Lambda", "GoogleCloud", "OpenWhisk"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="Region" />
                ) : null}  

                {/* Delete Compute Server Button */}
                <button style={{color:"red"}} onClick={() => {
                    const serverToDelete = server
                    let newWorkflow = structuredClone(workflow);
                        delete newWorkflow.ComputeServers[serverToDelete]
                    props.setServer(null)
                    updateWorkflow(newWorkflow);
                }}>Delete Compute Server</button>
                
            </div> 
        )
    }else{
        props.setServer(null);
    }
    return(
        <h1>NO COMPUTE SERVER SELECTED</h1>
    )
}
