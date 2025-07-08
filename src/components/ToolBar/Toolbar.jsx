import { UploadWorkflow } from "./UploadWorkflow"
import { useWorkflowContext } from "../../WorkflowContext"

export default function Toolbar(props) {
    const {workflow} = useWorkflowContext();

    const testFunction = () => {
        
        const blob = new Blob([JSON.stringify(workflow, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dWorkflow.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return(
        <div id="toolbar" style={{ width: '100vw', height: '5vh'}}>
            <UploadWorkflow createEdge={ props.createEdge } createNode={props.createNode} workflow_template={props.workflow_template}/>
            <button onClick={() => testFunction()}>Download</button>
            {/* <button>Download Workflow</button> */}
            {/* <div>
                <CreateNodeButton workflow={props.workflow} createEdge={ props.createEdge } createNode={props.createNode} id={newFuncId}/>
                <input type="text" placeholder="New Func Id" onChange={(e)=>setnewFuncId(e.target.value)} value={newFuncId}/>            
            </div> */}
            <button onClick={() => props.setEditType("DataStores")}>EditDataStores</button>
            <button onClick={() => props.setEditType("ComputeServers")}>EditComputeServers</button>
            <button onClick={() => props.setEditType("Functions")}>EditFunctions</button>
            <button onClick={() => props.setEditType("GeneralConfig")}>GeneralConfig</button>
            <button onClick={() => props.toggleWorkflowVisible()}>Toggle Workflow</button>
            <button onClick={() => props.toggleGraphVisible()}>Toggle Graph</button>
        </div>
    )
}
