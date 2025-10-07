import { useWorkflowContext } from "../../../WorkflowContext"
import GenericLabel from "../../Utils/GenericLabel"
import useWorkflowUtils from "../../Utils/WorkflowUtils";
export default function GitRepoPathEditor( props ){

    const {workflow} = useWorkflowContext();
    const { applyWorkflowChanges } = useWorkflowUtils()


    // Id of Action we are editing
    const id = props.id
    const functionName = workflow.ActionList[id].FunctionName
    return(
        <div id="git-repo-path-editor">
            <GenericLabel size={"20px"} value={"Function's Git Repo/Path"} required={true}>
            <input id={id+"-gitpath"} style={{ width:"300px" }} key={`git-repo-path-${id}`} type="text" placeholder="GitPath"
                onChange={(e)=> applyWorkflowChanges({
                    FunctionGitRepo: {
                        [functionName] : e.target.value
                    }
                })}
                value={workflow.FunctionGitRepo[functionName] || ""}
                onBlur={props.onBlur}
            />
            </GenericLabel>
        </div>
    )
}
