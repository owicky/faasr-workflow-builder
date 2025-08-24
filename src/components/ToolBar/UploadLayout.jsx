import { useRef, useEffect } from "react";
import { useWorkflowContext } from "../../WorkflowContext";
import useUndo from "../Utils/Undo";

export function UploadLayout(props) {
    const { setEdges, setNodes, edges, nodes} = useWorkflowContext();
    const fileInputRef = useRef(null);
    const { updateLayout } = useUndo();
    
    const shouldBuildGraphRef = useRef(false);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const new_layout = JSON.parse(e.target.result);

                // Clear current states
                updateLayout([...new_layout.nodes],[...new_layout.edges]);
                
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

    /*
    useEffect(() => {

        if (shouldBuildGraphRef.current) {
            shouldBuildGraphRef.current = false;

        // const functions = workflow.ActionList || {};
        // let offset = 0;


        // const updatedActionList = {};
        // for (const key in functions) {
        //     const fn = functions[key];
        //     updatedActionList[key] = {
        //         ...fn,
        //         InvokeNext: Array.isArray(fn.InvokeNext) ? fn.InvokeNext : [fn.InvokeNext]
        //     };
        // }


        // const updatedWorkflow = {
        //     ...workflow,
        //     ActionList: updatedActionList
        // };

        // setWorkflow(updatedWorkflow);

        //     //Create Nodes
        //     for (let i in updatedActionList) {
        //         props.createNode(100 + offset * 100, 100 + offset * 50, updatedActionList[i].FunctionName, i);
        //         offset++;
        //     }
        //     //Connect Edges
        //     for (let i in updatedActionList) {
        //         if (updatedActionList[i].InvokeNext !== null) {
        //             for (let j of updatedActionList[i].InvokeNext) {
        //                 props.createEdge(i, j);
        //             }
        //         }
        //     }
        }
    }, [edges, nodes]); 
    */

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
