import { UploadWorkflow } from "./UploadWorkflow"
import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import Popup from "../Utils/Popup";
import GenericLabel from "../Utils/GenericLabel";
import { UploadLayout } from "./UploadLayout";
import schema from "../../assets/webui-workflow-schema.json"
// import schema from "../../assets/webui-workflow-schema-new.json"

export default function Toolbar(props) {
    const {workflow, edges, nodes, } = useWorkflowContext();
    const [ downloadPopupEnabled, setDownloadPopupEnabled ] = useState(false)
    const [ uploadPopupEnabled, setUploadPopupEnabled ] = useState(false)

    var validator = require('is-my-json-valid')
    var validate = validator(schema, {
        greedy : true
    })

    const downloadWorkflowJson = (name) => {

        const strippedWorkflow = stripRemovedActions(workflow)
        const cleanedWorkflow = cleanObject({...strippedWorkflow})

        if (!(cleanedWorkflow.FunctionInvoke in cleanedWorkflow.FunctionList)) {
            alert(`The workflow's starting point (${cleanedWorkflow.FunctionInvoke}) must be in the graph`);
            return
        }
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

    function stripRemovedActions(workflow) {
        let newWorkflow = structuredClone(workflow)
        Object.values(newWorkflow.FunctionList).forEach( (key, value) => {

            if (!nodes.some( (node) => node.id === key)) {
                delete newWorkflow.FunctionList[key];
            }else{
                // remove edges to nodes not in layout
                newWorkflow.FunctionList[key].InvokeNext = newWorkflow.FunctionList[key].InvokeNext.filter(
                    ( (id) => nodes.some( (node) => node.id === id))
                );
            }

        });
        return newWorkflow;
    }

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
            {/* <button onClick={() => testFunc()}>TEST BUTTON</button> */}

            <button onClick={() => setUploadPopupEnabled(true)}>Upload</button>
            <Popup enabled={uploadPopupEnabled} setEnabled={() => setUploadPopupEnabled()} >
                <UploadWorkflow setLayout={() => props.setLayout()} createNewEdge={ props.createNewEdge } createNewNode={props.createNewNode} workflow_template={props.workflow_template} updateWorkflowAndLayout={props.updateWorkflowAndLayout} setUploadPopupEnabled={setUploadPopupEnabled}/>
                <UploadLayout createEdge={ props.createEdge } createNode={props.createNode} workflow_template={props.workflow_template} setUploadPopupEnabled={setUploadPopupEnabled} />
            </Popup>

            <button onClick={() => setDownloadPopupEnabled(true)}>Download</button>
            <Popup enabled={downloadPopupEnabled} setEnabled={() => setDownloadPopupEnabled()}>
                <GenericLabel value={"Download Options for Workflow: "+workflow.WorkflowName} size="20px"></GenericLabel>

                <button onClick={() => downloadWorkflowJson(workflow.WorkflowName)}>Download {workflow.WorkflowName}.json</button>
                <button onClick={() => downloadLayoutJson(workflow.WorkflowName)}>Download {workflow.WorkflowName}-layout.json</button>
            </Popup>
            <div style={{width : 5}}></div>
            <button onClick={() => props.setEditType("DataStores")}>Edit Data Stores</button>
            <button onClick={() => props.setEditType("ComputeServers")}>Edit Compute Servers</button>

            <button onClick={() => props.setEditType("Functions")}>Edit Actions/Functions</button>
            <div style={{width : 5}}></div>
            <button onClick={() => props.setEditType("GeneralConfig")}>Workflow Settings</button>
            <div style={{width : 5}}></div>
            <button onClick={() => props.toggleWorkflowVisible()}>Toggle Workflow</button>

            <button onClick={() => props.toggleGraphVisible()}>Toggle Graph</button>

            {/* Workflow Name Banner */}
            <span style={{
                        position: 'absolute',
                        top: 5,
                        right: 10,
                        background: '#eee',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        padding: '2px 5px',
                        color: '#333',
            }}>{"Workflow Name: " + (workflow.WorkflowName)}</span>
        </div>
    )
}
