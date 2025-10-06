
import { Handle, Position } from '@xyflow/react';
import gitLogoLight from '../assets/github-mark-white.svg'
import gitLogoDark from '../assets/github-mark.svg'
import awsLogo from '../assets/awsLambda.png'
import openWhiskLogo  from '../assets/openWhiskIcon.svg'
import rLogo  from '../assets/R_logo.png'
import pythonLogo  from '../assets/pythonLogo.svg'
import googleCloudLogo from '../assets/googleCloudLogo.svg'
import SLURMLogo from '../assets/SLURMLogo.png'
import { useWorkflowContext } from '../WorkflowContext';




const FunctionNode = ({ data }) => {
    const {workflow, colorMode} = useWorkflowContext()

    if (!(data.id in workflow.ActionList)) {
        return;
    }

    const FaasAcc = workflow.ActionList[data.id]?.FaaSServer
    const FaasType = workflow.ComputeServers[FaasAcc]?.FaaSType
    const FuncType = workflow.ActionList[data.id]?.Type

    const logos={ 
        "GitHubActions": (colorMode === 'light') ?  gitLogoDark : gitLogoLight,
        "Lambda":awsLogo, 
        "OpenWhisk":openWhiskLogo,
        "R":rLogo,
        "Python":pythonLogo,
        "GoogleCloud": googleCloudLogo,
        "SLURM": SLURMLogo
    };

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
                            <img className='compute-server-logo' alt="" src={logos[FaasType]} style={{ width: '30px', height: '30px'}}/>
                            <img className='type-logo' alt="" src={ logos[FuncType] || ""}style={{ width: '15px', height: '15px'}}/>
                            <label className='truncate'>{data.id}</label>
                            <br></br>
                        </div>
                    <Handle type="source" position={( data.direct === 0) ? Position.Right : Position.Bottom}/>
                </div>
            </div>
        )
    }
    else{
        return (
            <div className='function-node'>
                <Handle type="target"   id={data.direct === 0 ? "left" : "top"}  position={( data.direct  === 0) ? Position.Left : Position.Top} />
                    <div style={{display : "flex", alignItems : "baseline"}}>
                        <img className='compute-server-logo' alt="" src={logos[FaasType]}style={{ width: '30px', height: '30px'}}/>
                        <img className='type-logo' alt="" src={ logos[FuncType]}style={{ width: '15px', height: '15px'}}/>
                        <label style={{paddingLeft: "2px"}} className='truncate'>{data.id}</label>
                        <br></br>
                    </div>
                <Handle type="source"   position={( data.direct === 0) ? Position.Right : Position.Bottom}/>
            </div>
        );
    }
};

export default FunctionNode;
