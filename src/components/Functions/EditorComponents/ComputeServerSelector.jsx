import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"

export function getActionContainer(faasType, type) {
    const containerPrefixes = {
        "GitHubActions":"ghcr.io/faasr/github-actions-",
        "OpenWhisk":"docker.io/faasr/openwhisk-",
        "Lambda":"145342739029.dkr.ecr.us-east-1.amazonaws.com/aws-lambda-",
        "SLURM":"docker.io/faasr/slurm-",
        "GoogleCloud":"docker.io/faasr/gcp-",
    }        

    if (faasType == "NONE" || type == "NONE") return null;

    const containerName = `${containerPrefixes[faasType]}${type.toLowerCase()}:latest`;
    return containerName;

}

export default function ComputeServerSelector( props ){
    const {workflow} = useWorkflowContext();
    const { updateWorkflow } = useUndo();

    // Id of Action we are editing
    const id = props.id


    return (
        <div id="compute-server-selector">
            <GenericLabel size={"20px"} value={"Compute Server"} required={true}>

            <select placeholder="FaaSServer" onChange={(e)=> {

                const type = workflow.ActionList[id].Type;
                const faasServer = e.target.value;
                let containerName;
                if (faasServer === "NONE" || faasServer === ""){
                    containerName = workflow.ActionContainers[id];
                }else{ 
                    const faasType = workflow.ComputeServers[faasServer].FaaSType;
                    containerName = getActionContainer(faasType, type);
                }
                if (containerName == null) containerName = workflow.ActionContainers[id];

                updateWorkflow({
                ...workflow,
                ActionList: {
                    ...workflow.ActionList,
                    [id]: {
                        ...workflow.ActionList[id],
                        FaaSServer: faasServer
                    }
                },
                ActionContainers: {
                    ...workflow.ActionContainers,
                    [id]: containerName
                }


                })
            }} type="text" value={workflow.ActionList[id].FaaSServer}>
                <option value={""}> NONE </option>
                {Object.entries(workflow.ComputeServers).map(([key, val], i) => (
                    <option key={key} value={key}>{key}</option>
                ))}
            </select>
            </GenericLabel>
        </div>
    )
}
