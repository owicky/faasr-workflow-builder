import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";
import { MarkerType } from "@xyflow/react";

export const useCreateNewFunction = () => {
    const { workflow, nodes, edges } = useWorkflowContext();
    const { updateLayout, updateWorkflowAndLayout } = useUndo();
    const FaaSServerList = Object.keys(workflow.ComputeServers);
    const defaultFaaSServer = FaaSServerList.length > 0 ? FaaSServerList[0] : "";

    const createNewNode = (newId) => {
        const newNode = {
            id : newId,
            type: 'functionNode',
            position: ({
            x: 0,
            y: 0}),
            data: { id: newId, name : newId, direct: 1},
            origin: [0.5, 0.0],
        };
        return newNode;

    }

    const createNewEdge = (id1, id2) => {
        const newEdge = {
            animated : false,
            source : id1,
            target : id2,
            markerEnd: {
                width: 20,
                height: 20,
                type: MarkerType.ArrowClosed,
            },
            id : id1+"-"+id2
        };

        return newEdge;  
    }
    // Used to create layout node for existing function
    const createNewFunctionNode = (functionId) => {

        const newNode = createNewNode(functionId);
        let newEdges = [];
        workflow.FunctionList[functionId].InvokeNext.forEach( (target) => {
            if (!edges.some( (edge) => edge.source === functionId && edge.target === target )) {
                newEdges.push(createNewEdge(functionId, target));
            }
        });
        updateLayout(nodes.concat(newNode), edges.concat(newEdges));

    }
    const createNewFunction = ( newFunctionId, newActionName = "" ) => {

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
            const newNode = createNewNode(newId);
            updateWorkflowAndLayout(newWorkflow, nodes.concat(newNode), edges)
        }
    };
    return { createNewFunction, createNewFunctionNode};

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
