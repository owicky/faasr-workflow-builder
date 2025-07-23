import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import Popup from "../Utils/Popup";
import useUndo from "../Utils/Undo";


export default function DataStoreCreator(props){
    const {workflow, setWorkflow} = useWorkflowContext();
    const [newName, setNewName] = useState("")
    const [ popupEnabled, setPopupEnabled] = useState(false)
    const { updateWorkflow } = useUndo();

    return(
        <>
            <button onClick={() => setPopupEnabled(true)}>Add New Data Store</button>
            <Popup enabled={popupEnabled} setEnabled={() => setPopupEnabled()}>
                <input type="text" placeholder="data_store_name" onChange={(e) => setNewName(e.target.value)}/>
                <button onClick={() => {

                    if (!/\s/.test(newName) && newName !== ""){
                        updateWorkflow({
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
                    }else{
                        alert("Data Store name must neither be empty nor contain whitespaces.")
                    }
                }
                }>Create New Data Store</button>
            </Popup>
        </>
    )
}
