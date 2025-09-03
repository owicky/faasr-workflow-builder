import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import useFunctionUtils from "../FunctionsUtils"
import Popup from "../../Utils/Popup"
import useUtils from "../../Utils/Utils";
import { LuRotateCcw } from "react-icons/lu";
export default function InvokeNextEditor( props ){
    const {workflow, edges, nodes} = useWorkflowContext();
    const { updateWorkflow, updateLayout } = useUndo();


    // Id of Action we are editing
    const id = props.id

    const [newInvokePopupEnabled, setNewInvokePopupEnabled] = useState(false)

    const [newInvoke, setNewInvoke] = useState("NONE")
    const { listInvokeNext, parseInvoke, createEdge, getInvokeCondition, deleteInvoke, updateInvoke, isValidNewRankedEdge} = useFunctionUtils ();
    const { cycleDetection } = useUtils()
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
                    <div key={invId} className="list-entry">
                        {/* Change Invoke Target Id */}
                        <select placeholder="funcInvokeNext" 
                        onChange={(e)=> { 

                            if (!cycleDetection(nodes, props.addEdge({ id: `${id}-${e.target.value}`, source : id, target: e.target.value}, edges))) {
                                updateInvoke(id, invoke, e.target.value, rank, condition)
                            }
                    
                    }}
                            type="text" value={invId}>
                            
                            <option value={""}> NONE </option>
                            
                            {Object.entries(workflow.ActionList).map(([key]) => (
                            
                            <option key={key} value={key}>{key}</option>
                            ))}
                        </select>

                        {/* Change Rank */}
                        <input value={rank} id={"rankUpdate"} type="number" min="1" step="1" placeholder="rank"
                            onChange={
                                (e) => {
                                    updateInvoke(id, invoke, invId, e.target.value, condition)
                                }
                            }>
                        </input>
                        
                        <button id="resetRankButton" onClick={() => document.getElementById("rankUpdate").value = 1}>
                            <LuRotateCcw></LuRotateCcw>
                        </button>

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

                <button onClick={() => setNewInvokePopupEnabled(true)}>Add New InvokeNext</button>
                <Popup enabled={newInvokePopupEnabled} setEnabled={() => setNewInvokePopupEnabled()}>
                    <select placeholder="funcInvokeNext" onChange={(e)=> setNewInvoke(e.target.value)}
                        type="text" value={newInvoke}>
                        
                        <option value={""}> NONE </option>
                        
                        {Object.entries(workflow.ActionList).map(([key]) => (
                        
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
                            if (!cycleDetection(nodes, props.addEdge({ id: `${id}-${newInvoke}`, source : id, target: newInvoke}, edges)) && isValidNewRankedEdge(id, newInvoke, newrank)) {                    
                                if (newInvoke !== ""){
                                    updateWorkflow({
                                    ...workflow,
                                    ActionList: {
                                        ...workflow.ActionList,
                                        [id]: {
                                        ...workflow.ActionList[id],
                                        InvokeNext: condition === ""
                                            ? [
                                                ...workflow.ActionList[id].InvokeNext,
                                                newInvoke + rankString
                                            ]
                                            : [
                                                {
                                                    ...workflow.ActionList[id].InvokeNext[0],
                                                    [condition]: [
                                                        ...workflow.ActionList[id].InvokeNext[0][condition],
                                                        newInvoke + rankString
                                                ]},
                                                ...workflow.ActionList[id].InvokeNext.slice(1),
                                            ]
                                        }   
                                    }
                                    })

                                    }
                                    const {updateNode, updateEdge} = createEdge(id, newInvoke, newrank, condition)
                                    updateLayout(
                                        updateNode.map( (node) => {
                                            if (node.id === newInvoke){
                                                return {
                                                    ...node,
                                                    data : {
                                                        ...node.data,
                                                        rank : newrank
                                                    }
                                                }
                                            }else{
                                                return node
                                            }
                                        } ),
                                        edges.concat(updateEdge))
                                    
                                }
                            } 
                    }}>Add New InvokeNexts</button>
                </Popup>
                


            </div>
        </div>
    )
}