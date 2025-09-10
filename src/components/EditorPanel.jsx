import ComputeServersPanel from "./ComputeServers/ComputeServersPanel"
import DataStoresPanel from "./DataStores/DataStoresPanel"
import FunctionsPanel from "./Functions/FunctionsPanel"
import { useWorkflowContext } from "../WorkflowContext"
import GeneralConfig from "./GeneralConfig";

function getEditor(props) {
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
                    <FunctionsPanel addEdge={(eds, newEdge) => props.addEdge(eds, newEdge)} createEdge={(a,b, c, d) => props.createEdge(a,b,c, d) } createNode={props.createNode} createNewEdge={props.createNewEdge}/>
                )
            case 'GeneralConfig':
                return(
                    <GeneralConfig/>
                )
            default:
                return(
                    <h1 sty style={{color: 'red'}}>No Edit Mode Selected</h1>
                )
        }
}



export default function EditorPanel(props) {
    const {workflow} = useWorkflowContext();
    if (Object.keys(workflow).length !== 0){
        return(
            <div
                className="editor-panel-outer"
                ref={props.ref}
                style={{ width: props.panelWidth }}
                onMouseDown={(e) => e.preventDefault()}
            >
                {getEditor(props)}
                {/* Drag handle*/}
                <div className="drag-handle" onMouseDown={props.startResizing} />
                </div>
        );
    }
    return(
        <h1>No Workflow Loaded</h1>
    )
}
