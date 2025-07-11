import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"


export default function ComputeServerCreator(props){
    const {workflow, setWorkflow} = useWorkflowContext();
    const [newName, setNewName] = useState("")
    
    return(
        <>
            <button onClick={() =>
                setWorkflow({
                    ...workflow,
                    ComputeServers: {
                        ...workflow.ComputeServers,
                        [newName]: {
                            FaaSType: "None",
                            Region:"",
                            Endpoint:"",
                            Namespace:"",
                            UserName:"",
                            ActionRepoName:"",
                            Branch: "",
                        }
                    }
            })
            }>Create New Compute Server</button>
            <input type="text" placeholder="ServerName" onChange={(e) => setNewName(e.target.value)}/>
        </>
    )
}