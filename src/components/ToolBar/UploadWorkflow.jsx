import { useRef } from "react";
import useUndo from "../Utils/Undo";
import { flushSync } from 'react-dom';
import { useReactFlow } from "@xyflow/react";
import { useWorkflowContext } from "../../WorkflowContext";
import useFunctionUtils from "../Functions/FunctionsUtils";
import useWorkflowAndLayoutUtils from "../Utils/WorkflowAndLayoutUtils";
import axios from "axios";

export function UploadWorkflow(props) {
    const { updateWorkflowAndLayout } = useUndo()
    const fileInputRef = useRef(null);
    const { fitView } = useReactFlow()
    const { getLayoutedElements } = useWorkflowContext()
    const { parseInvoke, listInvokeNext} = useFunctionUtils()
    const { createActionAndNode } = useWorkflowAndLayoutUtils()
    
    // NEW: This ref tracks whether we want to run the effect
    const shouldBuildGraphRef = useRef(false);

    const setUploadPopupEnabled = props.setUploadPopupEnabled;

    const uploadFromURL = async (url) => {
        let rawURL;
        
        if (url.includes("raw.githubusercontent.com")) {
            rawURL = url;
        } else if (url.includes("github.com")) {
            // Convert regular GitHub URL to raw URL
            rawURL = url
                .replace("github.com", "raw.githubusercontent.com")
                .replace("/blob/", "/refs/heads/");
        } else {
            console.error("Invalid GitHub URL");
            alert("Please provide a valid GitHub URL");
            return;
        }

        (async() => {
            const res = await axios.get(rawURL)

            const new_workflow = res.data;

                // Set flag before updating state
                shouldBuildGraphRef.current = true;

                // Update workflow and populate with defaults if missing
                buildGraph({ ...new_workflow,
                            ActionList : new_workflow.ActionList || {},
                            ComputeServers : new_workflow.ComputeServers || {},
                            DataStores : new_workflow.DataStores || {},
                            ActionContainers : new_workflow.ActionContainers || {},
                            FunctionInvoke : new_workflow.FunctionInvoke || "None",
                            DefaultDataStore : new_workflow.DefaultDataStore || "None",
                            FunctionGitRepo : new_workflow.FunctionGitRepo || {},
                            FunctionCRANPackage : new_workflow.FunctionCRANPackage || {},
                            FunctionGitHubPackage : new_workflow.FunctionGitHubPackage || {},
                            FaaSrLog : new_workflow.FaaSrLog || "FaaSrLog",
                            LoggingDataStore : new_workflow.LoggingDataStore || "",
                            InvocationID : new_workflow.InvocationID || "",
                            PyPIPackageDownloads : new_workflow.PyPIPackageDownloads || {},
                            WorkflowName : new_workflow.WorkflowName || "unnamed-workflow"
                });
                setUploadPopupEnabled(false)
        })()
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const new_workflow = JSON.parse(e.target.result);
                

                // Set flag before updating state
                shouldBuildGraphRef.current = true;

                // Update workflow and populate with defaults if missing
                buildGraph({ ...new_workflow,
                            ActionList : new_workflow.ActionList || {},
                            ComputeServers : new_workflow.ComputeServers || {},
                            DataStores : new_workflow.DataStores || {},
                            ActionContainers : new_workflow.ActionContainers || {},
                            FunctionInvoke : new_workflow.FunctionInvoke || "None",
                            DefaultDataStore : new_workflow.DefaultDataStore || "None",
                            FunctionGitRepo : new_workflow.FunctionGitRepo || {},
                            FunctionCRANPackage : new_workflow.FunctionCRANPackage || {},
                            FunctionGitHubPackage : new_workflow.FunctionGitHubPackage || {},
                            FaaSrLog : new_workflow.FaaSrLog || "",
                            LoggingDataStore : new_workflow.LoggingDataStore || "",
                            InvocationID : new_workflow.InvocationID || "",
                            PyPIPackageDownloads : new_workflow.PyPIPackageDownloads || {},
                            WorkflowName : new_workflow.WorkflowName || "unnamed-workflow"
                });
                setUploadPopupEnabled(false)
            } catch (err) {
                console.error("Invalid JSON file", err);
                alert(`Failed to load workflow: Invalid JSON ${err}`);
            }
        };

        reader.readAsText(file);
    };

    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    
    const buildGraph = (newWorkflow) => {
        if (shouldBuildGraphRef.current) {
            shouldBuildGraphRef.current = false;

            const actions = newWorkflow.ActionList || {};
            let offset = 0;


            const updatedActionList = {};
            for (const key in actions) {
                const fn = actions[key];
                updatedActionList[key] = {
                    ...fn,
                    InvokeNext: typeof fn.InvokeNext[0] === 'object' ? [{ True : fn.InvokeNext[0].True || [], False : fn.InvokeNext[0].False || []}, ...fn.InvokeNext.slice(1)] : [{ True : [], False : []}, ...fn.InvokeNext],
                    Arguments : fn.Arguments ? fn.Arguments : {}
                };
            }


            const updatedWorkflow = {
                ...newWorkflow,
                ActionList: updatedActionList
            };


            //Create Graph
            let newNodes = [];
            let newEdges = [];
            for (let action in updatedActionList) {
                newNodes.push(props.createNewNode(100 + offset * 100, 100 + offset * 50, updatedActionList[action].FunctionName, action));
                updatedActionList[action].InvokeNext[0].True.forEach( (invoke) => {
                    const {id, rank} = parseInvoke(invoke)
                    newEdges.push({...props.createNewEdge(action, id, rank, "True")});
                });
                updatedActionList[action].InvokeNext[0].False.forEach( (invoke) => {
                    const {id, rank} = parseInvoke(invoke)
                    newEdges.push(props.createNewEdge(action, id, rank, "False"));
                });
                updatedActionList[action].InvokeNext.slice(1).forEach( (invoke) => {
                    const {id, rank} = parseInvoke(invoke)
                    newEdges.push(props.createNewEdge(action, id, rank, "Unconditional"));
                });
                offset++;
            }
            for ( let edge of newEdges){
                newNodes = newNodes.map( node => {
                    return {
                        ...node,
                        data : {
                            ...node.data,
                            rank : ( edge.target === node.id) ? (edge.label === "" ? 1 : edge.label) : node.data.rank
                        }
                    }
                })
            }

            
            
            const layouted = getLayoutedElements(newNodes, newEdges, 'TB' );
            props.updateWorkflowAndLayout(updatedWorkflow, layouted.nodes, layouted.edges);

            fitView()


        }
    }; 

    return (
        <>
            <button onClick={openFileDialog}>Upload workflow file</button>
            <div>

                <input type="text" id="workflowUrlInput" placeholder="https://github.com/FaaSr/FaaSr-workflow/tutorial.json"></input>
                <button onClick={() => uploadFromURL(document.getElementById("workflowUrlInput").value)}>Import from GitHub URL</button>
            </div>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </>
    );
}
