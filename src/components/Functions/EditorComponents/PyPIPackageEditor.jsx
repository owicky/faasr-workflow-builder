import { useWorkflowContext } from "../../../WorkflowContext"
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import useWorkflowUtils from "../../Utils/WorkflowUtils";

export default function PyPIPackageEditor( props ){
    const {workflow} = useWorkflowContext();
    const { applyWorkflowChanges } = useWorkflowUtils()

    const id = props.id
    const [newPyPIPackage, setNewPyPIPackage] = useState("")
    const functionName = workflow.ActionList[id].FunctionName

    return (

        <div id="cran-package-editor">
            <GenericLabel size={"20px"} value={"Python Packages for the Function"}></GenericLabel>
            <div style={{border: "solid"}}>

                {/* Entries for each PyPIPackage */}
                { workflow.PyPIPackageDownloads[functionName] ? 
                    Object.entries(workflow.PyPIPackageDownloads[functionName]).map(([key, val]) => (
                        <div style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                            <input
                            type="text"
                            placeholder={key+" value"}
                            value={val}
                            onChange={(e) =>
                                applyWorkflowChanges({
                                    PyPIPackageDownloads : {
                                        [functionName] :
                                        workflow.PyPIPackageDownloads[functionName].map(
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
                                    PyPIPackageDownloads : {
                                        [functionName] : 
                                            workflow.PyPIPackageDownloads[functionName].filter( pkg => pkg !== val)
                                    }
                                });
                            }}>Delete</button>
                    </div>
                    ))
                    : ""
                }

                {/* Adding another package */}
                <input value={newPyPIPackage} placeholder="NewPackageName" onChange={ (e) => setNewPyPIPackage(e.target.value)}></input>
                <button onClick={() => {
                    const newPackageName = newPyPIPackage.trim()
                    if(newPackageName !== "" && (!workflow.PyPIPackageDownloads[functionName] || !workflow.PyPIPackageDownloads[functionName].includes(newPackageName))){
                        applyWorkflowChanges({
                            PyPIPackageDownloads: {
                                [functionName]: [
                                    ...(workflow.PyPIPackageDownloads[functionName] || []),
                                    newPackageName
                                ]
                            }
                        });
                        setNewPyPIPackage("");
                    }
                }}>Add Package</button>
            </div>
        </div>

    )
}
