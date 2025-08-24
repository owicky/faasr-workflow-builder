import { useWorkflowContext } from "../../WorkflowContext"

export default function CreateNodeButton(props){
    const { setNodes} = useWorkflowContext();

    const createNewFunction = () => {
        props.workflow.ActionList[props.id] = {
            "FunctionName": "undefined",
            "FaaSServer": "undefined",
            "Arguments": {
            },
            "InvokeNext": [
            ]
        }
        props.createNode(100, 100, null, props.id)
    }


    return (
        <>
            {/* <button onClick={() => createNewFunction()}>Add New Function</button> */}
            <button onClick={() => setNodes(
                [
                    {
                        id: '1',
                        type: 'functionNode',
                        data: { name : "unCoolFunc", id : "permanentAction" , FaaSType : 'GitHubActions' },
                        position: { x: 250, y: 25 },
                    }
                ]
            )}>set default nodes2</button>
        </>
    )
}
