import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
// Added react-select for searchable dropdown. https://react-select.com/home
import CreatableSelect from "react-select/creatable";
import FunctionEditor from "./FunctionEditor";
import useUndo from "../Utils/Undo";
import useCreateNewFunction from "./FunctionCreator";

export default function FunctionsPanel(props){
    const {workflow, setWorkflow, edges, nodes, setNodes, selectedFunctionId, setSelectedFunctionId} = useWorkflowContext();
    const functionSearchOptions = Object.keys(workflow.FunctionList).map( (id) => {
        return { value: id, label: id }
    });
    const FaaSServerList = Object.keys(workflow.ComputeServers);
    const defaultFaaSServer = FaaSServerList.length > 0 ? FaaSServerList[0] : "";
    const {updateWorkflow, updateWorkflowAndLayout, updateSelectedFunctionId } = useUndo();
    const createNewFunction = useCreateNewFunction();
    const onCreateOption = (newActionId) => createNewFunction(newActionId);
    

    return(
        <div className="editor-panel">
            <h1>Actions</h1>
            <CreatableSelect 
                onChange={(e) => {updateSelectedFunctionId(e?.value ?? null)}}
                options={functionSearchOptions} 
                onCreateOption={onCreateOption}
                isClearable
                placeholder={"Start typing to create a new action..."}
                createOptionPosition={"first"}
            />
            
            <FunctionEditor createEdge={(a,b) => props.createEdge(a,b)} createNode={props.createNode} id={selectedFunctionId}/>  

        </div>     
    )
}
