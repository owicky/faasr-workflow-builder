import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import FunctionEditor from "./FunctionEditor";
import FunctionCreator from "./FunctionCreator";

export default function FunctionsPanel(props){
    const {workflow, setSelectedFunctionId} = useWorkflowContext();

    return(
        <div class="editor-panel">
            <h1>Functions</h1>
            {Object.entries(workflow.FunctionList).map(([key, val], i) => (
                <button key={i} onClick={() => setSelectedFunctionId(key)}>
                    {key}
                </button>
            ))}
            <div>
                <FunctionCreator/>
            </div>
            <FunctionEditor createEdge={(a,b) => props.createEdge(a,b)} id={setSelectedFunctionId}/>  
        </div>     
    )
}