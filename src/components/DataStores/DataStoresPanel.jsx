import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import DataStoreEditor from "./DataStoreEditor";
import DataStoreCreator from "./DataStoreCreator";

export default function DataStoresPanel(){
    const {workflow} = useWorkflowContext();
    const [dataStore, setDataStore] = useState(null);

    return(
        <div style={{width: '100%', height: '100%'}}>
            <h1>DataStores</h1>
            {Object.entries(workflow.DataStores).map(([key, val], i) => (
                <>
                    <button onClick={() => setDataStore(key)}>
                        {key}
                    </button>

                </>
            ))}
            <br></br>
            <DataStoreCreator setDataStore={setDataStore}/>
            <DataStoreEditor setDataStore={setDataStore} id={dataStore}/>
            {/* <h1>{JSON.stringify(workflow.DataStores[dataStore], null, 2) }</h1> */}
        </div>
    )
}
