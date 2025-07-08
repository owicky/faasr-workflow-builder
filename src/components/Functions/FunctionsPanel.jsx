import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import FunctionEditor from "./FunctionEditor";
import FunctionCreator from "./FunctionCreator";

export default function FunctionsPanel(props){
    const {workflow} = useWorkflowContext();
    const [functionId, setfunctionId] = useState(null)

    return(
        <div class="editor-panel">
            <h1>Functions</h1>
            {Object.entries(workflow.FunctionList).map(([key, val], i) => (
                <button key={i} onClick={() => setfunctionId(key)}>
                    {key}
                </button>
            ))}
            <div>
                <FunctionCreator/>
            </div>
            <FunctionEditor createEdge={(a,b) => props.createEdge(a,b)} id={functionId}/>  
        </div>     
    )
}