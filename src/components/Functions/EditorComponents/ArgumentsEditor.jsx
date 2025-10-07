import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import Popup from "../../Utils/Popup"



export default function ArgumentsEditor( props ){
    const {workflow} = useWorkflowContext();
    const { updateWorkflow } = useUndo();

    // Id of Action we are editing
    const id = props.id

    const [newArg, setNewArg] = useState("")
    const [newArgVal, setNewArgVal] = useState("")
    const [newArgPopupEnabled, setNewArgPopupEnabled] = useState(false)
    const [ argumentError, setArgumentError ] = useState('');

    const updateFunction = (updates) => {
        updateWorkflow({
            ...workflow,
            ActionList: {
                ...workflow.ActionList,
                [id]: {
                    ...workflow.ActionList[id],
                    ...updates
                }
            }
        });
    };

    const updateArgument = (key, value) => {
        updateFunction({Arguments : {
            ...workflow.ActionList[id].Arguments,
            [key] : value
        }})
    };

    const clearArgumentError = () => {
        setArgumentError('');
    }

    return (
        <div id="arguments-editor">
                <GenericLabel size={"20px"} value={"Arguments"}></GenericLabel>
                <div style={{border: "solid"}}>
                    {Object.entries(workflow.ActionList[id].Arguments).map(([key, val], i) => (
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
                                delete newWorkflow.ActionList[id].Arguments[key]
                                // console.log("Deleting: " + key)
                                updateWorkflow(newWorkflow)
                            }}>Delete</button>
                    </div>
                    ))}
                <button onClick={() => setNewArgPopupEnabled(true)}>Add New Arguments</button>
                </div>
                <Popup enabled={newArgPopupEnabled} setEnabled={() => setNewArgPopupEnabled()} onClose={clearArgumentError}>
                    <input value={newArg} placeholder="argument-name" onChange={ (e) => setNewArg(e.target.value)} onFocus={clearArgumentError}></input>
                    <input value={newArgVal} placeholder="argument-value" onChange={ (e) => setNewArgVal(e.target.value)}></input>
                    <button onClick={() => {
                        if (!/\s/.test(newArg) && newArg !== "" && !/\s/.test(newArgVal) && newArgVal !== ""){
                            updateWorkflow({
                            ...workflow,
                            ActionList: {
                                ...workflow.ActionList,
                                [id]: {
                                    ...workflow.ActionList[id],
                                    Arguments: {
                                    ...workflow.ActionList[id].Arguments,
                                    [newArg]: newArgVal
                                    }
                                }
                                }
                            })}else{
                                setArgumentError('The argument name can\'t be empty or have any whitespaces.');
                            }
                        }
                        }>Add New Argument</button>
                { argumentError !== '' ?
                    <p className="error-text">{argumentError}</p>:
                    <></>
                }
                </Popup>
        </div>
    )
}
