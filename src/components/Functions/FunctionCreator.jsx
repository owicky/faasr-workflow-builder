import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"


export default function FunctionCreator(props){
    const {workflow, setWorkflow, setNodes} = useWorkflowContext();
    const [newId, setNewId] = useState("")

    return(
        <>
            <button onClick={() => {
                if (!(newId in Object.keys(workflow.FunctionList)) && (newId !== "")){
                setWorkflow({
                    ...workflow,
                    FunctionList: {
                        ...workflow.FunctionList,
                        [newId]: {
                            FunctionName: "",
                            FaaSServer: "",
                            Arguments: {
                            },
                            InvokeNext: []
                        }
                    }
                })
                const newNode = {
                    id : newId,
                    type: 'functionNode',
                    position: ({
                    x: 0,
                    y: 0}),
                    data: { id: newId, name : newId, direct: 1},
                    origin: [0.5, 0.0],
                };
                setNodes((nds) => nds.concat(newNode));
            }}
            }>Create New Function</button>
            <input type="text" placeholder="ActionName" onChange={(e) => setNewId(e.target.value)}/>
        </>
    )
}