import { useWorkflowContext } from "../../WorkflowContext";
import { useState } from "react";

{/* History entry: {
    nodes,
    edges,
    selectedFunctionId,
    deletedActions,
    workflow
}
*/}


const useUndo = () => {

    const { 
        workflow, setWorkflow, 
        edges, setEdges, 
        nodes, setNodes, 
        selectedFunctionId, setSelectedFunctionId, 
        history, setHistory,
        undoHistory, setUndoHistory
    } = useWorkflowContext();

    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    /* for testing
    useEffect(() => {
        alert(`History changed: , ${history.length}\n undoHistory: ${undoHistory.length} `);
    }, [history]);
    */

    const addToHistory = (newState) => {
        setUndoHistory([]);
        setCanRedo(false);
        setCanUndo(true);
        setHistory(hist => hist.concat(newState));
    }
    

    const updateWorkflow = (newWorkflow) => {
        //alert('updating workflow...');
        const newState = structuredClone({
            nodes: nodes,
            edges: edges,
            selectedFunctionId: selectedFunctionId,
            workflow: newWorkflow
        });
        addToHistory(newState);
        setWorkflow(newWorkflow);
    }
    const updateLayout = (newNodes, newEdges) => {
        //alert('updating layout...');
        const newState = structuredClone({
            nodes: newNodes,
            edges: newEdges,
            selectedFunctionId: selectedFunctionId,
            workflow: workflow
        });
        addToHistory(newState);
        setNodes(newNodes);
        setEdges(newEdges);

    }
    const updateWorkflowAndLayout = (newWorkflow, newNodes, newEdges) => {
        const newState = structuredClone({
            nodes: newNodes,
            edges: newEdges,
            selectedFunctionId: selectedFunctionId,
            workflow: newWorkflow
        });
        addToHistory(newState);
        setNodes(newNodes);
        setEdges(newEdges); 
        setWorkflow(newWorkflow);
    }
    const updateSelectedFunctionId = (newSelectedFunctionId) => {
        const newState = structuredClone({
            nodes: nodes,
            edges: edges,
            selectedFunctionId: newSelectedFunctionId,
            workflow: workflow
        });
        addToHistory(newState);
        setSelectedFunctionId(newSelectedFunctionId);

    };

    const applyState = (newState) => {
        setNodes(newState.nodes);
        setEdges(newState.edges);
        setSelectedFunctionId(newState.selectedFunctionId);
        setWorkflow(newState.workflow);
    };

    const undo = () => {
        if (history.length <= 1){
            alert('Already at oldest state');
            return
        }
        if (history.length <= 2) {
            setCanUndo(false);
        }
        const undoneState = history.at(-1);
        const currentState = history.at(-2);
        setHistory(hist => hist.slice(0,-1));
        setUndoHistory(hist => hist.concat(undoneState));
        applyState(currentState);
        setCanRedo(true);
    };

    const redo = () => {
        if (undoHistory.length <= 0) {
            alert('Already at most recent state');
            return
        }   
        if (undoHistory.length <= 1) {
            setCanRedo(false);
        }
        const redoneState = undoHistory.at(-1);
        setUndoHistory(hist => hist.slice(0,-1));
        setHistory(hist => hist.concat(redoneState));
        applyState(redoneState);
        setCanUndo(true);
    }

    return {
        updateWorkflow,
        updateLayout,
        updateWorkflowAndLayout,
        updateSelectedFunctionId,
        undo,
        redo,
        canUndo,
        canRedo
    }
}

export default useUndo;
