import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import useFunctionUtils from "../FunctionsUtils"
import useCreateNewFunction from "../FunctionCreator"
import Popup from "../../Utils/Popup"

export default function InvokeNextEditor( props ){
    const {workflow, setWorkflow, edges, selectedFunctionId,nodes} = useWorkflowContext();
    const { updateWorkflow, updateLayout, updateWorkflowAndLayout } = useUndo();

    // Id of Action we are editing
    const id = props.id

    const [newArg, setNewArg] = useState("")
    const [newArgVal, setNewArgVal] = useState("")
    const [newGitPackage, setNewGitPackage] = useState("")
    const [newCranPackage, setNewCranPackage] = useState("")

    const [newArgPopupEnabled, setNewArgPopupEnabled] = useState(false)

    const [newInvoke, setNewInvoke] = useState("NONE")
    const [newActionName, setNewActionName] = useState("")
    const { listInvokeNext, parseInvoke, getInvokeCondition, deleteInvoke, updateInvoke, isValidNewRankedEdge} = useFunctionUtils ();
    const { createNewFunction, createNewFunctionNode } = useCreateNewFunction();

    return (
        <div id="invokenext-editor">
            <GenericLabel size={"20px"} value={"Next Actions To Invoke"}></GenericLabel>
            <div style={{border: "solid"}}>

                {/* For each action in nonconditional Invokenext */}

                

                {listInvokeNext(id).map( (invoke) => {

                    const { id : invId, rank} = parseInvoke(invoke)
                    const condition = getInvokeCondition(id, invoke)
                    return (
                    // Per Invoke Div
                    <div key={invId} style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#f2f2f2"}}>
                        {/* Change Invoke Target Id */}
                        <select placeholder="funcInvokeNext" 
                        onChange={(e)=> { 

                            if (!props.checkCycle(nodes, props.addEdge({ id: `${id}-${e.target.value}`, source : id, target: e.target.value}, edges))) {
                                updateInvoke(id, invoke, e.target.value, rank, condition)
                            }
                    
                    }}
                            type="text" value={invId}>
                            
                            <option value={""}> NONE </option>
                            
                            {Object.entries(workflow.FunctionList).map(([key]) => (
                            
                            <option key={key} value={key}>{key}</option>
                            ))}
                        </select>

                        {/* Change Rank */}
                        <input value={rank} id={invId+"--"+rank} type="number" min="1" step="1" placeholder="rank"
                            onChange={
                                (e) => {
                                    updateInvoke(id, invoke, invId, e.target.value, condition)
                                }
                            }>
                        </input>

                        {/* Change Condition */}
                        <select  value={condition} id={invoke+"cond"} type="text" onChange={ (e) => {
                            updateInvoke(id, invoke, invId, rank, e.target.value)
                        }}>
                            <option value={""}> Unconditional </option>
                            <option value={"False"}> False </option>
                            <option value={"True"}> True </option>
                        </select>

                        {/* Delete InvokeNext Button */}
                        <button style={{color:"red", marginLeft: 'auto'}} onClick={() => {
                            deleteInvoke(id, invoke)
                        }}>Delete</button>
                    </div>
                )})}

                <select placeholder="funcInvokeNext" onChange={(e)=> setNewInvoke(e.target.value)}
                    type="text" value={newInvoke}>
                    
                    <option value={""}> NONE </option>
                    
                    {Object.entries(workflow.FunctionList).map(([key]) => (
                    
                    <option key={key} value={key}>{key}</option>
                    ))}
                </select>

                <input type="number" id="rankInput" min="1" step="1" placeholder="rank"></input>
                <select id="conditionInput" type="text">
                    
                    <option value={""}> Unconditional </option>
                    <option value={"False"}> False </option>
                    <option value={"True"}> True </option>
                </select>

                <button onClick={() => {
                    if(!edges.some( (edge) => edge.id === id+"-"+newInvoke)){
                        const newrank = document.getElementById("rankInput").value
                        const condition = document.getElementById("conditionInput").value
                        const rankString = (newrank > 1) ? "(" +newrank + ")" : ""
                        if (!props.checkCycle(nodes, props.addEdge({ id: `${id}-${newInvoke}`, source : id, target: newInvoke}, edges)) && isValidNewRankedEdge(id, newInvoke, newrank)) {                    
                            if (newInvoke !== ""){
                                updateWorkflow({
                                ...workflow,
                                FunctionList: {
                                    ...workflow.FunctionList,
                                    [id]: {
                                    ...workflow.FunctionList[id],
                                    InvokeNext: condition === ""
                                        ? [
                                            workflow.FunctionList[id].InvokeNext[0], // keep conditionals
                                            [
                                            ...workflow.FunctionList[id].InvokeNext[1],
                                            newInvoke + rankString
                                            ] // update unconditional
                                        ]
                                        : [
                                            {
                                            ...workflow.FunctionList[id].InvokeNext[0],
                                            [condition]: [
                                                ...workflow.FunctionList[id].InvokeNext[0][condition],
                                                newInvoke + rankString
                                            ]
                                            },
                                            workflow.FunctionList[id].InvokeNext[1] // keep unconditionals
                                        ]
                                    }
                                }
                                })

                                }
                                props.createEdge(id, newInvoke, newrank, condition)
                                
                            }
                        } 
                }}>Add New InvokeNext</button>

            </div>
        </div>
    )
}