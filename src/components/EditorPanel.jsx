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
                    <div className="editor-panel-outer">
                        <ComputeServersPanel/>
                    </div>
                )
            case 'DataStores':
                return(
                    <div className="editor-panel-outer">
                        <DataStoresPanel/>
                    </div>
                )
            case 'Functions':
                return(
                    <div className="editor-panel-outer">
                        <FunctionsPanel addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} checkCycle={ (nds,eds) => props.checkCycle(nds, eds) } createEdge={(a,b, c, d) => props.createEdge(a,b,c, d) } createNode={props.createNode} createNewEdge={props.createNewEdge}/>
                    </div>
                )
            case 'GeneralConfig':
                return(
                    <div className="editor-panel-outer">
                        <GeneralConfig/>
                    </div>
                )
            default:
                return(
                    <div className="editor-panel-outer">
                        <h1 style={{color: 'red'}}>No Edit Mode Selected</h1>
                    </div>
                )
        }
    }
    return(
        <h1>No Workflow Loaded</h1>
    )
}
