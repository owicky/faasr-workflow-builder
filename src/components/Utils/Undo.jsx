import { useWorkflowContext } from "../../WorkflowContext";
import { useEffect } from "react";

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

    
    useEffect(() => {
        alert(`History changed: , ${history.length}\n undoHistory: ${undoHistory.length} `);
    }, [history]);
    

    const updateWorkflow = (newWorkflow) => {
        //alert('updating workflow...');
        setUndoHistory([]);
        const newState = structuredClone({
            nodes: nodes,
            edges: edges,
            selectedFunctionId: selectedFunctionId,
            workflow: newWorkflow
        });
        setHistory(hist => hist.concat(newState));
        setWorkflow(newWorkflow);
    }
    const updateLayout = (newNodes, newEdges) => {
        //alert('updating layout...');
        setUndoHistory([]);
        const newState = structuredClone({
            nodes: newNodes,
            edges: newEdges,
            selectedFunctionId: selectedFunctionId,
            workflow: workflow
        });
        setHistory(hist => hist.concat(newState));
        setNodes(newNodes);
        setEdges(newEdges);

    }
    const updateWorkflowAndLayout = (newWorkflow, newNodes, newEdges) => {
        setUndoHistory([]);
        const newState = structuredClone({
            nodes: newNodes,
            edges: newEdges,
            selectedFunctionId: selectedFunctionId,
            workflow: newWorkflow
        });
        setHistory(hist => hist.concat(newState));
        setNodes(newNodes);
        setEdges(newEdges); 
        setWorkflow(newWorkflow);
    }
    const updateSelectedFunctionId = (newSelectedFunctionId) => {
        setUndoHistory([]);
        const newState = structuredClone({
            nodes: nodes,
            edges: edges,
            selectedFunctionId: newSelectedFunctionId,
            workflow: workflow
        });
        setHistory(hist => hist.concat(newState));
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
        const undoneState = history.at(-1);
        const currentState = history.at(-2);
        setHistory(hist => hist.slice(0,-1));
        setUndoHistory(hist => hist.concat(undoneState));
        applyState(currentState);
    };

    const redo = () => {
        if (undoHistory.length < 1) {
            alert('Already at most recent state');
            return
        }   
        const redoneState = undoHistory.at(-1);
        setUndoHistory(hist => hist.slice(0,-1));
        setHistory(hist => hist.concat(redoneState));
        applyState(redoneState);
    }

    return {
        updateWorkflow,
        updateLayout,
        updateWorkflowAndLayout,
        updateSelectedFunctionId,
        undo,
        redo
    };

}

export default useUndo;
