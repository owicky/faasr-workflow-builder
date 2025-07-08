
import { Handle, Position } from '@xyflow/react';

import gitLogo from '../assets/github-mark.png'
import awsLogo from '../assets/awsLambda.png'
import openWhiskLogo  from '../assets/openWhisk.png'
import { useWorkflowContext } from '../WorkflowContext';

const logos={ 
    "GitHubActions":gitLogo, 
    "Lambda":awsLogo, 
    "OpenWhisk":openWhiskLogo
};

const FunctionNode = ({ data }) => {
    const {workflow} = useWorkflowContext()

    const FaasAcc = workflow.FunctionList[data.id]?.FaaSServer
    const FaasType = workflow.ComputeServers[FaasAcc]?.FaaSType

    return (
        <div className='function-node'>
            <Handle type="target" position={( data.direct  === 0) ? Position.Left : Position.Top} />
            <div style={{display : "flex", alignItems : "baseline"}}>
                <img alt="" src={logos[FaasType]}style={{ width: '30px', height: '30px'}}/>
                <label className='truncate'>{data.id}</label> 
                <br></br>
            </div>
            <Handle type="source" position={( data.direct === 0) ? Position.Right : Position.Bottom} id="a"/>
        </div>
    );
};

export default FunctionNode;