import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
// Added react-select for searchable dropdown. https://react-select.com/home
import CreatableSelect from "react-select/creatable";
import FunctionEditor from "./FunctionEditor";
import FunctionCreator from "./FunctionCreator";

export default function FunctionsPanel(props){
    const {workflow, setWorkflow, setNodes, selectedFunctionId, setSelectedFunctionId} = useWorkflowContext();
    const functionSearchOptions = Object.keys(workflow.FunctionList).map( (id) => {
        return { value: id, label: id }
    });
    const FaaSServerList = Object.keys(workflow.ComputeServers);
    const defaultFaaSServer = FaaSServerList.length > 0 ? FaaSServerList[0] : "";
    

    const onCreateOption = ( newFunctionId ) => {
        const newId = newFunctionId;
        if (!(newId in Object.keys(workflow.FunctionList)) && (newId !== "")){
            setWorkflow({
                ...workflow,
                FunctionList: {
                    ...workflow.FunctionList,
                    [newId]: {
                        FunctionName: "",
                        FaaSServer: defaultFaaSServer,
                        Arguments: {
                        },
                        InvokeNext: []
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
        }
    }


    return(
        <div class="editor-panel">
            <h1>Functions</h1>
            <CreatableSelect 
                onChange={(e) => {setSelectedFunctionId(e?.value ?? null)}}
                options={functionSearchOptions} 
                onCreateOption={onCreateOption}
                isClearable
            />
            {/* Moved the CreateFunction logic into the parent component; Got rid of the button*/}
            <FunctionEditor createEdge={(a,b) => props.createEdge(a,b)} id={selectedFunctionId}/>  

        </div>     
    )
}
