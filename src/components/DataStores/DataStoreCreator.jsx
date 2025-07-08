import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"


export default function DataStoreCreator(props){
    const {workflow, setWorkflow} = useWorkflowContext();
    const [newName, setNewName] = useState("")
    
    return(
        <>
            <button onClick={() =>
                setWorkflow({
                    ...workflow,
                    DataStores: {
                        ...workflow.DataStores,
                        [newName]: {
                            Endpoint: "",
                            Bucket: "",
                            Region: "",
                            Writable: ""
                        }
                    }
            })
            }>Create New Data Store</button>
            <input type="text" placeholder="Name" onChange={(e) => setNewName(e.target.value)}/>
        </>
    )
}