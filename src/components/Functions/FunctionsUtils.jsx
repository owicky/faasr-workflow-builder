import { useWorkflowContext } from "../../WorkflowContext";
import useUndo from "../Utils/Undo";
import { addEdge, MarkerType} from '@xyflow/react';

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
        const invokeNext = workflow.ActionList[id].InvokeNext

        const trueInvokes = invokeNext[0].True 
        const falseInvokes = invokeNext[0].False
        const unconditionalInvokes = invokeNext.slice(1)

        return invokes.concat(trueInvokes, falseInvokes, unconditionalInvokes)
    }

    // Combine id and rank (id, rank) => id(rank)
    const concatInvoke = (id, rank) => {
        const invoke = (rank > 1) ? id+"("+rank+")" : id

        return invoke
    }

    // Split invoke into id and rank (invoke) => {id, rank}
    const parseInvoke = (invoke) => {
        if (!invoke){
            alert("can not parse undefined invoke")
        }
        const hasRank = invoke.includes("(")
        const id = hasRank ? invoke.substring(0, invoke.indexOf("(") ) : invoke

        const rank = hasRank ? invoke.substring(invoke.indexOf("(") + 1, invoke.indexOf(")") ) : 1

        return { id : id, rank : rank}
    }

    // Find true/false/unconditional value of invoke
    const getInvokeCondition = (funcId, invoke) => {
        const invokeNext = workflow.ActionList[funcId].InvokeNext
        if ( invokeNext[0].True.includes(invoke)) return "True"
        else if ( invokeNext[0].False.includes(invoke)) return "False"
        else if (invokeNext.includes(invoke)) return "Unclassified"
        return ""
    }

    // Remove an invoke from functions InvokeNext and delete corresponding Edge
    const deleteInvoke = (funcId, invoke) => {
        let newInvokeNext = workflow.ActionList[funcId].InvokeNext
        const {id} = parseInvoke(invoke)
        const condition = getInvokeCondition(funcId, invoke)

        switch (condition){
            case "True":
                newInvokeNext = [
                    {
                        ...newInvokeNext[0],
                        True: [...newInvokeNext[0].True.filter( (inv) => inv !== invoke )]
                    },
                    ...newInvokeNext.slice(1)
                ];
                break;
            case "False":
                
                newInvokeNext = [
                    {
                        ...newInvokeNext[0],
                        False: [...newInvokeNext[0].False.filter( (inv) => inv !== invoke )]
                    },
                    ...newInvokeNext.slice(1)
                ];
                break;
            case "Unclassified":
                newInvokeNext = [
                    newInvokeNext[0],
                    ...newInvokeNext.slice(1).filter( (inv) => inv !== invoke )
                ];
                break;
            default:
                alert("Deletion Attempted to Invoke that does not exist ("+funcId+", "+invoke)
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
            ActionList : {
                ...workflow.ActionList,
                [funcId] : {
                    ...workflow.ActionList[funcId],
                    InvokeNext : newInvokeNext
                }
            }
        }

        updateWorkflowAndLayout(updatedWorkflow, updatedNodes, updatedEdges)
    }

    // Adds new Invoke to workflow
    const addInvoke = (funcId, id, rank, condition) => {
        if ( rank > 1 && !isValidNewRankedEdge(funcId, id, rank)){
            alert("Breaks Rank rules")
            return
        }

        let newInvokeNext = [...workflow.ActionList[funcId].InvokeNext]
        const newInvoke = rank > 1 ? id+"("+rank+")" : id

        switch (condition) {
            case "True":
                newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    True: [...newInvokeNext[0].True, newInvoke]
                },
                ...newInvokeNext.slice(1)
                ];
                break;
            case "False":
                newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    False: [...newInvokeNext[0].False, newInvoke]
                },
                    ...newInvokeNext.slice(1)
                ];
                break;
            case "Unconditional":
                newInvokeNext = [
                    newInvokeNext[0],
                    ...newInvokeNext.slice(1),
                    newInvoke
                ];
                break;
            default:
                break;
            }

        
        updateWorkflow({
            ...workflow,
            ActionList : {
                ...workflow.ActionList,
                [funcId] : {
                    ...workflow.ActionList[funcId],
                    InvokeNext : newInvokeNext
                }
            }
        })
    }

    // Checks if new edge violates rank rules
    const isValidNewRankedEdge = (source, target, rank) => {
        const rankedEdge = rank > 1
        const sourceRank = nodes.find( node => node.id === source).data.rank
        const targetRank = nodes.find( node => node.id === target).data.rank

        if (sourceRank > 1 && rankedEdge){
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

    // generate edge object
    const createNewEdge = (id1, id2, rank = 1, condition = "Unconditional") => {
        const thickness = rank > 1 ? 2 : 1
        const edgeColor = { "True" : "var(--edge-true-color)", "False" : "var(--edge-true-color)", "Unconditional" : "var(--edge-color)"}[condition]
        const newEdge = {
        animated : false,
        source : id1,
        target : id2,
        markerEnd: {
            width: 10,
            height: 10,
            type: MarkerType.ArrowClosed,
            color: edgeColor,
        },
        style: {
            stroke: edgeColor,
            strokeWidth : 2 * thickness
        },
        label : rank > 1 ? rank : "",
        id : id1+"-"+id2
        };
        
        return newEdge;  
    }
      // creates a new edge given rank and condition 
    const createEdge = (id1, id2, rank, condition) => {
        
        let colorc = ""
        const updatedNodes = [...nodes]


        // Set Color based on condition
        switch(condition) {
            case "False":
                colorc = "var(--edge-false-color)"; 
                break;
            case "True":
                colorc = "var(--edge-true-color)";
                break;
            default:
                colorc = "var(--edge-color)";
        }

        // If edge has a rank (skip if it hasn't been added to layout yet)
        if ( rank !== "" ) {
            const nodeIndex = nodes.findIndex( (node) => node.id === (id2)) // Get target node index
            if ( nodeIndex != -1) {
                updatedNodes[nodeIndex] = {...updatedNodes[nodeIndex], data : {...updatedNodes[nodeIndex].data, rank : rank}} // Update nodes rank 
            }
        }

        // Generate edge object
        const newEdge = createNewEdge(id1, id2);
        

        return({ updateNode : updatedNodes, updateEdge : {
            ...newEdge,
            markerEnd: {
                ...newEdge.markerEnd,
                color : colorc,
                height : rank > 1 ? 8 : 10, // Thicker if ranked edge
                width : rank > 1 ? 8 : 10 // Thicker if ranked edge
            },
            style: {
                stroke: colorc,
                strokeWidth : rank > 1 ? 4 : 2 // Thicker if ranked edge
            }, 
            label : (rank > 1 ) ? rank : "" }  // Add label if edge has rank > 1
        })
    }

    const updateInvoke = (funcId, invoke, newId, newRank, newCondition) => {

        let newInvokeNext = [...workflow.ActionList[funcId].InvokeNext]

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
                ...newInvokeNext.slice(1)
            ];
        }
        else if ( newInvokeNext[0].False.includes(invoke) ){

            newInvokeNext = [
                {
                    ...newInvokeNext[0],
                    False: [...newInvokeNext[0].False.filter( (inv) => inv !== invoke )]
                },
                ...newInvokeNext.slice(1)
            ];
        }
        else{
            newInvokeNext = [
                newInvokeNext[0],
                ...newInvokeNext.slice(1).filter( (inv) => inv !== invoke )
            ];
        }

        switch (newCondition) {
            case "True":
                newInvokeNext = [
                    {
                        ...newInvokeNext[0],
                        True: [...newInvokeNext[0].True, newInvoke]
                    },
                    ...newInvokeNext.slice(1)
                ];
                break;
            case "False":
                newInvokeNext = [
                    {
                        ...newInvokeNext[0],
                        False: [...newInvokeNext[0].False, newInvoke]
                    },
                    ...newInvokeNext.slice(1)
                ];
                break;
            default:
                newInvokeNext = [
                    newInvokeNext[0],
                    ...newInvokeNext.slice(1),
                    newInvoke
                ];
            }


        const updatedEdges = edges.filter( (edge) => !(edge.source === funcId && edge.target === id))        

        const {updateNode, updateEdge} = createEdge(funcId, newId, newRank, newCondition)
        updateWorkflowAndLayout({
            ...workflow,
            ActionList : {
                ...workflow.ActionList,
                [funcId] : {
                    ...workflow.ActionList[funcId],
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

    /* Adds a new edge to the workflow and layout given a (Source id, Target id, edge) rank 1 unconditional
    */
    const add_edge = (sourceId, targetId, customEdge) => {
        // Get the function object for the source
        const sourceFunction = workflow.ActionList[sourceId];
        
        if (!sourceFunction) {
        console.error(`Source function '${sourceId}' not found.`);
        return;
        } 
    
        // Create updated source function with new InvokeNext
        const updatedSourceFunction = {
            ...sourceFunction,
            InvokeNext: [...sourceFunction.InvokeNext, targetId]
        };
    
        // Build new ActionList with updated source function
        const updatedActionList = {
            ...workflow.ActionList,
            [sourceId]: updatedSourceFunction,
        };
    
        // Update entire workflow
        const updatedWorkflow = {
            ...workflow,
            ActionList: updatedActionList,
        };
    
        updateWorkflowAndLayout(updatedWorkflow, nodes, edges.concat(customEdge));
    };

    return {
        listInvokeNext,
        parseInvoke,
        concatInvoke,
        getInvokeCondition,
        addInvoke,
        deleteInvoke,
        isValidNewRankedEdge,
        updateInvoke,
        createEdge,
        add_edge,
        createNewEdge,
    };

}

export default useFunctionUtils;


// Action A has rank it must have only one predecessor and may not invoke another Action with ra
