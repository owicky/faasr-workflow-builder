import { useWorkflowContext } from "../../WorkflowContext"
import { useState, useCallback } from "react";
import TextInput from "../Utils/TextInput";
import GenericLabel from "../Utils/GenericLabel";
import Popup from "../Utils/Popup"
import useUndo from "../Utils/Undo";
import useCreateNewFunction from "./FunctionCreator"
import useFunctionUtils from "./FunctionsUtils";

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
    const updateFunction = (updates) => {
        updateWorkflow({
            ...workflow,
            FunctionList: {
                ...workflow.FunctionList,
                [id]: {
                    ...workflow.FunctionList[id],
                    ...updates
                }
            }
        });
    };

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



    const updateArgument = (key, value) => {
        updateFunction({Arguments : {
            ...workflow.FunctionList[id].Arguments,
            [key] : value
        }})
    };

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
                            createNewFunction(workflow.FunctionList[id]?.name, id);
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
                <GenericLabel value={"Duplicate Action"}></GenericLabel>
                <div style={{display : "flex"}}>
                    <TextInput value={newActionName} onChange={(e) => setNewActionName( e.target.value)} placeholder={"New Action Name"}></TextInput>
                    <button onClick={ () => {
                        // Add new action to workflow
                        if (!(newActionName in Object.keys(workflow.FunctionList)) && (newActionName !== "")){
                            createNewFunction(newActionName, id);   
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
                <div>
                    <GenericLabel size={"20px"} value={"Compute Server"}></GenericLabel>
                    <select placeholder="FaaSServer" onChange={(e)=>updateWorkflow({
                        ...workflow,
                        FunctionList: {
                            ...workflow.FunctionList,
                            [id]: {
                            ...workflow.FunctionList[id],
                            FaaSServer: e.target.value
                            }
                        }
                    })} type="text" value={workflow.FunctionList[id].FaaSServer}>
                        <option value={""}> NONE </option>
                        {Object.entries(workflow.ComputeServers).map(([key, val], i) => (
                        <option key={key} value={key}>{key}</option>
                        ))}
                    </select>

                    
                </div>
                <br></br>


                {/* Arguments Editor */}
                <GenericLabel size={"20px"} value={"Arguments"}></GenericLabel>
                <div style={{border: "solid"}}>
                    {Object.entries(workflow.FunctionList[id].Arguments).map(([key, val], i) => (
                        <div style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                            <label className="truncate">{key}</label>
                            <input
                            type="text"
                            placeholder={key+" value"}
                            value={val}
                            onChange={(e) =>
                                updateArgument(key, e.target.value)
                            }
                            />
                            <button style={{color:"red"}} onClick={() => {
                                const newWorkflow = structuredClone(workflow);
                                delete newWorkflow.FunctionList[id].Arguments[key]
                                console.log("Deleting: " + key)
                                updateWorkflow(newWorkflow)
                            }}>Delete</button>
                    </div>
                    ))}
                <button onClick={() => setNewArgPopupEnabled(true)}>Add New Arguments</button>
                </div>
                <Popup enabled={newArgPopupEnabled} setEnabled={() => setNewArgPopupEnabled()}>
                    <input value={newArg} placeholder="argument-name" onChange={ (e) => setNewArg(e.target.value)}></input>
                    <input value={newArgVal} placeholder="argument-value" onChange={ (e) => setNewArgVal(e.target.value)}></input>
                    <button onClick={() => {
                        if (!/\s/.test(newArg) && newArg !== "" && !/\s/.test(newArgVal) && newArgVal !== ""){
                            updateWorkflow({
                            ...workflow,
                            FunctionList: {
                                ...workflow.FunctionList,
                                [id]: {
                                    ...workflow.FunctionList[id],
                                    Arguments: {
                                    ...workflow.FunctionList[id].Arguments,
                                    [newArg]: newArgVal
                                    }
                                }
                                }
                            })}else{
                                alert("New argument name and value must neither be empty nor contain whitespaces.")
                            }
                        }
                        }>Add New Argument</button>
                </Popup>
                <br></br>
                <br></br>

                {/* InvokeNext Editor */}
                <GenericLabel size={"20px"} value={"Next Actions To Invoke"}></GenericLabel>
                <div style={{border: "solid"}}>

                    {/* For each action in nonconditional Invokenext */}

                    

                    {listInvokeNext(id).map( (invoke) => {

                        const { id : invId, rank} = parseInvoke(invoke)
                        const condition = getInvokeCondition(id, invoke)
                        return (
                        // Per Invoke Div
                        <div key={invId} style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                            {/* Change Invoke Target Id */}
                            <select placeholder="funcInvokeNext" 
                            onChange={(e)=> { 

                                if (!props.checkCycle(nodes, props.addEdge({ id: `${id}-${newInvoke}`, source : id, target: e.target.value}, edges))) {
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
                                <option value={false}> false </option>
                                <option value={true}> true </option>
                            </select>

                            {/* Delete InvokeNext Button */}
                            <button style={{color:"red"}} onClick={() => {
                                deleteInvoke(id, invoke)
                            }}>Delete</button>
                            
                        </div>

                        
                    )})}

                </div>

                {/* Add New Invoke Button */}
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
                    <option value={false}> False </option>
                    <option value={true}> True </option>
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
                        
                <br></br>
                <br></br>
                
                {/* Paths */}
                <div>
                    <GenericLabel size={"20px"} value={"Function's Git Repo/Path"}></GenericLabel>
                    <input id={id+"-gitpath"} style={{ width:"300px" }} type="text" placeholder="GitPath" 
                        onChange={(e)=>setWorkflow({
                            ...workflow,
                            FunctionGitRepo: {
                                ...workflow.FunctionGitRepo,
                                [workflow.FunctionList[id].FunctionName] : e.target.value
                            }
                        })}
                        value={workflow.FunctionGitRepo[workflow.FunctionList[id].FunctionName] || ""}
                        onBlur={handleBlur}
                    />
                </div>

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

                <GenericLabel size={"20px"} value={"GitHub Packages for the Function"}></GenericLabel>
                <div style={{border: "solid"}}>
                    { workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName] ? 
                        Object.entries(workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName]).map(([key, val], i) => (
                            <div style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                                <input
                                type="text"
                                placeholder={key+" value"}
                                value={val}
                                onChange={(e) =>
                                    setWorkflow({
                                        ...workflow,
                                        FunctionGitHubPackage : {
                                            ...workflow.FunctionGitHubPackage,
                                            [workflow.FunctionList[id].FunctionName] :
                                            workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName]
                                                .map(pkg => pkg === val ? e.target.value : pkg)
                                        }
                                    }
                                    )
                                }
                                onBlur={handleBlur} 
                                />
                                <button style={{color:"red"}} onClick={() => {
                                    const newWorkflow = structuredClone(workflow);
                                    newWorkflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName] = newWorkflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName].filter(value => value !== val);
                                    updateWorkflow(newWorkflow);
                                }}>Delete</button>
                        </div>
                        ))
                        : ""
                    }

                    <input value={newGitPackage} placeholder="NewPackageName" onChange={ (e) => setNewGitPackage(e.target.value)}></input>
                    <button onClick={() => {
                        const newPackageName = newGitPackage.trim()
                        if(newPackageName !== "" && (!workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName] || !workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName].includes(newPackageName))){
                            setWorkflow({
                                ...workflow,
                                FunctionGitHubPackage: {
                                    ...workflow.FunctionGitHubPackage,
                                    [workflow.FunctionList[id].FunctionName]: [
                                        ...(workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName] || []),
                                        newPackageName
                                    ]
                                }
                            });
                            setNewGitPackage("");
                        }
                    }}>Add Package</button>
                </div>
                
                <br></br>
                <br></br>
                
                {/* Cran Package Handling */}
                <GenericLabel size={"20px"} value={"CRAN Packages for the Function"}></GenericLabel>
                <div style={{border: "solid"}}>
                    { workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] ? 
                        Object.entries(workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName]).map(([key, val], i) => (
                            <div style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                                <input
                                type="text"
                                placeholder={key+" value"}
                                value={val}
                                onChange={(e) =>
                                    setWorkflow({
                                        ...workflow,
                                        FunctionCRANPackage : {
                                            ...workflow.FunctionCRANPackage,
                                            [workflow.FunctionList[id].FunctionName] :
                                            workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName]
                                                .map(pkg => pkg === val ? e.target.value : pkg)
                                        }
                                    }
                                    )
                                }
                                />
                                <button style={{color:"red"}} onClick={() => {
                                    const newWorkflow = structuredClone(workflow);
                                    newWorkflow.FunctionCRANPackage[newWorkflow.FunctionList[id].FunctionName] = newWorkflow.FunctionCRANPackage[newWorkflow.FunctionList[id].FunctionName] = workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName].filter(value => value !== val);
                                    updateWorkflow(newWorkflow);
                                }}>Delete</button>
                        </div>
                        ))
                        : ""
                    }
                    <input value={newCranPackage} placeholder="NewPackageName" onChange={ (e) => setNewCranPackage(e.target.value)}></input>
                    <button onClick={() => {
                        const newPackageName = newCranPackage.trim()
                        if(newPackageName !== "" && (!workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] || !workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName].includes(newPackageName))){
                            setWorkflow({
                                ...workflow,
                                FunctionCRANPackage: {
                                    ...workflow.FunctionCRANPackage,
                                    [workflow.FunctionList[id].FunctionName]: [
                                        ...(workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] || []),
                                        newPackageName
                                    ]
                                }
                            });
                            setNewCranPackage("");
                        }
                    }}>Add Package</button>
                </div>
                
            </div>


        )
    }
    return(
        <h1>SELECT A FUNCTION</h1>
    )
}
