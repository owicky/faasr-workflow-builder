import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import TextInput from "../Utils/TextInput";
import GenericLabel from "../Utils/GenericLabel";
import useUndo from "../Utils/Undo";
import useCreateNewFunction from "./FunctionCreator"
import ComputeServerSelector from "./EditorComponents/ComputeServerSelector"
import ArgumentsEditor from "./EditorComponents/ArgumentsEditor"
import InvokeNextEditor from "./EditorComponents/InvokeNextEditor"
import CranPackageEditor from "./EditorComponents/CranPackageEditor";
import GitPackageEditor from "./EditorComponents/GitPackageEditor";
import GitRepoPathEditor from "./EditorComponents/GitRepoPathEditor";
import useWorkflowUtils from "../Utils/WorkflowUtils";
import PyPIPackageEditor from "./EditorComponents/PyPIPackageEditor";


export default function FunctionEditor(props){
    const {workflow, edges, selectedFunctionId,nodes} = useWorkflowContext();
    const id = (selectedFunctionId !== null && workflow.ActionList.hasOwnProperty(selectedFunctionId) ) ? selectedFunctionId : (Object.keys(workflow.ActionList)[0] || null)

    const [newActionId, setNewActionId] = useState("")
    const { updateWorkflow, updateLayout, updateWorkflowAndLayout } = useUndo();
    const { duplicateFunction, createNewFunctionNode } = useCreateNewFunction();
    const { updateAction, applyWorkflowChanges } = useWorkflowUtils()
    const [ addToLayoutError, setAddToLayoutError ] = useState(false)
    const [ duplicateError, setDuplicateError ] = useState('')

    const handleBlur = (e) => {
        updateWorkflow(workflow);
    };

    const clearAddToLayoutError = () => {
        setAddToLayoutError(false);  
    }

    const clearDuplicateError = () => {
        setDuplicateError('');  
    }

    if(id in workflow.ActionList){
        return(

            // Function Edit Box
            <div >
                <h1>{id}</h1>

                <br></br>
                {/* Add/remove from graph & delete permanently*/}
                <div>
                    {addToLayoutError ? 
                        <p className="error-text">That action is already in the graph.</p>:
                        <></>
                    }
                    <button onClick={ () => {
                        if(nodes.some( (node) => node?.id === id )) {
                            setAddToLayoutError(true);
                        } else {
                            const {newNode, newEdges} = createNewFunctionNode(id);
                            updateLayout([...nodes, newNode], [...edges, ...newEdges]);
                        }   
                    }}
                    onBlur={clearAddToLayoutError}
                    >Add Action to Layout</button>
                </div>

                {/* button to delete action from graph */}
                <div>
                    <button onClick={ () => {
                        updateLayout( 
                            nodes.filter( (node) =>node.id !== id),
                            edges.filter( (edge) => edge.source !== id && edge.target !== id)
                        ); 
                    }}>Delete Action from Layout</button>
                </div>

                {/* Button to delete action permanently */}

                <div>
                    <button onClick={ () => {
                        const newWorkflow = structuredClone(workflow);
                        delete newWorkflow.ActionList[id];
                        updateWorkflowAndLayout(
                            newWorkflow,
                            nodes.filter( (node) =>node.id !== id),
                            edges.filter( (edge) => edge.source !== id && edge.target !== id)
                        );
                    }}>Delete Action Permanently</button>
                </div>
                <br></br>

                {/* Duplicate Action Div */}
                { duplicateError !== '' ? 
                    <p className="error-text">{duplicateError}</p>:
                    <></>
                }
                <GenericLabel value={"Duplicate Action"} size={"20px"}>
                    <TextInput id={"dupename-"+{id}} key={`dupename-${id}`}value={newActionId} onChange={(e) => {
                        const newName = e.target.value
                        const actionNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*(?:\\([0-9]+\\))?$/
                        if (newName === "" || actionNameRegex.test(newName)) setNewActionId( e.target.value)
                    }} placeholder={"New Action Id"}></TextInput>
                    <button style={{ display: "inline-flex", flex: "0 0 auto"}} onClick={ () => {
                        // Add new action to workflow
                        if (newActionId === "") {
                            setDuplicateError('The new Action\'s ID can\'t be empty.');
                        }
                        else if (!(newActionId in workflow.ActionList)){
                            duplicateFunction(id, newActionId, `${workflow.ActionList[id].FunctionName}`);   
                            setNewActionId("");
                        }else{
                            setDuplicateError('An action with that ID already exists');
                        }
                    }
                    }
                        onBlur={clearDuplicateError}
                    > Duplicate Action</button>
                </GenericLabel>

                {/* Function Name Input */}
                <GenericLabel size={"20px"} value={"Function Name"} required={true}>
                {/* set workflow onChange, but only update history on blur*/}
                <TextInput 
                    value={workflow.ActionList[id].FunctionName}
                    key={`fname-input-${id}`}
                    onChange={(e) => 
                        {
                            const newName = e.target.value
                            const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

                            if (regex.test(newName) || newName === "") updateAction(id, { FunctionName : newName});
                        }
                    }
                    onBlur={handleBlur}
                />
                </GenericLabel>
                <br></br>

            
                {/* Type */}
                <GenericLabel size={"20px"} value={"Language"} required={true}>
                <select value={workflow.ActionList[id].Type} onChange={(e) => {
                    const type = e.target.value;


                    applyWorkflowChanges({
                        ...workflow,
                        ActionList: {
                            ...workflow.ActionList,
                            [id]: {
                                ...workflow.ActionList[id],
                                Type : type
                            }
                        }
                    })   
                }}
                onBlur={handleBlur}>
                    <option value={"NONE"}>NONE</option>
                    <option value={"R"}>R</option>
                    <option value={"Python"}>Python</option>
                </select>
                </GenericLabel>
                
                <br></br>

                {/* Compute Server Selector */}
                <ComputeServerSelector id={id}></ComputeServerSelector>
                    
                <br></br>


                {/* Arguments Editor */}
                <ArgumentsEditor id={id}></ArgumentsEditor>
                <br></br>
                <br></br>


                {/* InvokeNext Editor */}
                <InvokeNextEditor addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} id={id}></InvokeNextEditor>
                

                        
                <br></br>
                <br></br>
                
                {/* Paths */}
                <GitRepoPathEditor onBlur={handleBlur} id={id} ></GitRepoPathEditor>

                <br></br>

                <div>
                    <GenericLabel size={"20px"} value={"Function's Action Container"} >
                    <input id={id+"-actioncontainer"} key={`action-container-${id}`}style={{ width:"300px" }} type="text" placeholder="Leave blank to use default" 
                        onChange={(e)=>applyWorkflowChanges({
                            ActionContainers: {
                                [id] : e.target.value
                            }
                        })}
                        value={workflow.ActionContainers[id] || ""}
                        onBlur={handleBlur}
                    />
                    </GenericLabel>
                </div>
                <br></br>
                <GitPackageEditor onBlur={handleBlur} id={id} ></GitPackageEditor>
                <br></br>
                
                {/* Cran Package Handling */}   
                {workflow.ActionList[id].Type === "R" ? <CranPackageEditor onBlur={handleBlur} id={id} ></CranPackageEditor> : null}
                <br></br>

                {workflow.ActionList[id].Type === "Python" ? <PyPIPackageEditor onBlur={handleBlur} id={id}></PyPIPackageEditor> : null}
                <br></br>
            </div>


        )
    }
    return(
        <h1>SELECT A FUNCTION</h1>
    )
}
