import { useWorkflowContext } from "../../WorkflowContext"
import { useState, useCallback } from "react";
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
import { getActionContainer } from "./EditorComponents/ComputeServerSelector";  


export default function FunctionEditor(props){
    const {workflow, edges, selectedFunctionId,nodes} = useWorkflowContext();
    const id = selectedFunctionId

    const [newActionId, setNewActionId] = useState("")
    const { updateWorkflow, updateLayout, updateWorkflowAndLayout } = useUndo();
    const { duplicateFunction, createNewFunctionNode } = useCreateNewFunction();
    const { updateAction, applyWorkflowChanges } = useWorkflowUtils()

    const handleBlur = (e) => {
        updateWorkflow(workflow);
    };


    if(id != null && workflow.ActionList?.[id]){
        return(

            // Function Edit Box
            <div >
                <h1>Action Name : {id}</h1>

                <br></br>
                {/* Add/remove from graph & delete permanently*/}
                <div>
                    <button onClick={ () => {
                        if(nodes.some( (node) => node?.id === id )) {
                            alert("That action is already in the graph. Duplicate it instead to make a copy.");
                        } else {
                            const {newNode, newEdges} = createNewFunctionNode(id);
                            updateLayout([...nodes, newNode], [...edges, ...newEdges]);
                        }   
                    }}>Add Action to Layout</button>
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
                <GenericLabel value={"Duplicate Action"} size={"20px"}>
                <div style={{display : "flex"}}>
                    <TextInput value={newActionId} onChange={(e) => {
                        const newName = e.target.value
                        const actionNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*(?:\\([0-9]+\\))?$/
                        if (newName === "" || actionNameRegex.test(newName)) setNewActionId( e.target.value)
                    }} placeholder={"New Action Id"}></TextInput>
                    <button onClick={ () => {
                        // Add new action to workflow
                        if (!(newActionId in Object.keys(workflow.ActionList)) && (newActionId !== "")){
                            duplicateFunction(id, newActionId, `${workflow.ActionList[id].FunctionName}_copy`);   
                            setNewActionId("");
                        }else{
                            console.log("Already Exists")
                            console.log(newActionId + " in " + Object.keys(workflow.ActionList))
                        }
                    }
                    }> Duplicate Action</button>
                </div>
                </GenericLabel>

                {/* Function Name Input */}
                <GenericLabel size={"20px"} value={"Function Name"} required={true}>
                {/* set workflow onChange, but only update history on blur*/}
                <TextInput 
                    value={workflow.ActionList[id].FunctionName} 
                    placeholder={"FunctionName"} 
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
                <GenericLabel size={"20px"} value={"Type"} required={true}>
                <select value={workflow.ActionList[id].Type} onChange={(e) => {
                    const type = e.target.value;
                    const computeServer = workflow.ActionList[id].FaaSServer;
                    const faasType = workflow.ComputeServers[computeServer].FaaSType;
                    let containerName = getActionContainer(faasType, type);
                    if (containerName == null) containerName = workflow.ActionContainers[id];


                    applyWorkflowChanges({
                        ...workflow,
                        ActionList: {
                            ...workflow.ActionList,
                            [id]: {
                                ...workflow.ActionList[id],
                                Type : type
                            }
                        },
                        ActionContainers: {
                            ...workflow.ActionContainers,
                            [id]: containerName
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
                    <GenericLabel size={"20px"} value={"Function's Action Container"} required={true}>
                    <input id={id+"-actioncontainer"} style={{ width:"300px" }} type="text" placeholder="ActionContainer" 
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
                <CranPackageEditor onBlur={handleBlur} id={id} ></CranPackageEditor>
                <br></br>
            </div>


        )
    }
    return(
        <h1>SELECT A FUNCTION</h1>
    )
}
