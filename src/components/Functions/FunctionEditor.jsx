import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import TextInput from "../Utils/TextInput";
import GenericLabel from "../Utils/GenericLabel";
import Popup from "../Utils/Popup"
import useUndo from "../Utils/Undo";
import useCreateNewFunction from "./FunctionCreator"

export default function FunctionEditor(props){
    const {workflow, setWorkflow, edges, setEdges, selectedFunctionId,nodes, setNodes} = useWorkflowContext();
    const id = selectedFunctionId
    const [newArg, setNewArg] = useState("")
    const [newArgVal, setNewArgVal] = useState("")
    const [newGitPackage, setNewGitPackage] = useState("")
    const [newCranPackage, setNewCranPackage] = useState("")

    const [newArgPopupEnabled, setNewArgPopupEnabled] = useState(false)

    const [newInvoke, setNewInvoke] = useState("NONE")
    const [newActionName, setNewActionName] = useState("")
    const { updateWorkflow, updateLayout, updateWorkflowAndLayout } = useUndo();
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

    

    const updateArgument = (key, value) => {
        updateFunction({Arguments : {
            ...workflow.FunctionList[id].Arguments,
            [key] : value
        }})
    };


    if(id != null && workflow.FunctionList?.[id]){
        return(

            // Function Edit Box
            <div style={{ }}>
                <h1>Action Name : {id}</h1>

                <GenericLabel value={"Duplicate Action"}></GenericLabel>
                <div style={{display : "flex"}}>
                    <TextInput value={newActionName} onChange={(e) => setNewActionName( e.target.value)} placeholder={"New Action Name"}></TextInput>
                    <button onClick={ () => {
                        // Add new action to workflow
                        if (!(newActionName in Object.keys(workflow.FunctionList)) && (newActionName !== "")){
                            createNewFunction(id, newActionName);   
                        }else{
                            console.log("Already Exists")
                            console.log(newActionName + " in " + Object.keys(workflow.FunctionList))
                        }
                    }
                    }> Duplicate Action</button>
                </div>
                <br></br>


                <GenericLabel size={"20px"} value={"Function Name"}></GenericLabel>
                <TextInput value={workflow.FunctionList[id].FunctionName} placeholder={"FunctionName"} onChange={(e) => updateFunction({FunctionName : e.target.value})}/>
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
                                delete workflow.FunctionList[id].Arguments[key]
                                console.log("Deleting: " + key)
                                updateWorkflow({...workflow})
                            }}>Delete</button>
                    </div>
                    ))}
                <button onClick={() => setNewArgPopupEnabled(true)}>Add New Arguments</button>
                </div>
                <Popup enabled={newArgPopupEnabled} setEnabled={() => setNewArgPopupEnabled()}>
                    <input value={newArg} placeholder="argument_name" onChange={ (e) => setNewArg(e.target.value)}></input>
                    <input value={newArgVal} placeholder="argument_value" onChange={ (e) => setNewArgVal(e.target.value)}></input>
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

                    {/* Iterate Through Current invokes */}
                    {
                    workflow.FunctionList[id].InvokeNext.map( (val, i) => (
                        // Choose Invoke
                        <div key={i} style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                            <select placeholder="funcInvokeNExt" onChange={(e)=> { 


                                // Updated InvokeNext
                                const updatedInvokeNext = [...workflow.FunctionList[id].InvokeNext]
                                updatedInvokeNext[i] = e.target.value

                                if (!props.checkCycle(nodes, props.addEdge({ id: `${id}-${newInvoke}`, source : id, target: e.target.value}, edges))) {
                                    //Updated Edges
                                    const updatedEdges = edges.map((edge) => {
                                    if (edge.source === id && edge.target === val) {
                                        return {
                                        ...edge,
                                        target: e.target.value,
                                        id: `${edge.source}-${e.target.value}` // update ID if you're using source-target based IDs
                                        };
                                    }
                                    return edge; // no change
                                    });

                                    // Update Workflow With New InvokeNext
                                    updateWorkflowAndLayout({
                                        ...workflow,
                                        FunctionList: {
                                            ...workflow.FunctionList,
                                            [id]: {
                                            ...workflow.FunctionList[id],
                                            InvokeNext : updatedInvokeNext
                                            }
                                        }
                                    }, nodes, updatedEdges);
                                }else{
                                    alert("Cycle Detected!")
                                }
                        
                        }}
                                type="text" value={val}>
                                
                                <option value={""}> NONE </option>
                                
                                {Object.entries(workflow.FunctionList).map(([key]) => (
                                
                                <option key={key} value={key}>{key}</option>
                                ))}
                            </select>

                            <button style={{color:"red"}} onClick={() => {
                                let newWorkflow = structuredClone(workflow)
                                newWorkflow.FunctionList[id].InvokeNext = newWorkflow.FunctionList[id].InvokeNext.filter(value => value !== val)
                                
                                const updatedEdges = edges.filter(e => e.source !== id || e.target !== val)
                                updateWorkflowAndLayout(newWorkflow, nodes, updatedEdges)

                            }}>Delete</button>
                        </div>
                    
                    ))}

                </div>
                {/* Add New Invoke Button */}
                <select placeholder="funcInvokeNext" onChange={(e)=> setNewInvoke(e.target.value)}
                    type="text" value={newInvoke}>
                    
                    <option value={""}> NONE </option>
                    
                    {Object.entries(workflow.FunctionList).map(([key]) => (
                    
                    <option key={key} value={key}>{key}</option>
                    ))}
                </select>
                <button onClick={() => {
                    if (!props.checkCycle(nodes, props.addEdge({ id: `${id}-${newInvoke}`, source : id, target: newInvoke}, edges))) {                    
                        if (newInvoke !== ""){
                            updateWorkflow({
                                ...workflow,
                                FunctionList: {
                                    ...workflow.FunctionList,
                                    [id]: {
                                        ...workflow.FunctionList[id],
                                        InvokeNext: [
                                            ...workflow.FunctionList[id].InvokeNext,
                                            newInvoke
                                        ]
                                    }
                            
                            }})
                        }
                            props.createEdge(id, newInvoke)
                    }else{
                        alert("Cycle Detected!")
                    }
                }}>Add New InvokeNext</button>

                <br></br>
                <br></br>
                
                {/* Paths */}
                <div>
                    <GenericLabel size={"20px"} value={"Function's Git Repo/Path"}></GenericLabel>
                    <input id={id+"-gitpath"} style={{ width:"300px" }} type="text" placeholder="GitPath" onChange={(e)=>setWorkflow({
                        ...workflow,
                        FunctionGitRepo: {
                            ...workflow.FunctionGitRepo,
                            [workflow.FunctionList[id].FunctionName] : e.target.value
                        }
                    })}value={workflow.FunctionGitRepo[workflow.FunctionList[id].FunctionName] || ""}/>
                </div>

                <br></br>

                <div>
                    <GenericLabel size={"20px"} value={"Function's Action Container"}></GenericLabel>
                    <input id={id+"-actioncontainer"} style={{ width:"300px" }} type="text" placeholder="ActionContainer" onChange={(e)=>setWorkflow({
                        ...workflow,
                        ActionContainers: {
                            ...workflow.ActionContainers,
                            [id] : e.target.value
                        }
                    })}value={workflow.ActionContainers[id] || ""}/>
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
                                    updateWorkflow({
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
                                />
                                <button style={{color:"red"}} onClick={() => {
                                    workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName] = workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName].filter(value => value !== val)
                                    console.log("Deleting: " + key)
                                    updateWorkflow({...workflow})
                                }}>Delete</button>
                        </div>
                        ))
                        : ""
                    }

                    <input value={newGitPackage} placeholder="NewPackageName" onChange={ (e) => setNewGitPackage(e.target.value)}></input>
                    <button onClick={() => {
                    if(newGitPackage.trim() !== ""){
                        setWorkflow({
                        ...workflow,
                        FunctionGitHubPackage: {
                            ...workflow.FunctionGitHubPackage,
                            [workflow.FunctionList[id].FunctionName]: [
                            ...(workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName] || []),
                            newGitPackage.trim()
                            ]
                        }
                        });
                        setNewGitPackage("");
                    }
                    }}>Add Package</button>
                </div>
                <input value={newGitPackage} placeholder="NewPackageName" onChange={ (e) => setNewGitPackage(e.target.value)}></input>
                <button onClick={() => {
                if(newGitPackage.trim() !== ""){
                    updateWorkflow({
                    ...workflow,
                    FunctionGitHubPackage: {
                        ...workflow.FunctionGitHubPackage,
                        [workflow.FunctionList[id].FunctionName]: [
                        ...(workflow.FunctionGitHubPackage[workflow.FunctionList[id].FunctionName] || []),
                        newGitPackage.trim()
                        ]
                    }
                    });
                    setNewGitPackage("");
                }
                }}>Add Package</button>
                
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
                                    updateWorkflow({
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
                                    workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] = workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName].filter(value => value !== val)
                                    console.log("Deleting: " + key)
                                    updateWorkflow({...workflow})
                                }}>Delete</button>
                        </div>
                        ))
                        : ""
                    }
                    <input value={newCranPackage} placeholder="NewPackageName" onChange={ (e) => setNewCranPackage(e.target.value)}></input>
                    <button onClick={() => {
                    if(newCranPackage.trim() !== ""){
                        setWorkflow({
                        ...workflow,
                        FunctionCRANPackage: {
                            ...workflow.FunctionCRANPackage,
                            [workflow.FunctionList[id].FunctionName]: [
                            ...(workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] || []),
                            newCranPackage.trim()
                            ]
                        }
                        });
                        setNewCranPackage("");
                    }
                    }}>Add Package</button>
                </div>
                <input value={newCranPackage} placeholder="NewPackageName" onChange={ (e) => setNewCranPackage(e.target.value)}></input>
                <button onClick={() => {
                if(newCranPackage.trim() !== ""){
                    updateWorkflow({
                    ...workflow,
                    FunctionCRANPackage: {
                        ...workflow.FunctionCRANPackage,
                        [workflow.FunctionList[id].FunctionName]: [
                        ...(workflow.FunctionCRANPackage[workflow.FunctionList[id].FunctionName] || []),
                        newCranPackage.trim()
                        ]
                    }
                    });
                    setNewCranPackage("");
                }
                }}>Add Package</button>
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
            </div>


        )
    }
    return(
        <h1>SELECT A FUNCTION</h1>
    )
}
