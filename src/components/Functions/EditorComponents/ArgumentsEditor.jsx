import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import useFunctionUtils from "../FunctionsUtils"
import useCreateNewFunction from "../FunctionCreator"
import Popup from "../../Utils/Popup"



export default function ArgumentsEditor( props ){
    const {workflow, setWorkflow, edges, selectedFunctionId,nodes} = useWorkflowContext();
    const { updateWorkflow, updateLayout, updateWorkflowAndLayout } = useUndo();

    // Id of Action we are editing
    const id = props.id

    const [newArg, setNewArg] = useState("")
    const [newArgVal, setNewArgVal] = useState("")
    const [newGitPackage, setNewGitPackage] = useState("")
    const [newCranPackage, setNewCranPackage] = useState("")

    const [newArgPopupEnabled, setNewArgPopupEnabled] = useState(false)

    const [newInvoke, setNewInvoke] = useState("NONE")
    const [newActionName, setNewActionName] = useState("")
    const { listInvokeNext, parseInvoke, getInvokeCondition, deleteInvoke, updateInvoke, isValidNewRankedEdge} = useFunctionUtils ();
    const { createNewFunction, createNewFunctionNode } = useCreateNewFunction();

    const updateFunction = (updates) => {
        updateWorkflow({
            ...workflow,
            FunctionList: {
                ...workflow.FunctionList,
                [id]: {
                    ...workflow.FunctionList[id],
                    ...updates
                }
            }
        });
    };

    const updateArgument = (key, value) => {
        updateFunction({Arguments : {
            ...workflow.FunctionList[id].Arguments,
            [key] : value
        }})
    };

    return (
        <div id="arguments-editor">
                <GenericLabel size={"20px"} value={"Arguments"}></GenericLabel>
                <div style={{border: "solid"}}>
                    {Object.entries(workflow.FunctionList[id].Arguments).map(([key, val], i) => (
                        <div className="list-entry">
                            <label className="truncate" style={{ width: '5vw' }}>{key}</label>
                            <input
                            style={{ width: '15vw' }}
                            type="text"
                            placeholder={key+" value"}
                            value={val}
                            onChange={(e) =>
                                updateArgument(key, e.target.value)
                            }
                            />
                            <button style={{color:"red", marginLeft: 'auto'}} onClick={() => {
                                const newWorkflow = structuredClone(workflow);
                                delete newWorkflow.FunctionList[id].Arguments[key]
                                console.log("Deleting: " + key)
                                updateWorkflow(newWorkflow)
                            }}>Delete</button>
                    </div>
                    ))}
                <button onClick={() => setNewArgPopupEnabled(true)}>Add New Arguments</button>
                </div>
                <Popup enabled={newArgPopupEnabled} setEnabled={() => setNewArgPopupEnabled()}>
                    <input value={newArg} placeholder="argument-name" onChange={ (e) => setNewArg(e.target.value)}></input>
                    <input value={newArgVal} placeholder="argument-value" onChange={ (e) => setNewArgVal(e.target.value)}></input>
                    <button onClick={() => {
                        if (!/\s/.test(newArg) && newArg !== "" && !/\s/.test(newArgVal) && newArgVal !== ""){
                            updateWorkflow({
                            ...workflow,
                            FunctionList: {
                                ...workflow.FunctionList,
                                [id]: {
                                    ...workflow.FunctionList[id],
                                    Arguments: {
                                    ...workflow.FunctionList[id].Arguments,
                                    [newArg]: newArgVal
                                    }
                                }
                                }
                            })}else{
                                alert("New argument name and value must neither be empty nor contain whitespaces.")
                            }
                        }
                        }>Add New Argument</button>
                </Popup>
        </div>
    )
}
