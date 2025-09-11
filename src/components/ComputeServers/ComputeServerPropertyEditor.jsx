import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";
import useWorkflowUtils from "../Utils/WorkflowUtils";
import GenericLabel from "../Utils/GenericLabel";

export default function ComputeServerPropertyEditor( { server, property, type, required}){
    const {workflow} = useWorkflowContext();
    const { applyWorkflowChanges } = useWorkflowUtils()
    const { updateWorkflow } = useUndo();

    const handleBlur = (e) => {
        updateWorkflow(workflow);
    };

    const placeHolders = {
        UserName : "user_name",
        ActionRepoName : "repo_name",
        Branch : "main",
        Endpoint : "https://00.00.00.00",
        NameSpace : "namespace_name",
        Region : "us-west"
    }



    return (
            <div>
                <GenericLabel required={required} value={property} size={"20px"}>
                <input key={server+"-username"} type="text" placeholder={placeHolders[property]} defaultValue="" onChange={(e)=>applyWorkflowChanges({
                    ComputeServers: {
                        [server]: {
                            [property]: e.target.value
                        }
                    }
                })} 
                    onBlur={handleBlur}
                    value={workflow.ComputeServers[server][property]}
                />
                </GenericLabel>
            </div>
    )
}
