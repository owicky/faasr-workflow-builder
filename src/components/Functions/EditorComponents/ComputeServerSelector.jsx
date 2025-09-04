import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"

export default function ComputeServerSelector( props ){
    const {workflow} = useWorkflowContext();
    const { updateWorkflow } = useUndo();

    // Id of Action we are editing
    const id = props.id


    return (
        <div id="compute-server-selector">
                    <GenericLabel size={"20px"} value={"Compute Server"} required={true}></GenericLabel>

                    <select placeholder="FaaSServer" onChange={(e)=>updateWorkflow({
                        ...workflow,
                        ActionList: {
                            ...workflow.ActionList,
                            [id]: {
                                ...workflow.ActionList[id],
                                FaaSServer: e.target.value
                            }
                        }
                    })} type="text" value={workflow.ActionList[id].FaaSServer}>
                        <option value={""}> NONE </option>
                        {Object.entries(workflow.ComputeServers).map(([key, val], i) => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
        </div>
    )
}
