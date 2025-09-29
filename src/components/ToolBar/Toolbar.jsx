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

export default function Toolbar(props) {
    const {workflow, edges, nodes, } = useWorkflowContext();
    const [ downloadPopupEnabled, setDownloadPopupEnabled ] = useState(false)
    const [ uploadPopupEnabled, setUploadPopupEnabled ] = useState(false)
    const [ downloadError, setDownloadError ] = useState(false);
    const [ downloadErrorMessages, setDownloadErrorMessages ] = useState([]);

    const showDownloadError = (errors) => {
        setDownloadError(true);
        setDownloadErrorMessages(errors);
    }

    const setDownloadPopupEnabledAndClearError = (enabled) => {
        if (!enabled) setDownloadError(false);
        setDownloadPopupEnabled(enabled);
    }

    const convertJSONErrorsToReadable = (errors) => {
        try{
            const errorMessages = errors.flatMap(e => {
                const errorPathList = e.split('.');
                if (errorPathList.length >= 4) {
                    // Handle first JSON error type
                    let objectType = ''
                    const fullObjectType = errorPathList[1].split('[')[0];
                    if (errorPathList[1].startsWith('ActionList')) {
                        objectType = 'Action';
                    } else if (errorPathList[1].startsWith('DataStore')) {
                        objectType = 'DataStore';
                    } else if (errorPathList[1].startsWith('ComputeServer')) {
                        objectType = 'ComputeServer';
                    }
                    const index = parseInt(errorPathList[2].substring(0,1));
                    const objectId = Object.keys(workflow[fullObjectType])[index]
                    const errorMsgAndField = errorPathList[3].split(':');
                    let errorField = errorMsgAndField[0];
                    let errorMsg = errorMsgAndField[1];
                    if (errorMsg.includes('has less length than allowed')){
                        errorMsg = 'is required'
                    } else if (errorMsg.includes('pattern mismatch')) {
                        // skip duplicate message on empty field
                        const fieldLen = workflow[fullObjectType][objectId][errorField].length
                        if (fieldLen !== undefined && fieldLen < 1) return [];
                    } else if (errorField.includes('Type')) {
                        errorMsg = 'must be R or Python';
                    }
                    // Match displayed field name
                    errorField = errorField.replace('FaaSServer','ComputeServer');
                    return [`${objectType} ${objectId}: ${errorField} ${errorMsg}`];
                }else{
                    // handle other JSON error type
                    const errorPair = errorPathList[1].split(':');
                    const errorField = errorPair[0];
                    let msgs = []
                    if (errorField.includes('FunctionGitRepo')) {
                        Object.keys(workflow.ActionList).forEach((key) => {
                            const actionName = workflow.ActionList[key].FunctionName
                            if (!( actionName in workflow.FunctionGitRepo) ||
                                workflow.FunctionGitRepo[actionName] === ""
                            ) {
                                msgs.push(`Action ${key}: FunctionGitRepo is required`);
                            }
                        });
                    }else if (errorField.includes('ActionContainers')) {
                        Object.keys(workflow.ActionList).forEach((key) => {
                            if (!( key in workflow.FunctionGitRepo) ||
                                workflow.FunctionGitRepo[key] === ""
                            ) {
                                msgs.push(`Action ${key}: ActionContainer is required`);
                            }
                        });
                    } else if (errorField.includes('WorkflowName')) {
                        if (errorPair[1].includes('less length than allowed')) {
                            msgs.push('WorkflowName cannot be empty')
                        } else {
                            msgs.push(`WorkflowName: ${errorPair[1]}`);
                        }
                    } else if (errorField.includes('DefaultDataStore')) {
                        msgs.push('DefaultDataStore cannot be empty');
                    } else {
                        msgs.push(errorPair[1]);
                    }
                    return msgs;
                }
            });
            return errorMessages;
        } catch(error) {
            alert(`Error parsing JSON error: ${error}\n${JSON.stringify(errors)}`);
        }

    }

    const downloadWorkflowJson = (name) => {

        const validator = require('is-my-json-valid')
            const validate = validator(schemaNew, {
            greedy : true
        })

        const strippedWorkflow = stripRemovedActions(workflow) // removes actions from workflow that arent in graph
        const cleanedWorkflow = cleanObject({...strippedWorkflow}) // removes empty items from workflow


        // Check if workflow has any actions
        if (!cleanedWorkflow ||
            !cleanedWorkflow.ActionList ||
            Object.keys(cleanedWorkflow.ActionList).length < 1 
        ) {
            showDownloadError(['Workflow must have at least one action']);
            return
        }


        // Check for valid starting point
        if (!(cleanedWorkflow.FunctionInvoke in cleanedWorkflow.ActionList)) {
            showDownloadError([`The workflow's starting point (${cleanedWorkflow.FunctionInvoke}) must be in the graph`]);
            return
        }

        // Schema doesn't verify that each action has an entry in functionGitRepo
        let errorMsg = [];
        if (
            Object.keys(cleanedWorkflow.FunctionGitRepo).length > 0 &&
            Object.keys(cleanedWorkflow.FunctionGitRepo).length < Object.keys(workflow.ActionList).length) {

            errorMsg.push('data.FunctionGitRepo: has less properties than allowed'); 
        }

        // Check if workflow(without unused actions) violates schema file
        if (!validate(strippedWorkflow, { verbose: true})){
            errorMsg = [...errorMsg, ...validate.errors.map((error, i) => {
                const fieldName = error.field;
                return `${fieldName}: ${error.message}`;
            })];
        }
        if (errorMsg.length > 0) {
            
            const readableErrorMessages = convertJSONErrorsToReadable(errorMsg)
            showDownloadError(readableErrorMessages);
            return 
        }

        setDownloadError(false);
    

        download(name, cleanedWorkflow)

    };


    const download = ( name, content ) => {
        const blob = new Blob([JSON.stringify(content, null, 2)], {
            type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    }

    function stripRemovedActions(workflow) {
        let newWorkflow = structuredClone(workflow)
        Object.keys(newWorkflow.ActionList).forEach( (key) => {

            if (!nodes.some( (node) => node.id === key)) {
                delete newWorkflow.ActionList[key];

            } else {
                // remove edges to nodes not in layout
                newWorkflow.ActionList[key].InvokeNext = newWorkflow.ActionList[key].InvokeNext.filter(
                    (invokeNext) => {
                        // conditionals
                        if (typeof invokeNext === 'object' && invokeNext !== null) {
                            return Object.values(invokeNext)[0] !== key;
                        } else {
                            //unconditionals
                            return invokeNext !== key;

                        }

                    }
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

    // const testFunc = () => {
    // }


    return(
        <div id="toolbar" style={{ width: '100vw', height: '5vh'}}>
            {/* <GenericButton onClick={() => testFunc()}>TEST</GenericButton> */}
            <GenericButton icon={<FaUpload/>} onClick={() => {
                setUploadPopupEnabled(true);
                setDownloadPopupEnabled(false);
            }}>Upload</GenericButton>
            <Popup enabled={uploadPopupEnabled} setEnabled={() => setUploadPopupEnabled()} >
                <UploadWorkflow setLayout={() => props.setLayout()} createNewEdge={ props.createNewEdge } createNewNode={props.createNewNode} workflow_template={props.workflow_template} updateWorkflowAndLayout={props.updateWorkflowAndLayout} setUploadPopupEnabled={setUploadPopupEnabled}/>
                <UploadLayout workflow_template={props.workflow_template} setUploadPopupEnabled={setUploadPopupEnabled} />
            </Popup>

            <GenericButton icon={<FaDownload/>} onClick={() => {
                setDownloadPopupEnabled(true);
                setUploadPopupEnabled(false);
            }}>Download</GenericButton>
            
            <Popup enabled={downloadPopupEnabled} setEnabled={() => setDownloadPopupEnabledAndClearError()}>
                <GenericLabel value={"Download Options for Workflow: "+workflow.WorkflowName} size="20px"></GenericLabel>
                <button onClick={() => downloadWorkflowJson(workflow.WorkflowName)}>Download {workflow.WorkflowName}.json</button>
                <button onClick={() => downloadLayoutJson(workflow.WorkflowName)}>Download {workflow.WorkflowName}-layout.json</button>
                { downloadError ?  
                    <div className="error-text">
                        <p >The workflow has the following issues:</p>
                        <ul>
                            { downloadErrorMessages.map(e => ( 
                                <li>{e}</li>
                            ))}
                        </ul>
                        <button onClick={() => download(workflow.WorkflowName+"-unfinished", cleanObject({...stripRemovedActions({...workflow})}))}>Download Anyway</button>
                    </div>
                    
                    : <></>
                }
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
