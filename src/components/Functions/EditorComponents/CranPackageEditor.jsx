import { useWorkflowContext } from "../../../WorkflowContext"
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import useWorkflowUtils from "../../Utils/WorkflowUtils";

export default function CranPackageEditor( props ){
    const {workflow} = useWorkflowContext();
    const { applyWorkflowChanges } = useWorkflowUtils()

    const id = props.id
    const [newCranPackage, setNewCranPackage] = useState("")
    const functionName = workflow.ActionList[id].FunctionName

    return (

        <div id="cran-package-editor">
            <GenericLabel size={"20px"} value={"CRAN Packages for the Function"}></GenericLabel>
            <div style={{border: "solid"}}>

                {/* Entries for each CRANPackage */}
                { workflow.FunctionCRANPackage[functionName] ? 
                    Object.entries(workflow.FunctionCRANPackage[functionName]).map(([key, val]) => (
                        <div style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                            <input
                            type="text"
                            placeholder={key+" value"}
                            value={val}
                            onChange={(e) =>
                                applyWorkflowChanges({
                                    FunctionCRANPackage : {
                                        [functionName] :
                                        workflow.FunctionCRANPackage[functionName].map(
                                            pkg => pkg === val ? e.target.value : pkg
                                        )
                                    }
                                }
                                )
                            }
                            onBlur={props.onBlur}
                            />
                            <button style={{color:"red"}} onClick={() => {
                                applyWorkflowChanges({
                                    FunctionCRANPackage : {
                                        [functionName] : 
                                            workflow.FunctionCRANPackage[functionName].filter( pkg => pkg !== val)
                                    }
                                });
                            }}>Delete</button>
                    </div>
                    ))
                    : ""
                }

                {/* Adding another package */}
                <input value={newCranPackage} placeholder="NewPackageName" onChange={ (e) => setNewCranPackage(e.target.value)}></input>
                <button onClick={() => {
                    const newPackageName = newCranPackage.trim()
                    if(newPackageName !== "" && (!workflow.FunctionCRANPackage[functionName] || !workflow.FunctionCRANPackage[functionName].includes(newPackageName))){
                        applyWorkflowChanges({
                            FunctionCRANPackage: {
                                [functionName]: [
                                    ...(workflow.FunctionCRANPackage[functionName] || []),
                                    newPackageName
                                ]
                            }
                        });
                        setNewCranPackage("");
                    }
                }}>Add Package</button>
            </div>
        </div>

    )
}
