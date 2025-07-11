import { useWorkflowContext } from "../../WorkflowContext"

export default function DataStoreEditor(props){
    const {workflow, setWorkflow} = useWorkflowContext();
    const id = props.id

    if(id != null){
        return(
            <div style={{ }}>
                <h1>Function ID: {id}</h1>

                <div>
                    <button>Endpoint</button>
                    <input type="text" placeholder="Endpoint" onChange={(e)=>setWorkflow({
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
                    <input type="text" placeholder="Bucket" onChange={(e)=>setWorkflow({
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
                    <input type="text" placeholder="Region" onChange={(e)=>setWorkflow({
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
                    <select onChange={(e)=>setWorkflow({
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
                    delete workflow.DataStores[dataStoreToDelete]
                    props.setDataStore(null)
                }}>Delete Data Store</button>
            </div>
        )
    }
    return(
        <h1>NO DATA STORE SELECTED</h1>
    )
}
