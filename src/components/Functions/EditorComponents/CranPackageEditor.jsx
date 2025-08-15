import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import useFunctionUtils from "../FunctionsUtils"
import useCreateNewFunction from "../FunctionCreator"
import Popup from "../../Utils/Popup"

export default function CranPackageEditor( props ){
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

    return (
        <div id="cran-package-editor">
            <GenericLabel size={"20px"} value={"CRAN Packages for the Function"}></GenericLabel>
            <div style={{border: "solid"}}>
                { workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] ? 
                    Object.entries(workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName]).map(([key, val], i) => (
                        <div style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                            <input
                            type="text"
                            placeholder={key+" value"}
                            value={val}
                            onChange={(e) =>
                                setWorkflow({
                                    ...workflow,
                                    FunctionCRANPackage : {
                                        ...workflow.FunctionCRANPackage,
                                        [workflow.FunctionList[id].FunctionName] :
                                        workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName]
                                            .map(pkg => pkg === val ? e.target.value : pkg)
                                    }
                                }
                                )
                            }
                            />
                            <button style={{color:"red"}} onClick={() => {
                                const newWorkflow = structuredClone(workflow);
                                newWorkflow.FunctionCRANPackage[newWorkflow.FunctionList[id].FunctionName] = newWorkflow.FunctionCRANPackage[newWorkflow.FunctionList[id].FunctionName] = workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName].filter(value => value !== val);
                                updateWorkflow(newWorkflow);
                            }}>Delete</button>
                    </div>
                    ))
                    : ""
                }
                <input value={newCranPackage} placeholder="NewPackageName" onChange={ (e) => setNewCranPackage(e.target.value)}></input>
                <button onClick={() => {
                    const newPackageName = newCranPackage.trim()
                    if(newPackageName !== "" && (!workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] || !workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName].includes(newPackageName))){
                        setWorkflow({
                            ...workflow,
                            FunctionCRANPackage: {
                                ...workflow.FunctionCRANPackage,
                                [workflow.FunctionList[id].FunctionName]: [
                                    ...(workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] || []),
                                    newPackageName
                                ]
                            }
                        });
                        setNewCranPackage("");
                    }
                }}>Add Package</button>
            </div>
        </div>
    )
}