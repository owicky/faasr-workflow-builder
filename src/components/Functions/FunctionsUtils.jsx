import { useWorkflowContext } from "../../WorkflowContext";
import useUndo from "../Utils/Undo";
import { MarkerType} from '@xyflow/react';

// Utilities for working with functions

const useFunctionUtils = () => {

    const { 
        workflow, 
        edges,
        nodes, 
    } = useWorkflowContext();
    
    const {
        updateWorkflow,
        updateWorkflowAndLayout,
    } = useUndo();


    // Get List of All InvokeNext values [id(rank),...]
    const listInvokeNext = (id) => {
        const invokes = []
        const invokeNext = workflow.FunctionList[id].InvokeNext

        const trueInvokes = invokeNext[0]["True"]
        const falseInvokes = invokeNext[0]["False"]
        const unconditionalInvokes = invokeNext[1]

        return invokes.concat(trueInvokes, falseInvokes, unconditionalInvokes)
    }

    // Combine id and rank (id, rank) => id(rank)
    const concatInvoke = (id, rank) => {
        const invoke = (rank > 1) ? id+"("+rank+")" : id

        return invoke
    }

    // Split invoke into id and rank (invoke) => {id, rank}
    const parseInvoke = (invoke) => {
        const hasRank = invoke.includes("(")
        const id = hasRank ? invoke.substring(0, invoke.indexOf("(") ) : invoke

        const rank = hasRank ? invoke.substring(invoke.indexOf("(") + 1, invoke.indexOf(")") ) : 1

        return { id : id, rank : rank}
    }

    // Find true/false/unconditional value of invoke
    const getInvokeCondition = (funcId, invoke) => {
        const invokeNext = workflow.FunctionList[funcId].InvokeNext
        if ( invokeNext[0].True.includes(invoke)) return "True"
        else if ( invokeNext[0].False.includes(invoke)) return "False"
        else if (invokeNext[1].includes(invoke)) return "unclassified"
        return ""
    }

    // Remove an invoke from functions InvokeNext and delete corresponding Edge
    const deleteInvoke = (funcId, invoke) => {
        let newInvokeNext = workflow.FunctionList[funcId].InvokeNext
        const {id} = parseInvoke(invoke)
        const condition = getInvokeCondition(funcId, invoke)

        switch (condition){
            case "True":
                newInvokeNext = [
                    {
                        ...newInvokeNext[0],
                        True: [...newInvokeNext[0].True.filter( (inv) => inv !== invoke )]
                    },
                    newInvokeNext[1]
                ];
                break;
            case "False":
                
                newInvokeNext = [
                    {
                        ...newInvokeNext[0],
                        False: [...newInvokeNext[0].False.filter( (inv) => inv !== invoke )]
                    },
                    newInvokeNext[1]
                ];
                break;
            case "Unclassified":
                newInvokeNext = [
                    newInvokeNext[0],
                    [...newInvokeNext[1].filter( (inv) => inv !== invoke ) ]
                ];
                break;
            default:
                alert("Deletion Attempted fo Invoke that does not exist ("+funcId+", "+invoke)
        }

        const updatedEdges = edges.filter( (edge) => !(edge.source === funcId && edge.target === id))
        const updatedNodes = nodes.map( (node) => {
            // Set target rank to 1
            if (node.id === id){
                return {
                    ...node,
                    data : {
                        ...node.data,
                        rank : 1
                    }
                }
            }else{
                return node
            }
        })
        const updatedWorkflow = {
            ...workflow,
            FunctionList : {
                ...workflow.FunctionList,
                [funcId] : {
                    ...workflow.FunctionList[funcId],
                    InvokeNext : newInvokeNext
                }
            }
        }

        updateWorkflowAndLayout(updatedWorkflow, updatedNodes, updatedEdges)
    }

    const addInvoke = (funcId, id, rank, condition) => {
        if ( rank > 1 && !isValidNewRankedEdge(funcId, id, rank)){
            alert("Breaks Rank rules")
            return
        }

        let newInvokeNext = [...workflow.FunctionList[funcId].InvokeNext]
        const newInvoke = rank > 1 ? id+"("+rank+")" : id

        switch (condition) {
            case "True":
                newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    True: [...newInvokeNext[0].True, newInvoke]
                },
                newInvokeNext[1]
                ];
                break;
            case "False":
                newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    False: [...newInvokeNext[0].False, newInvoke]
                },
                newInvokeNext[1]
                ];
                break;
            case "condition":
                newInvokeNext = [
                newInvokeNext[0],
                [...newInvokeNext[1], newInvoke]
                ];
                break;
            default:
                // optional: handle default case
                break;
            }

        
        updateWorkflow({
            ...workflow,
            FunctionList : {
                ...workflow.FunctionList,
                [funcId] : {
                    ...workflow.FunctionList[funcId],
                    InvokeNext : newInvokeNext
                }
            }
        })
    }

    const isValidNewRankedEdge = (source, target, rank) => {
        const rankedEdge = rank > 1
        const sourceRank = nodes.find( node => node.id === source).data.rank
        const targetRank = nodes.find( node => node.id === target).data.rank

        if (sourceRank > 1){
            alert("Ranked action may not invoke another ranked action")
            return false
        }

        for (const edge of edges){
            // Check if target has too many predecessors
            if ((edge.target === target) && ( rankedEdge || targetRank > 1) && (edge.source !== source)){
                alert("Ranked action may not have more than one predecessor")
                return false
            }
            // Check if targets invokes have rank
            if ( (edge.source === target) && rankedEdge && ( nodes.find( node => (node.id === edge.target)).data.rank > 1)){
                alert("Ranked action may not invoke another ranked action")
                return false
            }
        };

        return true
    }

    const createNewEdge = (id1, id2) => {
        const newEdge = {
        animated : false,
        source : id1,
        target : id2,
        markerEnd: {
            width: 10,
            height: 10,
            type: MarkerType.ArrowClosed,
            color: "#000000",
        },
        style: {
            stroke: "#000000",
            strokeWidth : 2
        }, 
        id : id1+"-"+id2
        };
        
        return newEdge;  
    }
      // creates a new edge and applies it
    const createEdge = (id1, id2, rank, condition) => {


    

        let colorc = ""
        const updatedNodes = [...nodes]


        switch(condition) {
        case "False":
            colorc = "#F52F16"; 
            break;
        case "True":
            colorc = "#1BF23D";
            break;
        default:
            colorc = "#000000";
        }
        if ( rank !== ""  ) {
        // if (nodes.some( (node) => (node.data.rank > 1 && node.data.id === id2))) alert("target Already Has Rank Specified")
        const nodeIndex = nodes.findIndex( (node) => node.id === (id2))
        updatedNodes[nodeIndex] = {...updatedNodes[nodeIndex], data : {...updatedNodes[nodeIndex].data, rank : rank}}
        // else{
        // }
        }

        const newEdge = createNewEdge(id1, id2);
        // updateLayout(updatedNodes, edges.concat());
        
        return({ updateNode : updatedNodes, updateEdge : {
        ...newEdge,
        markerEnd: {
            ...newEdge.markerEnd,
            color : colorc,
            height : rank > 1 ? 8 : 10,
            width : rank > 1 ? 8 : 10
        },
        style: {
            stroke: colorc,
            strokeWidth : rank > 1 ? 4 : 2
        }, 
        label : (rank > 1 ) ? rank : "" } 
            
        })
    }

    const updateInvoke = (funcId, invoke, newId, newRank, newCondition) => {

        let newInvokeNext = [...workflow.FunctionList[funcId].InvokeNext]

        const {id} = parseInvoke(invoke)
        if(!isValidNewRankedEdge(funcId, newId, newRank)){
            return
        }
        
        const newInvoke = newRank > 1 ? newId +"("+newRank+")" : newId

        if ( newInvokeNext[0].True.includes(invoke) ){
            newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    True: [...newInvokeNext[0].True.filter( (inv) => inv !== invoke )]
                },
                newInvokeNext[1]
            ];
        }
        else if ( newInvokeNext[0].False.includes(invoke) ){

            newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    False: [...newInvokeNext[0].False.filter( (inv) => inv !== invoke )]
                },
                newInvokeNext[1]
            ];
        }
        else{
            newInvokeNext = [
                newInvokeNext[0],
                [...newInvokeNext[1].filter( (inv) => inv !== invoke ) ]
            ];
        }

        switch (newCondition) {
            case "True":
                newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    True: [...newInvokeNext[0].True, newInvoke]
                },
                newInvokeNext[1]
                ];
                break;
            case "False":
                newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    False: [...newInvokeNext[0].False, newInvoke]
                },
                newInvokeNext[1]
                ];
                break;
            default:
                newInvokeNext = [
                newInvokeNext[0],
                [...newInvokeNext[1], newInvoke]
                ];
            }


        const updatedEdges = edges.filter( (edge) => !(edge.source === funcId && edge.target === id))        

        const {updateNode, updateEdge} = createEdge(funcId, newId, newRank, newCondition)
        updateWorkflowAndLayout({
            ...workflow,
            FunctionList : {
                ...workflow.FunctionList,
                [funcId] : {
                    ...workflow.FunctionList[funcId],
                    InvokeNext : newInvokeNext
                }
            }
        }, updateNode.map( (node) => {
            if (node.id === id){
                if (node.id !== newId){
                    return {
                        ...node,
                        data : {
                            ...node.data,
                            rank : 1
                        }
                    }
                }else{
                    return {
                        ...node,
                        data : {
                            ...node.data,
                            rank : newRank
                        }
                    }
                }
            }else{
                return node
            }
        } ), updatedEdges.concat(updateEdge))

    }


    return {
        listInvokeNext,
        parseInvoke,
        concatInvoke,
        getInvokeCondition,
        addInvoke,
        deleteInvoke,
        isValidNewRankedEdge,
        updateInvoke
    };

}

export default useFunctionUtils;


// Action A has rank it must have only one predecessor and may not invoke another Action with ra