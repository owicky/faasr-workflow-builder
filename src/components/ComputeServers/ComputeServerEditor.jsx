import { useWorkflowContext } from "../../WorkflowContext"
import useUndo from "../Utils/Undo";

export default function ComputeServerEditor(props){
    const {workflow, setWorkflow, setNodes, nodes} = useWorkflowContext();
    const server = props.server
    const { updateWorkflow } = useUndo();

    const handleBlur = (e) => {
        updateWorkflow(workflow);
    };

    if(server in workflow.ComputeServers){
        switch (workflow.ComputeServers[server].FaaSType){
            case "GitHubActions":
                return(
                    <div style={{ }}>
                        <h1>Function ID: {server}</h1>
        
                        <div>
                            <button>FaaSType</button>
                            <select key={server+"-FaasType-input"} value={workflow.ComputeServers[server].FaaSType} onChange={
                                (e)=>{
                                    const newType = e.target.value
                                        switch (newType){
                                            case "Lambda":
                                                updateWorkflow({
                                                    ...workflow,
                                                    ComputeServers: {
                                                        ...workflow.ComputeServers,
                                                        [server]: {
                                                        ...workflow.ComputeServers[server],
                                                        
                                                            FaaSType: e.target.value,
                                                            Region: workflow.ComputeServers[server].Region ? workflow.ComputeServers[server].Region : "" 
                                                        }
                                                    }
                                                })
                                            case "OpenWhisk": 
                                                updateWorkflow({
                                                    ...workflow,
                                                    ComputeServers: {
                                                        ...workflow.ComputeServers,
                                                        [server]: {
                                                        ...workflow.ComputeServers[server],
                                                        
                                                            FaaSType: e.target.value,
                                                            Endpoint: workflow.ComputeServers[server].Endpoint ? workflow.ComputeServers[server].Endpoint : "",
                                                            Namespace: workflow.ComputeServers[server].Namespace ? workflow.ComputeServers[server].Namespace : ""
                                                        }
                                                    }
                                                })
                                        }
                                }}>
                                <option value={"None"}>None</option>
                                <option value={"GitHubActions"}>GitHubActions</option>
                                <option value={"OpenWhisk"}>OpenWhisk</option>
                                <option value={"Lambda"}>Lambda</option>
                            </select>
                        </div>
        
                        <div>
                            <button>UserName</button>
                            <input key={server+"-username"} type="text" defaultValue="" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    UserName: e.target.value
                                    }
                                }
                            })} 
                                onBlur={handleBlur}
                                value={workflow.ComputeServers[server].UserName}
                            />
                        </div>
        
                        <div>
                            <button>ActionRepoName</button>
                            <input key={server+"-ActionRepoName-input"} type="text" defaultValue="" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    ActionRepoName: e.target.value
                                    }
                                }
                            })}
                                onBlur={handleBlur}
                                value={workflow.ComputeServers[server].ActionRepoName}
                            />
                        </div>
        
                        <div>
                            <button>Branch</button>
                            <input key={server+"-Branch-input"} type="text" defaultValue="Branch" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Branch: e.target.value
                                    }
                                }
                            })} 
                                onBlur={handleBlur}
                                value={workflow.ComputeServers[server].Branch}
                            />
                        </div>
                        <br></br>
                        <button style={{color:"red"}} onClick={() => {
                            const serverToDelete = server
                            let newWorkflow = structuredClone(workflow);
                            delete newWorkflow.ComputeServers[serverToDelete]
                            props.setServer(null)
                            updateWorkflow(newWorkflow);
                        }}>Delete Compute Server</button>
                    </div>
                )
            case "OpenWhisk":
                return(
                    <div>
                        <h1>Function ID: {server}</h1>
        
                        <div>
                            <button>FaaSType</button>
                            <select key={server+"-FaasType-input"}value={workflow.ComputeServers[server].FaaSType} onChange={
                                (e)=>{
                                    const newType = e.target.value
                                        switch (newType){
                                            case "GitHubActions":
                                                updateWorkflow({
                                                    ...workflow,
                                                    ComputeServers: {
                                                        ...workflow.ComputeServers,
                                                        [server]: {
                                                        ...workflow.ComputeServers[server],
                                                        
                                                            FaaSType: e.target.value,
                                                            UserName: workflow.ComputeServers[server].UserName ? workflow.ComputeServers[server].UserName : "",
                                                            ActionRepoName: workflow.ComputeServers[server].ActionRepoName ? workflow.ComputeServers[server].ActionRepoName : ""
                                                        }
                                                    }
                                                })
                                            case "Lambda":
                                                updateWorkflow({
                                                    ...workflow,
                                                    ComputeServers: {
                                                        ...workflow.ComputeServers,
                                                        [server]: {
                                                        ...workflow.ComputeServers[server],
                                                        
                                                            FaaSType: e.target.value,
                                                            Region: workflow.ComputeServers[server].Region ? workflow.ComputeServers[server].Region : "" 
                                                        }
                                                    }
                                                })
                                        }
                                }}>
                                <option value={"None"}>None</option>
                                <option value={"GitHubActions"}>GitHubActions</option>
                                <option value={"OpenWhisk"}>OpenWhisk</option>
                                <option value={"Lambda"}>Lambda</option>
                            </select>
                        </div>
        
                        <div>
                            <button>Endpoint</button>
                            <input key={server+"-endpoint-input"} type="text" defaultValue="" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Endpoint: e.target.value
                                    }
                                }
                            })} 

                                onBlur={handleBlur}
                                value={workflow.ComputeServers[server].Endpoint}
                            />
                        </div>
        
                        <div>
                            <button>Namespace</button>
                            <input key={server+"-namespace-input"} type="text" defaultValue="" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Namespace: e.target.value
                                    }
                                }
                            })} 
                                onBlur={handleBlur}
                                value={workflow.ComputeServers[server].Namespace}
                            />
                        </div>
        
                        <div>
                            <button>Region</button>
                            <input key={server+"-region-input"} type="text" defaultValue="" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Region: e.target.value
                                    }
                                }
                            })} 
                                onBlur={handleBlur}
                                value={workflow.ComputeServers[server].Region}
                            />
                        </div>
                        <br></br>
                        <button style={{color:"red"}} onClick={() => {
                            const serverToDelete = server
                            let newWorkflow = structuredClone(workflow);
                            delete newWorkflow.ComputeServers[serverToDelete]
                            props.setServer(null)
                            updateWorkflow(newWorkflow);
                        }}>Delete Compute Server</button>
                    </div>
                )
            case "Lambda":
                return(
                    <div>
                        <h1>Function ID: {server}</h1>
        
                        <div>
                            <button>FaaSType</button>
                            <select value={workflow.ComputeServers[server].FaaSType} onChange={
                                (e)=>{
                                    const newType = e.target.value
                                        switch (newType){
                                            case "GitHubActions":
                                                updateWorkflow({
                                                    ...workflow,
                                                    ComputeServers: {
                                                        ...workflow.ComputeServers,
                                                        [server]: {
                                                        ...workflow.ComputeServers[server],
                                                        
                                                            FaaSType: e.target.value,
                                                            UserName: workflow.ComputeServers[server].UserName ? workflow.ComputeServers[server].UserName : "",
                                                            ActionRepoName: workflow.ComputeServers[server].ActionRepoName ? workflow.ComputeServers[server].ActionRepoName : ""
                                                        }
                                                    }
                                                })
                                            case "OpenWhisk": 
                                                updateWorkflow({
                                                    ...workflow,
                                                    ComputeServers: {
                                                        ...workflow.ComputeServers,
                                                        [server]: {
                                                        ...workflow.ComputeServers[server],
                                                        
                                                            FaaSType: e.target.value,
                                                            Endpoint: workflow.ComputeServers[server].Endpoint ? workflow.ComputeServers[server].Endpoint : "",
                                                            Namespace: workflow.ComputeServers[server].Namespace ? workflow.ComputeServers[server].Namespace : ""
                                                        }
                                                    }
                                                })
                                        }
                                }}>
                                <option value={"None"}>None</option>
                                <option value={"GitHubActions"}>GitHubActions</option>
                                <option value={"OpenWhisk"}>OpenWhisk</option>
                                <option value={"Lambda"}>Lambda</option>
                            </select>
                        </div>
        
                        <div>
                            <button>Region</button>
                            <input key={server+"-region-input"} type="text" defaultValue="" onChange={(e)=>setWorkflow({
                                ...workflow,
                                ComputeServers: {
                                    ...workflow.ComputeServers,
                                    [server]: {
                                    ...workflow.ComputeServers[server],
                                    Region: e.target.value
                                    }
                                }
                            })} 
                                onBlur={handleBlur}
                                value={workflow.ComputeServers[server].Region} 
                            />
                        </div>
                        <br></br>
                        <button style={{color:"red"}} onClick={() => {
                            const serverToDelete = server
                            let newWorkflow = structuredClone(workflow);
                            delete newWorkflow.ComputeServers[serverToDelete]
                            props.setServer(null)
                            updateWorkflow(newWorkflow);
                        }}>Delete Compute Server</button>
                    </div>
                )
            default:
                return(
                    <div>
                        <button>FaaSType</button>
                        <select value={workflow.ComputeServers[server].FaaSType} onChange={(e)=>updateWorkflow({
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
    }else{
        props.setServer(null);
    }
    return(
        <h1>NO COMPUTE SERVER SELECTED</h1>
    )
}
