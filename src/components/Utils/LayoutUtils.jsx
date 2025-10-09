import { useWorkflowContext } from "../../WorkflowContext";
import useUndo from "./Undo";
import { addEdge as add_Edge, MarkerType} from '@xyflow/react';
import useWorkflowUtils from "./WorkflowUtils";
// Utilities for modifying nodes and edges

const useLayoutUtils = () => {

    const {  
        edges,
        nodes, 
    } = useWorkflowContext();
    
    const {
        updateLayout
    } = useUndo();

    const {
        deleteInvoke,
    } = useWorkflowUtils()

    /**
     * Adds a new edge to the layout/ReactFlowPanel
     * @param {string} sourceNodeId ex "action1"
     * @param {string} targetNodeId ex "action2"
     * @param {object} options ex { color : "var(--edge-true-color)", thickness : "2", label "3"
     */
    const addEdge = ( sourceNodeId, targetNodeId, { color = "var(--edge-color)", thickness = 1, label = "" } = {}, returnDontMutate = false) => {
        const newEdge = {
            animated : false,
            source : sourceNodeId,
            target : targetNodeId,
            markerEnd: {
                width: 10,
                height: 10,
                type: MarkerType.ArrowClosed,
                color: color,
            },
            style: {
                stroke: color,
                strokeWidth : 2 * thickness
            }, 
            id : sourceNodeId+"-"+targetNodeId,
            label: label
        };

        if (returnDontMutate){
            return { newNodes: nodes, newEdges : add_Edge(newEdge, edges)}
        } else updateLayout(nodes, add_Edge(newEdge, edges))
    }

    /**
     * Deletes an edge from the layout/ReactFlowPanel
     * @param {string} sourceNodeId ex "action1"
     * @param {string} targetNodeId ex "action2"
     */
    const deleteEdge = ( sourceNodeId, targetNodeId, returnDontMutate = false) => {
        const newNodes = nodes.map( node => {
            if (node.id === targetNodeId) {
                return {
                    ...node,
                    data : {
                        ...node.data,
                        rank : 1
                    }
                }
            }
            return node
        })
        const newEdges = edges.filter( edge => !(edge.source === sourceNodeId && edge.target === targetNodeId))
        if (returnDontMutate){
            return { newNodes: newNodes, newEdges : newEdges}
        } else updateLayout(newNodes , newEdges)
    }

    /**
     * Updates an edge in the layout/ReactFlowPanel with given object of changes
     * @param {string} sourceNodeId ex "action1"
     * @param {string} targetNodeId ex "action2"
     * @param {object} changes ex { label : "newLabel"} or { markerEnd { strokeWidth : "3"}}
     */
    const updateEdge = ( sourceNodeId, targetNodeId, changes, returnDontMutate = false) => {
        const newEdges = edges.map( edge => {
            if (edge.source === sourceNodeId && edge.target === targetNodeId){
                return {
                    ...edge,
                    ...changes,
                    markerEnd : {
                        ...edge.markerEnd,
                        ...changes.markerEnd
                    },
                    style : {
                        ...edge.style,
                        ...changes.style
                    }
                }    
            }
            return edge
        })
        if (returnDontMutate){
            return { newNodes: nodes, newEdges : newEdges}
        } else updateLayout(nodes, newEdges)
    }

    /**
     * Adds a new Node to the layout/ReactFlowPanel
     * @param {string} nodeId ex "action1"
     * @param {int} rank ex 3
     * @param {number} xPos distance from left edge of ReactFlowPanel
     * @param {number} yPos distance from top edge of ReactFlowPanel
     */
    const addNode = ( nodeId, options = {rank : undefined, xPos : 0, yPos : 0,}, returnDontMutate = false) => {
        const newNode = {
            id : nodeId,
            type: 'functionNode',
            position: ({
                x: options.xPos,
                y: options.yPos
            }),
            data: { id: nodeId, name : nodeId, rank : options.rank},
            origin: [0.5, 0.0],
        };

        if (returnDontMutate){
            return { newNodes: [...nodes, newNode], newEdges : edges}
        } else updateLayout([...nodes, newNode], edges)
    }

    /**
     * Deletes a node from the layout/ReactFlowPanel
     * @param {string} nodeId ex "action1" 
     * @param { boolean } deleteReferences whether all connected edges should be deeted as well and their workflows invokeNext
     */
    const deleteNode = ( nodeId, deleteReferences = false, returnDontMutate = false) => {
        let newNodes = nodes.filter( node => node.id !== nodeId)
        const newEdges = deleteReferences ? edges.filter( edge => {
            if (edge.target === nodeId){ // Remove from other actions InvokeNext
                deleteInvoke(edge.source, nodeId)
            }
            if(edge.source === nodeId){ // Reset rank of InvokeNexts to 1
                newNodes = newNodes.map( node => {
                    if (node.id === edge.target) {
                        return {
                            ...node,
                            data : {
                                ...node.data,
                                rank : 1
                            }
                        }
                    }
                    return node
                })
            }
            return !(edge.source === nodeId || edge.target === nodeId)
        }) : edges
        if (returnDontMutate){
            return { newNodes : newNodes, newEdges: newEdges}
        } else updateLayout( newNodes, newEdges)
    }
    /**
     * Updates a node in the layout/ReactFlowPanel with given object of changes
     * @param {string} nodeId ex "action1"
     * @param {object} changes ex { data : { rank : 5}
     */
    const updateNode = ( nodeId, changes, returnDontMutate = false) => {
        const newNodes = nodes.map( node => {
            if (node.id === nodeId){
                return {
                    ...node,
                    ...changes,
                    data : {
                        ...node.data,
                        ...changes.data
                    }
                }    
            }
            return node
        })
        if (returnDontMutate){
            return { newNodes : newNodes, newEdges: edges}
        } else updateLayout(newNodes, edges)
    }

    const createNodeObject = ( nodeId, rank = undefined, xPos = 0, yPos = 0 ) => {
        const newNode = {
            id : nodeId,
            type: 'functionNode',
            position: ({
                x: xPos,
                y: yPos
            }),
            data: { id: nodeId, rank : rank},
            origin: [0.5, 0.0],
        };
        return newNode;
    }

    const createEdgeObject = ( sourceNodeId, targetNodeId, { color = "var(--edge-color)", thickness = 1, label = "" } = {}) => {
        const newEdge = {
            animated : false,
            source : sourceNodeId,
            target : targetNodeId,
            markerEnd: {
                width: 10,
                height: 10,
                type: MarkerType.ArrowClosed,
                color: color,
            },
            style: {
                stroke: color,
                strokeWidth : 2 * thickness
            }, 
            id : sourceNodeId+"-"+targetNodeId,
            label: label
        };
        
        return newEdge;
    }

    return {
        addEdge,
        deleteEdge,
        updateEdge,
        addNode,
        deleteNode,
        updateNode,
        createNodeObject,
        createEdgeObject,
    };

}

export default useLayoutUtils