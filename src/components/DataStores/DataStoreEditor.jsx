import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";

export default function DataStoreEditor(props){
    const {workflow } = useWorkflowContext();
    const id = props.id
    const { updateWorkflow } = useUndo();

    if(id in workflow.DataStores){
        return(
            <div style={{ }}>
                <h1>Function ID: {id}</h1>

                <div>
                    <button>Endpoint</button>
                    <input type="text" placeholder="Endpoint" onChange={(e)=>updateWorkflow({
                        ...workflow,
                        DataStores: {
                            ...workflow.DataStores,
                            [id]: {
                            ...workflow.DataStores[id],
                            Endpoint: e.target.value
                            }
                        }
                    })} value={workflow.DataStores[id].Endpoint}/>
                </div>

                <div>
                    <button>Bucket</button>
                    <input type="text" placeholder="Bucket" onChange={(e)=>updateWorkflow({
                        ...workflow,
                        DataStores: {
                            ...workflow.DataStores,
                            [id]: {
                            ...workflow.DataStores[id],
                            Bucket: e.target.value
                            }
                        }
                    })} value={workflow.DataStores[id].Bucket}/>
                </div>

                <div>
                    <button>Region</button>
                    <input type="text" placeholder="Region" onChange={(e)=>updateWorkflow({
                        ...workflow,
                        DataStores: {
                            ...workflow.DataStores,
                            [id]: {
                            ...workflow.DataStores[id],
                            Region: e.target.value
                            }
                        }
                    })} value={workflow.DataStores[id].Region}/>
                </div>

                <div>
                    <button>Writable</button>
                    <select 
                        value={workflow.DataStores[id].Writable}
                        onChange={(e)=>updateWorkflow({
                        ...workflow,
                        DataStores: {
                            ...workflow.DataStores,
                            [id]: {
                            ...workflow.DataStores[id],
                            Writable: e.target.value
                            }
                        }
                    })}>
                        <option value={"TRUE"}>TRUE</option>
                        <option value={"FALSE"}>FALSE</option>
                    </select>
                </div>
                <br></br>
                <button style={{color:"red"}} onClick={() => {
                    const dataStoreToDelete = id
                    let newWorkflow = structuredClone(workflow);
                    delete newWorkflow.DataStores[dataStoreToDelete];
                    updateWorkflow(newWorkflow);
                    props.setDataStore(null)
                }}>Delete Data Store</button>
            </div>
        )
    }
    return(
        <h1>NO DATA STORE SELECTED</h1>
    )
}
