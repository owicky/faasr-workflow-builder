import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";
import { MarkerType } from "@xyflow/react";
import useFunctionUtils from "./FunctionsUtils";



export const useCreateNewFunction = () => {
    const { workflow, nodes, edges} = useWorkflowContext();
    const { updateWorkflowAndLayout } = useUndo();
    const { createEdge } = useFunctionUtils();
    const FaaSServerList = Object.keys(workflow.ComputeServers);
    const defaultFaaSServer = FaaSServerList.length > 0 ? FaaSServerList[0] : "";

    const createNewNode = (newId, rank=1) => {
        const newNode = {
            id : newId,
            type: 'functionNode',
            position: ({
            x: 0,
            y: 0}),
            data: { id: newId, name : newId, direct: 1, rank: rank},
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

    // create layout edges from functionId to targetId given true, false, or uncondition invokeNext array
    // if targetId is undefined, return all outgoing edges 
    const getEdgesFromInvokeNext = (functionId, invokeNext, condition, targetId) => {
        let newEdges = [];
        invokeNext.forEach( (target) => {

            const splitInvokeNext = target.split('(');
            const invokeNextId = splitInvokeNext[0]

            const edgeExists = false//edges.some( (edge) => edge.source === functionId && edge.target === target)
            const edgeHasSpecifiedTarget = targetId === undefined || invokeNextId === targetId ;
            if (!edgeExists && edgeHasSpecifiedTarget ) {

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

    // return layout edges for all edges leading to actionId
    const getIncomingEdges = (actionId) => {
        let newEdges = [];
        Object.keys(workflow.ActionList).forEach( (id) => {
            if ( id === actionId ) {
                return;
            }
            const invokeNext = workflow.ActionList[id].InvokeNext;
            newEdges = [...newEdges, ...getEdgesFromInvokeNext(id, invokeNext.slice(1), "", actionId)];
            
            newEdges = [...newEdges, ...getEdgesFromInvokeNext(id, invokeNext[0].True, "True", actionId)];
            newEdges = [...newEdges, ...getEdgesFromInvokeNext(id, invokeNext[0].False, "False", actionId)]; 
            
        })
        return newEdges;
    }

    // Used to create layout node for existing function
    // pass in newActionId to make a duplicate based on functionId
    const createNewFunctionNode = (functionId, newWorkflow, newActionId) => {
        
        let currentWorkflow = workflow;

        if (newWorkflow !== null && newWorkflow !== undefined) {
            currentWorkflow = newWorkflow;
        }

        
        const invokeNext = currentWorkflow.ActionList[functionId].InvokeNext;

        let outgoingEdges = [...getEdgesFromInvokeNext(functionId, invokeNext.slice(1), "")];
        
        outgoingEdges = [...outgoingEdges, ...getEdgesFromInvokeNext(functionId, invokeNext[0].True, "True")];
        outgoingEdges = [...outgoingEdges, ...getEdgesFromInvokeNext(functionId, invokeNext[0].False, "False")];
        
        let incomingEdges = getIncomingEdges(functionId);
        let rank = 1 ;
        incomingEdges.forEach( (edge) => {
            if (edge.label !== "") rank = edge.label;
        });


        if (newActionId) {
            //replace functionId with newActionId (creating duplicate)
            outgoingEdges = outgoingEdges.map(edge => ({
                ...edge,
                source: edge.source === functionId ? newActionId : edge.source,
                id: newActionId+"-"+edge.target
            }));

            incomingEdges = incomingEdges.map(edge => ({
                ...edge,
                target: edge.target === functionId ? newActionId : edge.target,
                id: edge.source+"-"+newActionId
            }));
        }
    
        const newEdges = [...outgoingEdges, ...incomingEdges];
        const newNodeId = newActionId ? newActionId : functionId;
        const newNode = createNewNode(newNodeId, rank);

        return {newNode: newNode, newEdges: newEdges};


    }
    const duplicateFunction = ( existingId, newActionId, newActionName = "" ) => {

        if (!(newActionId in Object.keys(workflow.ActionList)) && (newActionName !== "")){
            console.log("is fresh")
            const existingFunction = workflow.ActionList[existingId];
            const newWorkflow = {
                ...workflow,
                ActionList: {
                    ...workflow.ActionList,
                    [newActionId]: {
                        FunctionName: newActionName,
                        FaaSServer: existingFunction.FaaSServer,
                        Arguments: existingFunction.Arguments,
                        InvokeNext: existingFunction.InvokeNext,
                        Type: existingFunction.Type
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
            const {newNode, newEdges} = createNewFunctionNode(existingId, newWorkflow, newActionId);


            // Only duplicate the node, not its edges
            updateWorkflowAndLayout(newWorkflow, [...nodes, newNode], edges)
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
                if (!(newId in Object.keys(workflow.ActionList)) && (newId !== "")){
                    setWorkflow({
                        ...workflow,
                        ActionList: {
                            ...workflow.ActionList,
                            [newId]: {
                                FunctionName: "",
                                FaaSServer: "GH",
                                Arguments: {
                                },
                                InvokeNext: [{}],
                                Type : "R"
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
