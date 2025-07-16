import { useRef, useEffect } from "react";
import { useWorkflowContext } from "../../WorkflowContext";

export function UploadWorkflow(props) {
    const { setEdges, setNodes, setWorkflow, workflow } = useWorkflowContext();
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

                // Clear current states
                setNodes([]);
                setEdges([]);
                
                // Set flag before updating state
                shouldBuildGraphRef.current = true;

                // Update workflow (triggers effect)
                setWorkflow({ ...new_workflow,
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
                alert("Failed to load workflow: Invalid JSON");
            }
        };

        reader.readAsText(file);
    };

    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {

        if (shouldBuildGraphRef.current) {
            shouldBuildGraphRef.current = false;

        const functions = workflow.FunctionList || {};
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
            ...workflow,
            FunctionList: updatedFunctionList
        };

        setWorkflow(updatedWorkflow);

            //Create Nodes
            for (let i in updatedFunctionList) {
                props.createNode(100 + offset * 100, 100 + offset * 50, updatedFunctionList[i].FunctionName, i);
                offset++;
            }
            //Connect Edges (now in creatNode)
            {/*for (let i in updatedFunctionList) {
                if (updatedFunctionList[i].InvokeNext !== null) {
                    for (let j of updatedFunctionList[i].InvokeNext) {
                        props.createEdge(i, j);
                    }
                }
            }*/}
        }
    }, [workflow]); 

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
