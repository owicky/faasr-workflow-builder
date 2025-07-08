import { useWorkflowContext } from "../../WorkflowContext"

export default function VisibleWorkflow(props){
    const {workflow} = useWorkflowContext();

    if(props.visible){
        return(
            <div id="jsonview-panel" style={{width: '30vw', height: '100%'}}>CURRENT WORKFLOW<pre>{JSON.stringify(workflow, null, 2) }</pre></div>
        )
    }else{
        return (<></>)
    }

}