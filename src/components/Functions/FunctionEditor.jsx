import { useWorkflowContext } from "../../WorkflowContext"
import { useState, useCallback } from "react";
import TextInput from "../Utils/TextInput";
import GenericLabel from "../Utils/GenericLabel";
import Popup from "../Utils/Popup"
import useUndo from "../Utils/Undo";
import useCreateNewFunction from "./FunctionCreator"
import useFunctionUtils from "./FunctionsUtils";
import ComputeServerSelector from "./EditorComponents/ComputeServerSelector"
import ArgumentsEditor from "./EditorComponents/ArgumentsEditor"
import InvokeNextEditor from "./EditorComponents/InvokeNextEditor"
import CranPackageEditor from "./EditorComponents/CranPackageEditor";
import GitPackageEditor from "./EditorComponents/GitPackageEditor";
import GitRepoPathEditor from "./EditorComponents/GitRepoPathEditor";
import GenericButton from "../Utils/GenericButton";


export default function FunctionEditor(props){
    const {workflow, setWorkflow, edges, selectedFunctionId,nodes} = useWorkflowContext();
    const id = selectedFunctionId
    const [newArg, setNewArg] = useState("")
    const [newArgVal, setNewArgVal] = useState("")
    const [newGitPackage, setNewGitPackage] = useState("")
    const [newCranPackage, setNewCranPackage] = useState("")

    const [newArgPopupEnabled, setNewArgPopupEnabled] = useState(false)

    const [newInvoke, setNewInvoke] = useState("NONE")
    const [newActionName, setNewActionName] = useState("")
    const { updateWorkflow, updateLayout, updateWorkflowAndLayout } = useUndo();
    const { listInvokeNext, parseInvoke, getInvokeCondition, deleteInvoke, updateInvoke, isValidNewRankedEdge} = useFunctionUtils ();
    const { createNewFunction, createNewFunctionNode } = useCreateNewFunction();

    // const updateFunction = (updates) => {
    //     updateWorkflow({
    //         ...workflow,
    //         FunctionList: {
    //             ...workflow.FunctionList,
    //             [id]: {
    //                 ...workflow.FunctionList[id],
    //                 ...updates
    //             }
    //         }
    //     });
    // };

    // const updateInvokeNext = (index, value) => {
    //     const updatedInvokeNext = [...workflow.FunctionList[id].InvokeNext]

    //     updatedInvokeNext[1][index] = value

    //     updateFunction({InvokeNext : [...updatedInvokeNext]})
    // } 
    
    // const updateInvokeNextRank = (i, rank) => {
    //     const invoke = workflow.FunctionList[id].InvokeNext[1][i]
    //     const invokeName = (invoke.indexOf("(") !== -1) ? invoke.substring(0, invoke.indexOf("(")) : invoke
    //     const rankHolder = edges.find( (edge) => edge.target === invokeName && edge.label !== undefined && edge.label !== "")
    //     if ( rankHolder === undefined || rankHolder.source === id){
    //         let rankString = ""
    
    //         if ( rank > 1 ) {
    //             rankString = "(" + rank + ")"
    //         }
    //         updateInvokeNext(i, invokeName + rankString)
            
    //         const edgeIndex = edges.findIndex( (edge) => edge.id === (id + "-" + invokeName))
    //         const updatedEdges = [...edges]
    //         updatedEdges[edgeIndex] = {...updatedEdges[edgeIndex], label : (rank > 1) ? rank : ""}
    
    //         const nodeIndex = nodes.findIndex( (node) => node.id === (invokeName))
    //         const updatedNodes = [...nodes]
    //         updatedNodes[nodeIndex] = {...updatedNodes[nodeIndex], data : {...updatedNodes[nodeIndex].data, rank : rank}}
            
    //         updateLayout(updatedNodes, updatedEdges)
    //     }else{
    //         alert( rankHolder.source + " already invokes " + rankHolder.target + " with rank: " + rankHolder.label )
    //     }

    // }



    // const updateArgument = (key, value) => {
    //     updateFunction({Arguments : {
    //         ...workflow.FunctionList[id].Arguments,
    //         [key] : value
    //     }})
    // };

    const handleBlur = (e) => {
        updateWorkflow(workflow);
    };
    


    if(id != null && workflow.FunctionList?.[id]){
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
                            createNewFunctionNode(id);
                        }   
                    }}>Add Action to Graph</button>
                </div>

                {/* button to delete action from graph */}
                <div>
                    <button onClick={ () => {
                        updateLayout( 
                            nodes.filter( (node) =>node.id !== id),
                            edges.filter( (edge) => edge.source !== id && edge.target !== id)
                        ); 
                    }}>Delete Action from Graph</button>
                </div>

                {/* Button to delete action permanently */}
                <div>
                    <button onClick={ () => {
                        const newWorkflow = structuredClone(workflow);
                        delete newWorkflow.FunctionList[id];
                        updateWorkflowAndLayout(
                            newWorkflow,
                            nodes.filter( (node) =>node.id !== id),
                            edges.filter( (edge) => edge.source !== id && edge.target !== id)
                        );
                    }}>Delete Action Permanently</button>
                </div>
                <br></br>

                {/* Duplicate Action Div */}
                <GenericLabel value={"Duplicate Action"} size={"20px"}></GenericLabel>
                <div style={{display : "flex"}}>
                    <TextInput value={newActionName} onChange={(e) => setNewActionName( e.target.value)} placeholder={"New Action Name"}></TextInput>
                    <button onClick={ () => {
                        // Add new action to workflow
                        if (!(newActionName in Object.keys(workflow.FunctionList)) && (newActionName !== "")){
                            createNewFunction(newActionName, `${workflow.FunctionList[id].FunctionName}_copy`);   
                            setNewActionName("");
                        }else{
                            console.log("Already Exists")
                            console.log(newActionName + " in " + Object.keys(workflow.FunctionList))
                        }
                    }
                    }> Duplicate Action</button>
                </div>

                {/* Function Name Input */}
                <GenericLabel size={"20px"} value={"Function Name"}></GenericLabel>
                {/* set workflow onChange, but only update history on blur*/}
                <TextInput 
                    value={workflow.FunctionList[id].FunctionName} 
                    placeholder={"FunctionName"} 
                    onChange={(e) => setWorkflow({
                        ...workflow,
                        FunctionList:{
                            ...workflow.FunctionList,
                            [id]: {
                                ...workflow.FunctionList[id],
                                FunctionName: e.target.value
                            }
                        }
                    })}
                    onBlur={handleBlur}
                />
                
                <br></br>

                {/* Compute Server Selector */}
                <ComputeServerSelector id={id}></ComputeServerSelector>
                    
                <br></br>


                {/* Arguments Editor */}
                <ArgumentsEditor id={id}></ArgumentsEditor>
                <br></br>
                <br></br>


                {/* InvokeNext Editor */}
                <InvokeNextEditor createEdge={(a,b, c, d) => props.createEdge(a,b, c, d)} addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} checkCycle={ (nds,eds) => props.checkCycle(nds, eds) } id={id}></InvokeNextEditor>
                

                        
                <br></br>
                <br></br>
                
                {/* Paths */}
                <GitRepoPathEditor onBlur={handleBlur} createEdge={(a,b, c, d) => props.createEdge(a,b, c, d)} addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} checkCycle={ (nds,eds) => props.checkCycle(nds, eds) } id={id} ></GitRepoPathEditor>

                <br></br>

                <div>
                    <GenericLabel size={"20px"} value={"Function's Action Container"}></GenericLabel>
                    <input id={id+"-actioncontainer"} style={{ width:"300px" }} type="text" placeholder="ActionContainer" 
                        onChange={(e)=>setWorkflow({
                            ...workflow,
                            ActionContainers: {
                                ...workflow.ActionContainers,
                                [id] : e.target.value
                            }
                        })}
                        value={workflow.ActionContainers[id] || ""}
                        onBlur={handleBlur}
                    />
                </div>
                <br></br>
                <GitPackageEditor onBlur={handleBlur} createEdge={(a,b, c, d) => props.createEdge(a,b, c, d)} addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} checkCycle={ (nds,eds) => props.checkCycle(nds, eds) } id={id} ></GitPackageEditor>
                <br></br>
                
                {/* Cran Package Handling */}
                <CranPackageEditor onBlur={handleBlur} createEdge={(a,b, c, d) => props.createEdge(a,b, c, d)} addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} checkCycle={ (nds,eds) => props.checkCycle(nds, eds) } id={id} ></CranPackageEditor>
                
            </div>


        )
    }
    return(
        <h1>SELECT A FUNCTION</h1>
    )
}
