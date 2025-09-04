import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import ComputeServerEditor from "./ComputeServerEditor";
import ComputeServerCreator from "./ComputeServerCreator";

export default function ComputeServersPanel(){
    const {workflow} = useWorkflowContext();
    const [server, setServer] = useState(null);


    return(
        <div className="editor-panel" style={{width: '30vw', height: '100%'}}>
            <h1>ComputeServers</h1>
            {Object.entries(workflow.ComputeServers).map(([key, val], i) => (
                <>
                    <button onClick={() => setServer(key)}>
                        {key}
                    </button>
                </>
            ))}
            <br></br>
            <ComputeServerCreator setServer={setServer} />
            <ComputeServerEditor setServer={setServer} server={server}/>
        </div>
    )
}
