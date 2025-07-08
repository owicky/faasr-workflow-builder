import { useWorkflowContext } from "../../WorkflowContext"

export default function ComputeServerEditor(props){
    const {workflow, setWorkflow, setNodes, nodes} = useWorkflowContext();
    const server = props.server

    if(server != null){
        switch (workflow.ComputeServers[server].FaaSType){
            case "GitHubActions":
                return(
                    <div style={{ backgroundColor: "grey"}}>
                        <h1>Function ID: {server}</h1>
        
                        <div>
                            <button>FaaSType</button>
                            <select value={workflow.ComputeServers[server].FaaSType} onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    FaaSType: e.target.value
                                    }
                                }
                                })}>
                                <option value={"None"}>None</option>
                                <option value={"GitHubActions"}>GitHubActions</option>
                                <option value={"OpenWhisk"}>OpenWhisk</option>
                                <option value={"Lambda"}>Lambda</option>
                            </select>
                        </div>
        
                        <div>
                            <button>UserName</button>
                            <input type="text" placeholder="UserName" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    UserName: e.target.value
                                    }
                                }
                            })} value={workflow.ComputeServers[server].UserName}/>
                        </div>
        
                        <div>
                            <button>ActionRepoName</button>
                            <input type="text" placeholder="ActionRepoName" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    ActionRepoName: e.target.value
                                    }
                                }
                            })} value={workflow.ComputeServers[server].ActionRepoName}/>
                        </div>
        
                        <div>
                            <button>Branch</button>
                            <input type="text" placeholder="Branch" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Branch: e.target.value
                                    }
                                }
                            })} value={workflow.ComputeServers[server].Branch}/>
                        </div>
                        <br></br>
                        <button style={{color:"red"}} onClick={() => {
                            const serverToDelete = server
                            delete workflow.ComputeServers[serverToDelete]
                            props.setServer(null)
                            setNodes([...nodes])
                        }}>Delete Compute Server</button>
                    </div>
                )
            case "OpenWhisk":
                return(
                    <div style={{ backgroundColor: "grey"}}>
                        <h1>Function ID: {server}</h1>
        
                        <div>
                            <button>FaaSType</button>
                            <select value={workflow.ComputeServers[server].FaaSType} onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    FaaSType: e.target.value
                                    }
                                }
                                })}>
                                <option value={"None"}>None</option>
                                <option value={"GitHubActions"}>GitHubActions</option>
                                <option value={"OpenWhisk"}>OpenWhisk</option>
                                <option value={"Lambda"}>Lambda</option>
                            </select>
                        </div>
        
                        <div>
                            <button>Endpoint</button>
                            <input type="text" placeholder="Endpoint" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Endpoint: e.target.value
                                    }
                                }
                            })} value={workflow.ComputeServers[server].Endpoint}/>
                        </div>
        
                        <div>
                            <button>Namespace</button>
                            <input type="text" placeholder="Namespace" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Namespace: e.target.value
                                    }
                                }
                            })} value={workflow.ComputeServers[server].Namespace}/>
                        </div>
        
                        <div>
                            <button>Region</button>
                            <input type="text" placeholder="Region" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Region: e.target.value
                                    }
                                }
                            })} value={workflow.ComputeServers[server].Region}/>
                        </div>
                        <br></br>
                        <button style={{color:"red"}} onClick={() => {
                            const serverToDelete = server
                            delete workflow.ComputeServers[serverToDelete]
                            props.setServer(null)
                            setNodes([...nodes])
                        }}>Delete Compute Server</button>
                    </div>
                )
            case "Lambda":
                return(
                    <div>
                        <h1>Function ID: {server}</h1>
        
                        <div>
                            <button>FaaSType</button>
                            <select value={workflow.ComputeServers[server].FaaSType} onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    FaaSType: e.target.value
                                    }
                                }
                                })}>
                                <option value={"None"}>None</option>
                                <option value={"GitHubActions"}>GitHubActions</option>
                                <option value={"OpenWhisk"}>OpenWhisk</option>
                                <option value={"Lambda"}>Lambda</option>
                            </select>
                        </div>
        
                        <div>
                            <button>Region</button>
                            <input type="text" placeholder="Region" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Region: e.target.value
                                    }
                                }
                            })} value={workflow.ComputeServers[server].Region} />
                        </div>
                        <br></br>
                        <button style={{color:"red"}} onClick={() => {
                            const serverToDelete = server
                            delete workflow.ComputeServers[serverToDelete]
                            props.setServer(null)
                            setNodes([...nodes])
                        }}>Delete Compute Server</button>
                    </div>
                )
            default:
                return(
                    <div>
                        <button>FaaSType</button>
                        <select value={workflow.ComputeServers[server].FaaSType} onChange={(e)=>setWorkflow({
                            ...workflow,
                            ComputeServers: {
                                ...workflow.ComputeServers,
                                [server]: {
                                ...workflow.ComputeServers[server],
                                FaaSType: e.target.value
                                }
                            }
                            })}>
                            <option value={"None"}>None</option>
                            <option value={"GitHubActions"}>GitHubActions</option>
                            <option value={"OpenWhisk"}>OpenWhisk</option>
                            <option value={"Lambda"}>Lambda</option>
                        </select>
                    </div>
                )
        }
    }
    return(
        <h1>NO COMPUTE SERVER SELECTED</h1>
    )
}