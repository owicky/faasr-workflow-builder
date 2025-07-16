import { useRef, useEffect } from "react";
import { useWorkflowContext } from "../../WorkflowContext";

export function UploadLayout(props) {
    const { setEdges, setNodes, edges, nodes} = useWorkflowContext();
    const fileInputRef = useRef(null);
    
    const shouldBuildGraphRef = useRef(false);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const new_layout = JSON.parse(e.target.result);

                // Clear current states
                setNodes([...new_layout.nodes]);
                setEdges([...new_layout.edges]);
                
                // Set flag before updating state
                shouldBuildGraphRef.current = true;
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

        // const functions = workflow.FunctionList || {};
        // let offset = 0;


        // const updatedFunctionList = {};
        // for (const key in functions) {
        //     const fn = functions[key];
        //     updatedFunctionList[key] = {
        //         ...fn,
        //         InvokeNext: Array.isArray(fn.InvokeNext) ? fn.InvokeNext : [fn.InvokeNext]
        //     };
        // }


        // const updatedWorkflow = {
        //     ...workflow,
        //     FunctionList: updatedFunctionList
        // };

        // setWorkflow(updatedWorkflow);

        //     //Create Nodes
        //     for (let i in updatedFunctionList) {
        //         props.createNode(100 + offset * 100, 100 + offset * 50, updatedFunctionList[i].FunctionName, i);
        //         offset++;
        //     }
        //     //Connect Edges
        //     for (let i in updatedFunctionList) {
        //         if (updatedFunctionList[i].InvokeNext !== null) {
        //             for (let j of updatedFunctionList[i].InvokeNext) {
        //                 props.createEdge(i, j);
        //             }
        //         }
        //     }
        }
    }, [edges, nodes]); 

    return (
        <>
            <button onClick={openFileDialog}>Optional: Load Layout File</button>
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
