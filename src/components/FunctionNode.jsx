
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

    const xShift = -11
    const yShift = -1

    if (parseInt(data.rank) > 1){
        return(
            <div className='function-node'>
                <div style={{ marginLeft: xShift, marginTop: yShift}} className='function-node'>

                    {/* Rank Display */}
                    <span style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: '#eee', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        padding: '2px 5px',
                        color: '#333',
                    }}>Rank: {data.rank}</span>
                    <Handle type="target" position={( data.direct  === 0) ? Position.Left : Position.Top} />
                        <div style={{ paddingTop : "5px", display : "flex", alignItems : "baseline"}}>
                            <img alt="" src={logos[FaasType]} style={{ width: '30px', height: '30px'}}/>
                            <label className='truncate'>{data.id}</label>
                            <br></br>
                        </div>
                    <Handle type="source" position={( data.direct === 0) ? Position.Right : Position.Bottom} id="a"/>
                </div>
            </div>
        )
    }
    else{
        return (
            <div className='function-node'>
                <Handle type="target" position={( data.direct  === 0) ? Position.Left : Position.Top} />
                    <div style={{display : "flex", alignItems : "baseline"}}>
                        <img alt="" src={logos[FaasType]}style={{ width: '30px', height: '30px'}}/>
                        <label style={{paddingLeft: "2px"}} className='truncate'>{data.id}</label>
                        <br></br>
                    </div>
                <Handle type="source" position={( data.direct === 0) ? Position.Right : Position.Bottom} id="a"/>
            </div>
        );
    }
};

export default FunctionNode;