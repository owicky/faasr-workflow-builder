import { useWorkflowContext } from "../../WorkflowContext"
import { useState } from "react";
import TextInput from "../Utils/TextInput";

export default function FunctionEditor(props){
    const {workflow, setWorkflow, edges, setEdges} = useWorkflowContext();
    const id = props.id
    const [newArg, setNewArg] = useState("")
    const [newInvoke, setNewInvoke] = useState("NONE")


    const updateFunction = (updates) => {
        setWorkflow({
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
            <div style={{ backgroundColor: "grey"}}>
                <h1>Function ID: {id}</h1>
                <TextInput prompt={"Name"} value={workflow.FunctionList[id].FunctionName} placeholder={"FunctionName"} onChange={(e) => updateFunction({FunctionName : e.target.value})}/>

                {/* Compute Server Selector */}
                <div>
                    <button>ComputeServer</button>
                    <select placeholder="FaaSServer" onChange={(e)=>setWorkflow({
                        ...workflow,
                        FunctionList: {
                            ...workflow.FunctionList,
                            [id]: {
                            ...workflow.FunctionList[id],
                            FaaSServer: e.target.value
                            }
                        }
                    })} type="text" value={workflow.FunctionList[id].FaaSServer}>
                        <option value={"NONE"}> NONE </option>
                        {Object.entries(workflow.ComputeServers).map(([key, val], i) => (
                        <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                </div>


                {/* Arguments Editor */}
                <div style={{ border: "solid"}}>
                    <button>Arguments</button>
                    {Object.entries(workflow.FunctionList[id].Arguments).map(([key, val], i) => (
                        <div style={{ display : "flex", border: "solid", backgroundColor: "cyan"}}>
                            <label className="truncate">{key}</label>
                            <input
                            type="text"
                            placeholder={key+"Val"}
                            value={val}
                            onChange={(e) =>
                                updateArgument(key, e.target.value)
                            //     (e) =>
                            // setWorkflow({
                            //     ...workflow,
                            //     FunctionList: {
                            //     ...workflow.FunctionList,
                            //     [id]: {
                            //         ...workflow.FunctionList[id],
                            //         Arguments: {
                            //         ...workflow.FunctionList[id].Arguments,
                            //         [key]: e.target.value
                            //         }
                            //     }
                            //     }
                            // })
                            }
                            />
                            <button style={{color:"red"}} onClick={() => {
                                // const serverToDelete = server
                                delete workflow.FunctionList[id].Arguments[key]
                                console.log("Deleting: " + key)
                                setWorkflow({...workflow})
                            }}>Delete</button>
                    </div>
                    ))}
                    <button onClick={() =>
                        setWorkflow({
                            ...workflow,
                            FunctionList: {
                            ...workflow.FunctionList,
                            [id]: {
                                ...workflow.FunctionList[id],
                                Arguments: {
                                ...workflow.FunctionList[id].Arguments,
                                [newArg]: ""
                                }
                            }
                            }
                        })
                        }>Add New Argument</button>
                    <input value={newArg} placeholder="NewArgumentName" onChange={ (e) => setNewArg(e.target.value)}></input>
                </div>

                {/* InvokeNext Editor */}
                <div style={{ border: "solid"}}>
                    <button>InvokeNext</button>

                    {/* Iterate Through Current invokes */}
                    {workflow.FunctionList[id].InvokeNext.map( (val, i) => (
                        // Choose Invoke
                        <div key={i} style={{ border: "solid", backgroundColor: "cyan"}}>
                            <select placeholder="funcInvokeNExt" onChange={(e)=> { 
                                // Updated InvokeNext
                                const updatedInvokeNext = [...workflow.FunctionList[id].InvokeNext]
                                updatedInvokeNext[i] = e.target.value

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

                                //Replace Old Edge
                                setEdges(updatedEdges)
                                // Update Workflow With New InvokeNext
                                setWorkflow({
                                    ...workflow,
                                    FunctionList: {
                                        ...workflow.FunctionList,
                                        [id]: {
                                        ...workflow.FunctionList[id],
                                        InvokeNext : updatedInvokeNext
                                        }
                                    }
                            })
                        
                            // Update Edges in FLow Panel
                    }
                        }
                            
                                type="text" value={val}>
                                
                                <option value={"NONE"}> NONE </option>
                                
                                {Object.entries(workflow.FunctionList).map(([key]) => (
                                
                                <option key={key} value={key}>{key}</option>
                                ))}
                            </select>
                            <button style={{color:"red"}} onClick={() => {
                                workflow.FunctionList[id].InvokeNext = workflow.FunctionList[id].InvokeNext.filter(value => value !== val)
                                setWorkflow({...workflow})
                                
                                //Updated Edges
                                const updatedEdges = edges.filter(e => e.source !== id || e.target !== val)
                                setEdges(updatedEdges)

                            }}>Delete</button>
                        </div>

                        //Delete Invoke
                    
                    ))}
                    <button onClick={() => {

                        setWorkflow({
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
                            }
                        })

                        props.createEdge(id, newInvoke)
                    }}>Add New InvokeNext</button>
                            <select placeholder="funcInvokeNExt" onChange={(e)=> setNewInvoke(e.target.value)
                        }
                                type="text" value={newInvoke}>
                                
                                <option value={"NONE"}> NONE </option>
                                
                                {Object.entries(workflow.FunctionList).map(([key]) => (
                                
                                <option key={key} value={key}>{key}</option>
                                ))}
                            </select>
                </div>
                {/* Paths */}
                <div>
                    <button>Git PAth</button>
                    <input style={{ width:"300px" }} type="text" placeholder="GitPath" onChange={(e)=>setWorkflow({
                        ...workflow,
                        FunctionGitRepo: {
                            ...workflow.FunctionGitRepo,
                            [workflow.FunctionList[id].FunctionName] : e.target.value
                        }
                    })}value={workflow.FunctionGitRepo[workflow.FunctionList[id].FunctionName]}/>
                </div>
                <div>
                    <button>Action Container</button>
                    <input style={{ width:"300px" }} type="text" placeholder="ActionContainer" onChange={(e)=>setWorkflow({
                        ...workflow,
                        ActionContainers: {
                            ...workflow.ActionContainers,
                            [id] : e.target.value
                        }
                    })}value={workflow.ActionContainers[id]}/>
                </div>
            </div>


        )
    }
    return(
        <h1>SELECT A FUNCTION</h1>
    )
}