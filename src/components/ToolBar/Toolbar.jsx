import { UploadWorkflow } from "./UploadWorkflow"
import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import Popup from "../Utils/Popup";
import GenericLabel from "../Utils/GenericLabel";
import { UploadLayout } from "./UploadLayout";

export default function Toolbar(props) {
    const {workflow, edges, nodes} = useWorkflowContext();
    const [ downloadPopupEnabled, setDownloadPopupEnabled ] = useState(false)
    const [ uploadPopupEnabled, setUploadPopupEnabled ] = useState(false)
    const [ workflowName, setWorkflowName ] = useState("")
    const downloadWorkflowJson = (name) => {
        
        const blob = new Blob([JSON.stringify(workflow, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name+".json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadLayoutJson = (name) => {
        const layout = {nodes : nodes,
                        edges : edges}
        const blob = new Blob([JSON.stringify(layout, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name+"-layout.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    return(
        <div id="toolbar" style={{ width: '100vw', height: '5vh'}}>
            <button onClick={() => setUploadPopupEnabled(true)}>Upload</button>
            <Popup enabled={uploadPopupEnabled} setEnabled={() => setUploadPopupEnabled()} >
                <UploadWorkflow createEdge={ props.createEdge } createNode={props.createNode} workflow_template={props.workflow_template}/>
                <UploadLayout createEdge={ props.createEdge } createNode={props.createNode} workflow_template={props.workflow_template} />
            </Popup>
            <button onClick={() => setDownloadPopupEnabled(true)}>Download</button>
            <Popup enabled={downloadPopupEnabled} setEnabled={() => setDownloadPopupEnabled()} >
                <GenericLabel value={"Name Your Workflow"} size={"20px"}></GenericLabel>
                <input placeholder="workflow-name" type="text" onChange={ (e) => setWorkflowName( e.target.value)} value={ workflowName}/>
                <button onClick={() => downloadWorkflowJson(workflowName)}>Download Workflow JSON</button>
                <button onClick={() => downloadLayoutJson(workflowName)}>Download Layout JSON</button>
            </Popup>
            
            <button onClick={() => props.setEditType("DataStores")}>EditDataStores</button>
            <button onClick={() => props.setEditType("ComputeServers")}>EditComputeServers</button>
            <button onClick={() => props.setEditType("Functions")}>EditFunctions</button>
            <button onClick={() => props.setEditType("GeneralConfig")}>GeneralConfig</button>
            <button onClick={() => props.toggleWorkflowVisible()}>Toggle Workflow</button>
            <button onClick={() => props.toggleGraphVisible()}>Toggle Graph</button>
        </div>
    )
}
