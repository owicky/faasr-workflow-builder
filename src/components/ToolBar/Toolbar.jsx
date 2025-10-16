import { UploadWorkflow } from "./UploadWorkflow"
import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import Popup from "../Utils/Popup";
import GenericLabel from "../Utils/GenericLabel";
import { UploadLayout } from "./UploadLayout";
import schemaNew from "../../assets/webui-workflow-schema-webui-version.json"
import GenericButton from "../Utils/GenericButton";
import { IoMdSettings } from "react-icons/io";
import { FaDownload, FaUpload } from "react-icons/fa6";
import { FaDatabase  } from "react-icons/fa";
import { FaServer  } from "react-icons/fa6";
import { FaSitemap } from "react-icons/fa"
import Ajv2020 from "ajv/dist/2020.js";


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

    const applyDefaultContainers = () => {

        const containerPrefixes = {
            "GitHubActions":"ghcr.io/faasr/github-actions-",
            "OpenWhisk":"faasr/openwhisk-",
            "Lambda":"145342739029.dkr.ecr.us-east-1.amazonaws.com/aws-lambda-",
            "SLURM":"faasr/slurm-",
            "GoogleCloud":"faasr/gcp-",
        }        

        const newWorkflow = structuredClone(workflow);
        
        Object.keys(workflow.ActionList).forEach((actionId) => {
            if (!(actionId in workflow.ActionContainers)
                || workflow.ActionContainers[actionId] === ""
                || workflow.ActionContainers[actionId] === undefined
            ){
                const computeServerId = workflow.ActionList[actionId].FaaSServer;
                const faasType = workflow.ComputeServers[computeServerId].FaaSType;
                const type = workflow.ActionList[actionId].Type;
                const containerName = `${containerPrefixes[faasType]}${type.toLowerCase()}:latest`;
                newWorkflow.ActionContainers[actionId] = containerName;
                
            }
        })

        return newWorkflow;
    }

    const downloadWorkflowJson = (name) => {
        const readyToExportWorkflow = applyDefaultContainers();

        const ajv = new Ajv2020({ allErrors: true})

        const validate = ajv.compile(schemaNew)

        const strippedWorkflow = stripRemovedActions(readyToExportWorkflow) // removes actions from workflow that arent in graph
        const cleanedWorkflow = cleanObject({...strippedWorkflow}) // removes empty items from workflow


        // // Check if workflow has any actions
        // if (!cleanedWorkflow ||
        //     !cleanedWorkflow.ActionList ||
        //     Object.keys(cleanedWorkflow.ActionList).length < 1 
        // ) {
        //     showDownloadError(['Workflow must have at least one action']);
        //     return
        // }


        // // Check for valid starting point
        // if (!(cleanedWorkflow.FunctionInvoke in cleanedWorkflow.ActionList)) {
        //     showDownloadError([`The workflow's starting point (${cleanedWorkflow.FunctionInvoke}) must be in the graph`]);
        //     return
        // }

        // // Verify each action has an entry in ActionContainers
        let errorMsg = [];
        // if (
        //     Object.keys(cleanedWorkflow.ActionContainers).length > 0 &&
        //     Object.keys(cleanedWorkflow.ActionContainers).length < Object.keys(workflow.ActionList).length) {

        //     errorMsg.push('data.ActionContainers: has less properties than allowed'); 
        // }

        // // Verify each action's FunctionName is an entry in FunctionGitRepo
        // if (
        //     !cleanedWorkflow.FunctionGitRepo ||
        //     Object.values(cleanedWorkflow.ActionList).some(action => 
        //         !(action.FunctionName in cleanedWorkflow.FunctionGitRepo)
        //     )
        // ) {
        //     errorMsg.push('data.FunctionGitRepo: has less properties than allowed');    
        // }




        if (!validate(strippedWorkflow)){ // If violates Schema
            validate.errors.forEach(element => {
                console.log(validate.errors)
                errorMsg.push(element.instancePath + element.message);
            });

            // errorMsg = [...errorMsg, ...validate.errors.map((error, i) => {
            //     const fieldName = error.field;
            //     return `${fieldName}: ${error.message}`;
            // })];
        }
        if (errorMsg.length > 0) {
            
            // const readableErrorMessages = convertJSONErrorsToReadable(errorMsg)
            showDownloadError(errorMsg); //readableErrorMessages
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
            <GenericButton icon={<IoMdSettings/>} onClick={() => props.setEditType("WorkflowSettings")}>Workflow Settings</GenericButton>

            {/*
            <GenericButton onClick={() => props.toggleWorkflowVisible()}>Toggle Workflow</GenericButton>
            <GenericButton onClick={() => props.toggleGraphVisible()}>Toggle Graph</GenericButton>
            */}


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
