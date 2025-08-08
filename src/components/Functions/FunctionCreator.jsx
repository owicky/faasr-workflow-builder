import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";

export const useCreateNewFunction = () => {
    const { workflow, nodes, edges } = useWorkflowContext();
    const { updateWorkflowAndLayout } = useUndo();
    const FaaSServerList = Object.keys(workflow.ComputeServers);
    const defaultFaaSServer = FaaSServerList.length > 0 ? FaaSServerList[0] : "";
    const createNewFunction = ( newAction = "", newFunction) => {
        console.log(newFunction + " -- " + newAction)

        if (!(newAction in Object.keys(workflow.FunctionList)) && (newAction !== "")){
            console.log("is fresh")
            const newWorkflow = {
                ...workflow,
                FunctionList: {
                    ...workflow.FunctionList,
                    [newAction]: {
                        FunctionName: newFunction,
                        FaaSServer: defaultFaaSServer,
                        Arguments: {
                        },
                        InvokeNext: [{}, []]
                    }
                }
            };
            const newNode = {
                id : newAction,
                type: 'functionNode',
                position: ({
                x: 0,
                y: 0}),
                data: { id: newAction, name : newAction, direct: 1},
                origin: [0.5, 0.0],
            };
            updateWorkflowAndLayout(newWorkflow, nodes.concat(newNode), edges)
        }
    };
    return createNewFunction;

}

export function FunctionCreator(props){
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
                                InvokeNext: [{}, []]
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
            {/*<input type="text" placeholder="ActionName" onChange={(e) => setNewId(e.target.value)}*/}
        </>
    )
}

export default useCreateNewFunction;
