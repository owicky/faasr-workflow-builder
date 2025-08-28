import { useWorkflowContext } from "../../../WorkflowContext"
import useUndo from "../../Utils/Undo";
import GenericLabel from "../../Utils/GenericLabel"
import { useState } from "react";
import useWorkflowUtils from "../../Utils/WorkflowUtils";

export default function GitPackageEditor( props ){
    const {workflow} = useWorkflowContext();
    const { applyWorkflowChanges } = useWorkflowUtils()

    // Id of Action we are editing
    const id = props.id

    const [newGitPackage, setNewGitPackage] = useState("")
    const functionName = workflow.ActionList[id].FunctionName


    return (
        <div id="git-package-editor">
        <GenericLabel size={"20px"} value={"GitHub Packages for the Function"}></GenericLabel>
            <div style={{border: "solid"}}>

                {/* Entries for each GitHubPackage */}
                { workflow.FunctionGitHubPackage[functionName] ? 
                    Object.entries(workflow.FunctionGitHubPackage[functionName]).map(([key, val]) => (
                        <div style={{ display : "flex", marginBottom: "1px",  backgroundColor: "#d5e8ee"}}>
                            <input
                            type="text"
                            placeholder={key+" value"}
                            value={val}
                            onChange={(e) =>
                                applyWorkflowChanges({
                                    FunctionGitHubPackage : {
                                        [functionName] :
                                        workflow.FunctionGitHubPackage[functionName]
                                            .map(pkg => pkg === val ? e.target.value : pkg)
                                    }
                                }
                                )
                            }
                            onBlur={props.onBlur} 
                            />
                            <button style={{color:"red"}} onClick={() => {
                                applyWorkflowChanges({
                                    FunctionGitHubPackage : {
                                        [functionName] : 
                                            workflow.FunctionGitHubPackage[functionName].filter( pkg => pkg !== val)
                                    }
                                });
                            }}>Delete</button>
                    </div>
                    ))
                    : ""
                }

                {/* Adding another package */}
                <input value={newGitPackage} placeholder="NewPackageName" onChange={ (e) => setNewGitPackage(e.target.value)}></input>
                <button onClick={() => {
                    const newPackageName = newGitPackage.trim()
                    if(newPackageName !== "" && (!workflow.FunctionGitHubPackage[functionName] || !workflow.FunctionGitHubPackage[functionName].includes(newPackageName))){
                        applyWorkflowChanges({
                            FunctionGitHubPackage: {
                                [functionName]: [
                                    ...(workflow.FunctionGitHubPackage[functionName] || []),
                                    newPackageName
                                ]
                            }
                        });
                        setNewGitPackage("");
                    }
                }}>Add Package</button>
            </div>
        </div>
    )
}
