import { useState } from "react";
import { useWorkflowContext } from "../../WorkflowContext"
// Added react-select for searchable dropdown. https://react-select.com/home
import CreatableSelect from "react-select/creatable";
import FunctionEditor from "./FunctionEditor";
import useUndo from "../Utils/Undo";
import useCreateNewFunction from "./FunctionCreator"
import useWorkflowAndLayoutUtils from "../Utils/WorkflowAndLayoutUtils";

export default function FunctionsPanel(props){
    const {workflow, setWorkflow, edges, nodes, setNodes, selectedFunctionId, setSelectedFunctionId} = useWorkflowContext();
    const functionSearchOptions = Object.keys(workflow.ActionList).map( (id) => {
        return { value: id, label: id }
    });
    const { createActionAndNode} = useWorkflowAndLayoutUtils()
    const FaaSServerList = Object.keys(workflow.ComputeServers);
    const defaultFaaSServer = FaaSServerList.length > 0 ? FaaSServerList[0] : "";
    const { updateSelectedFunctionId } = useUndo();
    const onCreateOption = (newActionId) => createActionAndNode(newActionId);
    const actionNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*(?:\\([0-9]+\\))?$/
    const [ inputValue, setInputValue ] = useState("")

    const isValidInput = (val) => {

        return (val === "" || actionNameRegex.test(val))
    }

    return(
        <div className="editor-panel">
            <h1>Actions</h1>
            <CreatableSelect 
                onChange={(e) => {
                    updateSelectedFunctionId(e?.value ?? null);
                }}
                options={functionSearchOptions} 
                onCreateOption={onCreateOption}
                isClearable
                placeholder={"Start typing to create a new action..."}
                createOptionPosition={"first"}
                inputValue={inputValue}
                onInputChange={ (val) => {
                        if (isValidInput(val)) {
                            setInputValue(val)
                        }

                        return val
                    }
                }
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: "var(--background)",
                        color: "var(--text-primary)",
                        width: "90%",
                    }),
                    singleValue: (baseStyles) => ({
                        ...baseStyles,
                        color: "var(--text-primary)", 
                    }),
                    placeholder: (baseStyles) => ({
                        ...baseStyles,
                        color: "var(--text-primary)", 
                    }),
                    input: (baseStyles) => ({
                    ...baseStyles,
                    color: "var(--text-primary)",
                    }),
                    option: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: state.isFocused ? "grey" : "var(--background)",
                        color: "var(--text-primary)",
                    }),
                    menu:  (baseStyles) => ({
                        ...baseStyles,
                        border: "2px solid var(--border-color)",
                        backgroundColor:  "var(--background)",
                        backgroundClip: "padding-box"                   
                    })
                }}
            />
            
            <FunctionEditor addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} createEdge={(a,b, c, d) => props.createEdge(a,b, c, d)} createNewEdge={props.createNewEdge} id={selectedFunctionId}/>  

        </div>     
    )
}
