import ComputeServersPanel from "./ComputeServers/ComputeServersPanel"
import DataStoresPanel from "./DataStores/DataStoresPanel"
import FunctionsPanel from "./Functions/FunctionsPanel"
import { useWorkflowContext } from "../WorkflowContext"
import GeneralConfig from "./GeneralConfig";
export default function EditorPanel(props) {
    const {workflow} = useWorkflowContext();
    if (Object.keys(workflow).length !== 0){
        switch(props.type) {
            case 'ComputeServers':
                return(
                    <ComputeServersPanel/>
                )
            case 'DataStores':
                return(
                    <DataStoresPanel/>
                )
            case 'Functions':
                return(
                    <FunctionsPanel addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} checkCycle={ (nds,eds) => props.checkCycle(nds, eds) } createEdge={(a,b) => props.createEdge(a,b)} createNode={props.createNode} createNewEdge={props.createNewEdge}/>
                )
            case 'GeneralConfig':
                return(
                    <GeneralConfig/>
                )
            default:
                return(
                    <h1 style={{color: 'red'}}>No Edit Mode Selected</h1>
                )
        }
    }
    return(
        <h1>No Workflow Loaded</h1>
    )
}
