import { useWorkflowContext } from "../../WorkflowContext";
import useUndo from "./Undo";
import useWorkflowUtils from "./WorkflowUtils";
import useLayoutUtils from './LayoutUtils'
import useUtils from "./Utils";

// Utilities for modifying nodes and edges
const useWorkflowAndLayoutUtils = () => {

    const {  
        nodes,
        edges,
        workflow
    } = useWorkflowContext();
    
    const {
        
    } = useUndo();

    const {
        addNode,
        addEdge,
        deleteNode,
        deleteEdge,
        updateEdge,
    } = useLayoutUtils()

    const {
        cycleDetection
    } = useUtils()


    const {
        addAction,
        deleteAction,
        addInvoke,
        deleteInvoke,
        updateInvoke,
        parseInvoke,
        applyWorkflowChanges
    } = useWorkflowUtils()

    /**
     * Adds a Action to Workflow and corresponding Node to layour/ReactFlowPanel
     * @param {string} actionId id of action being created
     * @param {object} actionOptions starting values for action
     * @param {object} nodeOptions starting values for node
     */
    const createActionAndNode = ( actionId, actionOptions = {}, nodeOptions = {}) => {
        addAction( actionId, actionOptions)
        addNode( actionId, nodeOptions)
        if (Object.keys(workflow.ActionList).length === 1){
            applyWorkflowChanges({ FunctionInvoke : actionId})
        }
    }

    const deleteActionAndNode = ( id ) => {
        deleteAction( id)
        deleteNode( id, true )
    }


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

    const createInvokeAndEdge = ( sourceId, targetId, condition = "Unconditional", rank = null) => {
        // Check for cycles
        if (cycleDetection(nodes, [...edges, { source : sourceId, target : targetId, id : sourceId+'-'+targetId}])){
            return
        }

        if(!isValidNewRankedEdge(sourceId, targetId, rank)){
            return
        }
        addInvoke( sourceId, targetId, condition, rank)
        
        const edgeColor = { "True" : "var(--edge-true-color)", "False" : "var(--edge-true-color)", "Unconditional" : "var(--edge-color)"}[condition]
        addEdge( sourceId, targetId, { color : edgeColor, thickness : rank > 1 ? 2 : 1, label : rank > 1 ? rank : ""})
    }

    const deleteInvokeAndEdge = ( source, target ) => {
        deleteEdge( source, target)
        deleteInvoke( source, target )
    }

    const updateInvokeAndEdge = ( actionId, invoke, changes ) => {
        const { id } = parseInvoke( invoke )
        const edgeChanges = {
        };
        updateEdge( actionId, id, {})
        updateInvoke( actionId, invoke, changes)
    }


    return {
        createActionAndNode,
        deleteActionAndNode,
        createInvokeAndEdge,
        deleteInvokeAndEdge,
        updateInvokeAndEdge,
    };

}

export default useWorkflowAndLayoutUtils
