import { UploadWorkflow } from "./UploadWorkflow"
import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import Popup from "../Utils/Popup";
import GenericLabel from "../Utils/GenericLabel";
import { UploadLayout } from "./UploadLayout";
import schema from "../../assets/webui-workflow-schema.json"

export default function Toolbar(props) {
    const {workflow, edges, nodes} = useWorkflowContext();
    const [ downloadPopupEnabled, setDownloadPopupEnabled ] = useState(false)
    const [ uploadPopupEnabled, setUploadPopupEnabled ] = useState(false)
    const [ workflowName, setWorkflowName ] = useState("")

    var validator = require('is-my-json-valid')
    var validate = validator(schema, {
        greedy : true
    })

    const downloadWorkflowJson = (name) => {
        const cleanedWorkflow = cleanObject({...workflow})

        if (!validate(cleanedWorkflow, { verbose: true})){ // If violates Schema
            // console.log(validate.errors)
            const errorMsg = validate.errors.map((error, i) => {
                const fieldName = error.field;
                return `• ${fieldName}: ${error.message}`;
            }).join('\n');

            alert("The workflow is incomplete:\n\n" + errorMsg);
            return
        }
        
        const blob = new Blob([JSON.stringify(workflow, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);

    };

    function cleanObject(object) {
        // Type matched object or array to be poppulated and returned
        const result = Array.isArray(object) ? [] : {}; 

        for (const [key, value] of Object.entries(object)) { // For each child

            if (value === "" || value === null) {// Skip if empty
                continue; 
            }

            if (typeof value === 'object') { // If type is another object
                const cleaned = cleanObject(value); // Recurse

                if ( // Skip if empty after cleaning children 
                    (typeof cleaned === 'object' && cleaned !== null && // null object
                    ((Array.isArray(cleaned) && cleaned.length === 0) || // empty list
                    (!Array.isArray(cleaned) && Object.keys(cleaned).length === 0))) // Empty object
                ) {
                    continue;
                }

                result[key] = cleaned; // Set selected child to cleaned self
            } else { // nonempty, return value
                result[key] = value;
            }
        }

        return result;
    }

    const downloadLayoutJson = (name) => {
        const layout = {nodes : nodes,
                        edges : edges}
        const blob = new Blob([JSON.stringify(layout, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name+"-layout";
        a.click();
        URL.revokeObjectURL(url);
    };


    return(
        <div id="toolbar" style={{ width: '100vw', height: '5vh'}}>
            {/* <button onClick={() => validateWithSchema()}>TEST BUTTON</button> */}

            <button onClick={() => setUploadPopupEnabled(true)}>Upload</button>
            <Popup enabled={uploadPopupEnabled} setEnabled={() => setUploadPopupEnabled()} >
                <UploadWorkflow setLayout={() => props.setLayout()} createEdge={ props.createEdge } createNode={props.createNode} workflow_template={props.workflow_template}/>
                <UploadLayout createEdge={ props.createEdge } createNode={props.createNode} workflow_template={props.workflow_template} />
            </Popup>

            <button onClick={() => setDownloadPopupEnabled(true)}>Download</button>
            <Popup enabled={downloadPopupEnabled} setEnabled={() => setDownloadPopupEnabled()}>
                <GenericLabel value={"Name Your Workflow"} size="20px"></GenericLabel>
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
