import { UploadWorkflow } from "./UploadWorkflow"
import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import Popup from "../Utils/Popup";
import GenericLabel from "../Utils/GenericLabel";
import { UploadLayout } from "./UploadLayout";
import schemaNew from "../../assets/webui-workflow-schema-new.json"
import GenericButton from "../Utils/GenericButton";
import { IoMdSettings } from "react-icons/io";
import { FaDownload, FaUpload } from "react-icons/fa6";
import { FaDatabase  } from "react-icons/fa";
import { FaServer  } from "react-icons/fa6";
import { FaSitemap } from "react-icons/fa"
import useLayoutUtils from "../Utils/LayoutUtils";
import useWorkflowUtils from "../Utils/WorkflowUtils";
import useWorkflowAndLayoutUtils from "../Utils/WorkflowAndLayoutUtils";
import axios from "axios";

export default function Toolbar(props) {
    const {workflow, edges, nodes, } = useWorkflowContext();
    const [ downloadPopupEnabled, setDownloadPopupEnabled ] = useState(false)
    const [ uploadPopupEnabled, setUploadPopupEnabled ] = useState(false)
    const { addEdge, deleteEdge, updateEdge, addNode, deleteNode, updateNode } = useLayoutUtils()
    const { applyWorkflowChanges, deleteAction, addInvoke, updateAction, addAction, updateInvoke} = useWorkflowUtils()
    const { createActionAndNode, deleteActionAndNode, createInvokeAndEdge} = useWorkflowAndLayoutUtils()

    const downloadWorkflowJson = (name) => {

        const validator = require('is-my-json-valid')
            const validate = validator(schemaNew, {
            greedy : true
        })

        const strippedWorkflow = stripRemovedActions(workflow)
        const cleanedWorkflow = cleanObject({...strippedWorkflow})
        // console.log(cleanedWorkflow)


        if (!(cleanedWorkflow.FunctionInvoke in cleanedWorkflow.ActionList)) {
            alert(`The workflow's starting point (${cleanedWorkflow.FunctionInvoke}) must be in the graph`);
            return
        }

        if (!validate(cleanedWorkflow, { verbose: true})){ // If violates Schema
            const errorMsg = validate.errors.map((error, i) => {
                const fieldName = error.field;
                return `• ${fieldName}: ${error.message}`;
            }).join('\n');

            alert("The workflow is incomplete:\n\n" + errorMsg);
            return
        }
    

        const blob = new Blob([JSON.stringify(cleanedWorkflow, null, 2)], {
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
        Object.values(newWorkflow.ActionList).forEach( (key, value) => {

            if (!nodes.some( (node) => node.id === key)) {
                delete newWorkflow.ActionList[key];
            }else{
                // remove edges to nodes not in layout
                newWorkflow.ActionList[key].InvokeNext = newWorkflow.ActionList[key].InvokeNext.filter(
                    ( (id) => nodes.some( (node) => node.id === id))
                );
            }

        });
        return newWorkflow;
    }

    function cleanObject(object) {
        if (Array.isArray(object)) {
            // Clean each array element, drop empties
            return object
                .map(item => cleanObject(item))
                .filter( (item, key) => {
                    if (key === "InvokeNext" || key ===  "Arguments") return true
                    if (item === "" || item === null) return false;
                    if (Array.isArray(item)) return item.length > 0;
                    if (typeof item === "object" && Object.keys(item).length === 0) return false;
                    return true;
                });
        }

        if (typeof object === "object" && object !== null) {
            const result = {};
            for (const [key, value] of Object.entries(object)) {
                const cleaned = cleanObject(value);

                // Drop if empty
                if (
                    (cleaned === "" || cleaned === null ||
                    (Array.isArray(cleaned) && cleaned.length === 0) ||
                    (typeof cleaned === "object" && Object.keys(cleaned).length === 0))
                    && key !== "InvokeNext"
                ) {
                    continue; // removes empty True/False keys
                }

                result[key] = cleaned;
            }
            return result;
        }

        // Primitive (string, number, bool, etc.)
        return object;
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

    const testFunc = async () => {
        (async() => {
            const res = await axios.get("https://raw.githubusercontent.com/nolcut/workflow-json-test/refs/heads/main/new-with-r.json")
            console.log(res.data)
        })()
    }


    return(
        <div id="toolbar" style={{ width: '100vw', height: '5vh'}}>
            {/* <GenericButton onClick={() => testFunc()}>TEST</GenericButton> */}
            <GenericButton icon={<FaUpload/>} onClick={() => {
                setUploadPopupEnabled(true);
                setDownloadPopupEnabled(false);
            }}>Upload</GenericButton>
            <Popup enabled={uploadPopupEnabled} setEnabled={() => setUploadPopupEnabled()} >
                <UploadWorkflow setLayout={() => props.setLayout()} createNewEdge={ props.createNewEdge } createNewNode={props.createNewNode} workflow_template={props.workflow_template} updateWorkflowAndLayout={props.updateWorkflowAndLayout} setUploadPopupEnabled={setUploadPopupEnabled}/>
                <UploadLayout createEdge={ props.createEdge } createNode={props.createNode} workflow_template={props.workflow_template} setUploadPopupEnabled={setUploadPopupEnabled} />
            </Popup>

            <GenericButton icon={<FaDownload/>} onClick={() => {
                setDownloadPopupEnabled(true);
                setUploadPopupEnabled(false);
            }}>Download</GenericButton>
            
            <Popup enabled={downloadPopupEnabled} setEnabled={() => setDownloadPopupEnabled()}>
                <GenericLabel value={"Download Options for Workflow: "+workflow.WorkflowName} size="20px"></GenericLabel>
                <button onClick={() => downloadWorkflowJson(workflow.WorkflowName)}>Download {workflow.WorkflowName}.json</button>
                <button onClick={() => downloadLayoutJson(workflow.WorkflowName)}>Download {workflow.WorkflowName}-layout.json</button>
            </Popup>
            <GenericButton icon={<FaDatabase/>} onClick={() => props.setEditType("DataStores")}>Edit Data Stores</GenericButton>
            <GenericButton icon={<FaServer/>} onClick={() => props.setEditType("ComputeServers")}>Edit Compute Servers</GenericButton>

            <GenericButton icon={<FaSitemap/>} onClick={() => props.setEditType("Functions")}>Edit Actions/Functions</GenericButton>
            <GenericButton icon={<IoMdSettings/>} onClick={() => props.setEditType("GeneralConfig")}>Workflow Settings</GenericButton>

            {/* <GenericButton onClick={() => props.toggleWorkflowVisible()}>Toggle Workflow</GenericButton>
            <GenericButton onClick={() => props.toggleGraphVisible()}>Toggle Graph</GenericButton> */}

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
