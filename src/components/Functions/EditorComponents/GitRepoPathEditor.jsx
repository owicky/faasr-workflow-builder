import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import useFunctionUtils from "../FunctionsUtils"
import useCreateNewFunction from "../FunctionCreator"
import Popup from "../../Utils/Popup"

export default function GitRepoPathEditor( props ){

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



    return(
        <div id="git-repo-path-editor">
            <GenericLabel size={"20px"} value={"Function's Git Repo/Path"}></GenericLabel>
            <input id={id+"-gitpath"} style={{ width:"300px" }} type="text" placeholder="GitPath" 
                onChange={(e)=>setWorkflow({
                    ...workflow,
                    FunctionGitRepo: {
                        ...workflow.FunctionGitRepo,
                        [workflow.FunctionList[id].FunctionName] : e.target.value
                    }
                })}
                value={workflow.FunctionGitRepo[workflow.FunctionList[id].FunctionName] || ""}
                onBlur={() => props.onBlur}
            />
        </div>
    )
}