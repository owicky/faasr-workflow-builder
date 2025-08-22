import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";
import { MarkerType } from "@xyflow/react";
import useFunctionUtils from "./FunctionsUtils";



export const useCreateNewFunction = () => {
    const { workflow, nodes, edges } = useWorkflowContext();
    const { updateLayout, updateWorkflowAndLayout } = useUndo();
    const { createEdge } = useFunctionUtils();
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
            width: 10,
            height: 10,
            type: MarkerType.ArrowClosed
        },
        style: {
            strokeWidth : 2
        }, 
        id : id1+"-"+id2
        };
        
        return newEdge;  
    }

    // create layout edges given true, false, or uncondition invokeNext array
    const getEdgesFromInvokeNext = (functionId, invokeNext, condition) => {
        let newEdges = [];
        invokeNext.forEach( (target) => {
            if (!edges.some( (edge) => edge.source === functionId && edge.target === target )) {
                const splitInvokeNext = target.split('(');
                const invokeNextId = splitInvokeNext[0]
                let rank = "";
                if (splitInvokeNext.length > 1) {
                    const rankPostfix = splitInvokeNext[1].split(')');
                    if (rankPostfix.length <= 1) {
                        alert(`Error: InvokeNext ${target} is invalid, it must be in the form func_name(rank)`);
                    } else {
                        rank = parseInt(rankPostfix[0]);
                    }
                }
                newEdges.push(createEdge(functionId, invokeNextId, rank, condition).updateEdge);
            }
        });
        return newEdges;
    }

    // Used to create layout node for existing function
    const createNewFunctionNode = (functionId, newWorkflow) => {
        
        let currentWorkflow = workflow;

        if (newWorkflow !== null && newWorkflow !== undefined) {
            currentWorkflow = newWorkflow;
        }

        const newNode = createNewNode(functionId);
        let newEdges = [];
        const invokeNext = currentWorkflow.FunctionList[functionId].InvokeNext;

        newEdges = [...getEdgesFromInvokeNext(functionId, invokeNext[1], "")];
        
        newEdges = [...newEdges, ...getEdgesFromInvokeNext(functionId, invokeNext[0].True, "True")];
        newEdges = [...newEdges, ...getEdgesFromInvokeNext(functionId, invokeNext[0].False, "False")];

        return {newNode: newNode, newEdges: newEdges};


    }
    const duplicateFunction = ( existingId, newActionId, newActionName = "" ) => {

        if (!(newActionId in Object.keys(workflow.FunctionList)) && (newActionName !== "")){
            console.log("is fresh")
            const existingFunction = workflow.FunctionList[existingId];
            const newWorkflow = {
                ...workflow,
                FunctionList: {
                    ...workflow.FunctionList,
                    [newActionId]: {
                        FunctionName: newActionName,
                        FaaSServer: existingFunction.FaaSServer,
                        Arguments: existingFunction.Arguments,
                        InvokeNext: existingFunction.InvokeNext
                    }
                },
                ActionContainers: {
                    ...workflow.ActionContainers,
                    [newActionId]: workflow.ActionContainers[existingId]
                },
                FunctionGitRepo: {
                    ...workflow.FunctionGitRepo,
                    [newActionId]: workflow.FunctionGitRepo[existingId]
                }
            };
            const {newNode, newEdges} = createNewFunctionNode(newActionId, newWorkflow);

            updateWorkflowAndLayout(newWorkflow, [...nodes, newNode], [...edges, ...newEdges])
        }
    };
    return { duplicateFunction, createNewFunctionNode };

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
