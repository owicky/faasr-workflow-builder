import { useEffect } from "react"
import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";
import ComputeServerPropertyEditor from "./ComputeServerPropertyEditor";
import useWorkflowUtils from "../Utils/WorkflowUtils";
import GenericLabel from "../Utils/GenericLabel";

export default function ComputeServerEditor(props){
    const {workflow} = useWorkflowContext();
    const server = props.server || Object.keys(workflow.ComputeServers)[0]
    const { updateWorkflow } = useUndo();

    const handleBlur = (e) => {
        updateWorkflow(workflow);
    };

    useEffect(() => {
        if (!(server in workflow.ComputeServers)) {
            props.setServer(null);
        }
    }, [server, workflow.ComputeServers, props.setServer]);


    if(server in workflow.ComputeServers){
        const type = workflow.ComputeServers[server].FaaSType
        return (
            <div style={{ }}>
                <h1>{server}</h1>


                {/* UserName */}
                {["SLURM", "GitHubActions"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="UserName" required={true}/>
                ) : null}  
                
                {/* ActionRepoName */}
                {["GitHubActions"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="ActionRepoName" required={true}/>
                ) : null}                  
                
                {/* Branch */}
                {["GitHubActions"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="Branch" />
                ) : null}                  
                
                {/* Endpoint */}
                {["SLURM", "OpenWhisk"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="Endpoint" required={true} />
                ) : null}

                {/* Namespace */}
                {["GoogleCloud","OpenWhisk"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="Namespace" required={true}/>
                ) : null}
                
                {/* Region */}
                {["Lambda", "GoogleCloud"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="Region" required={true} />
                ) : null}  

                {/* ClientEmail */}
                {["GoogleCloud"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="ClientEmail" required={true}/>
                ) : null}

                {/* APIVersion */}
                {["SLURM"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="APIVersion" required={true}/>
                ) : null}

                {/* Partition */}
                {["SLURM"].includes(type) ? (
                    <ComputeServerPropertyEditor type={type} server={server} property="Partition" required={true}/>
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
    }
    return(
        <h1>NO COMPUTE SERVER SELECTED</h1>
    )
}
