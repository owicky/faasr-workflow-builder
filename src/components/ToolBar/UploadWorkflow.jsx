import { useRef, useEffect } from "react";
import { useWorkflowContext } from "../../WorkflowContext";
import useUndo from "../Utils/Undo";

export function UploadWorkflow(props) {
    const { setEdges, setNodes, setWorkflow, workflow, nodes, edges} = useWorkflowContext();
    const { updateWorkflow, updateWorkflowAndLayout } = useUndo()
    const fileInputRef = useRef(null);
    
    // NEW: This ref tracks whether we want to run the effect
    const shouldBuildGraphRef = useRef(false);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const new_workflow = JSON.parse(e.target.result);

                // Set flag before updating state
                shouldBuildGraphRef.current = true;

                // Update workflow (triggers effect)
                buildGraph({ ...new_workflow,
                            FunctionList : new_workflow.FunctionList || {},
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
                            InvocationID : new_workflow.InvocationID || ""
                });
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

    // I changed the useEffect to a function, now it just gets called when file changes
    const buildGraph = (newWorkflow) => {
        if (shouldBuildGraphRef.current) {
            shouldBuildGraphRef.current = false;

            const functions = newWorkflow.FunctionList || {};
            let offset = 0;


            const updatedFunctionList = {};
            for (const key in functions) {
                const fn = functions[key];
                updatedFunctionList[key] = {
                    ...fn,
                    InvokeNext: Array.isArray(fn.InvokeNext) ? fn.InvokeNext : [fn.InvokeNext]
                };
            }


            const updatedWorkflow = {
                ...newWorkflow,
                FunctionList: updatedFunctionList
            };


            //Create Graph
            let newNodes = [];
            let newEdges = [];
            for (let i in updatedFunctionList) {
                newNodes.push(props.createNewNode(100 + offset * 100, 100 + offset * 50, updatedFunctionList[i].FunctionName, i));
                updatedFunctionList[i].InvokeNext.forEach( (id) => {
                    newEdges.push(props.createNewEdge(i, id));
                });
                offset++;
            }
            updateWorkflowAndLayout(updatedWorkflow, newNodes, newEdges);

        
    
        }
    }; 

    return (
        <>
            <button onClick={openFileDialog}>Load Workflow File</button>
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
