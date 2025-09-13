import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";
import GenericLabel from "../Utils/GenericLabel";

export default function DataStoreEditor(props){
    const {workflow, setWorkflow } = useWorkflowContext();
    const id = props.id
    const { updateWorkflow } = useUndo();

    const handleBlur = (e) => {
        updateWorkflow(workflow);
    };

    if(id in workflow.DataStores){
        return(
            <div id="datastore-editor">
                <h1>Function ID: {id}</h1>

                <GenericLabel value={"Endpoint"} size={"20px"}>
                    <input type="text" placeholder="https://play.min.io" onChange={(e)=>setWorkflow({
                        ...workflow,
                        DataStores: {
                            ...workflow.DataStores,
                            [id]: {
                            ...workflow.DataStores[id],
                            Endpoint: e.target.value
                            }
                        }
                    })} 
                        onBlur={handleBlur}
                        value={workflow.DataStores[id].Endpoint}
                    />
                </GenericLabel>


                <GenericLabel value={"Bucket"} size={"20px"} required={true}>
                    <input type="text" placeholder="my_bucket" onChange={(e)=>setWorkflow({
                        ...workflow,
                        DataStores: {
                            ...workflow.DataStores,
                            [id]: {
                            ...workflow.DataStores[id],
                            Bucket: e.target.value
                            }
                        }
                    })} 
                        onBlur={handleBlur}
                        value={workflow.DataStores[id].Bucket}
                    />
                </GenericLabel>

                <GenericLabel value={"Region"} size={"20px"}>
                    <input type="text" placeholder="us-east-1" onChange={(e)=>setWorkflow({
                        ...workflow,
                        DataStores: {
                            ...workflow.DataStores,
                            [id]: {
                            ...workflow.DataStores[id],
                            Region: e.target.value
                            }
                        }
                    })} 
                        onBlur={handleBlur}
                        value={workflow.DataStores[id].Region}
                    />
                </GenericLabel>


                <GenericLabel value={"Writable"} size={"20px"}>
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
                </GenericLabel>

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
