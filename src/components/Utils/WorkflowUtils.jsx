import { useWorkflowContext } from "../../WorkflowContext";
import useUndo from "./Undo";

// Utilities for modifying the workflow object
const useWorkflowUtils = () => {

    const {  
        workflow
    } = useWorkflowContext();
    
    const {
        updateWorkflow
    } = useUndo();


    /**
     * Helper, recursively applies changes despite nesting. If modifying array, provide entire new array
     * @param {object} target changes are applied to
     * @param {object} changes ex { WorkflowName : "new-workflow-name"}
     * @returns target with changes applied
     */
    const applyDeepChanges = (target, changes) => {
        if (target === undefined || target === null) return changes;
        
        Object.keys(changes).forEach(key => {
            const change = changes[key];

            if (Array.isArray(change)) {
                target[key] = [...change];
            }
            else if (typeof change === 'object' && change !== null) {
                if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
                    target[key] = {};
                }
                applyDeepChanges(target[key], change);
            } else {
                target[key] = change;
            }
        });

        return target;
    }

    /**
     * Updates workflow with changes
     * @param {object} changes ex { WorkflowName : "new-workflow-name"}
     * If modifying array, provide entire new array 
     */
    const applyWorkflowChanges = (changes, returnDontMutate = false) => {
        const newWorkflow = applyDeepChanges( {...workflow}, changes)
        if (returnDontMutate) {
            return newWorkflow
        } else updateWorkflow( newWorkflow )
    }

    /**
     * Adds a new action to the workflow
     * @param {string} id id of the new action
     * @param {object} options ex { FunctionName : "function1", Type : "Python"} 
     * If modifying array in options, provide entire new array
     */
    const addAction = (id, options = {}, returnDontMutate = false) => {

        const newAction = {
            Arguments: {},
            InvokeNext: [{ True: [], False: [] }],
            FaaSServer: Object.keys(workflow.ComputeServers ?? {})[0] ?? "",
            Type: "R",
            ...options
        };

        if (returnDontMutate) {
            return applyWorkflowChanges({ ActionList: { [id]: newAction } }, true)
        } else applyWorkflowChanges({ ActionList: { [id]: newAction } });
    };

    /**
     * Returns a list of actions in invokenext
     * @param {string} id 
     * @returns list of all invokes [ invokeId(rank) || invokeId, ...]
     */
    const listInvokeNext = (id) => {
        const invokes = []
        const invokeNext = workflow.ActionList[id].InvokeNext

        const trueInvokes = invokeNext[0].True 
        const falseInvokes = invokeNext[0].False
        const unconditionalInvokes = invokeNext.slice(1)

        return invokes.concat(trueInvokes, falseInvokes, unconditionalInvokes)
    }

    /**
     * Deletes action from workflow
     * @param {string} id id of action to be deleted
     */
    const deleteAction = ( id, returnDontMutate = false) => {
        const newActionList = {...workflow.ActionList}
        delete newActionList[id]
        if (returnDontMutate){
            return applyWorkflowChanges( { ActionList : newActionList}, true)
        } else applyWorkflowChanges( { ActionList : newActionList})
    }

    /**
     * Updates action in workflow with changes 
     * @param {string} id 
     * @param {object} changes ex { Type : "Python"} 
     * If modifying array, provide entire new array
     */
    const updateAction = ( id, changes, returnDontMutate = false) => {
        if (returnDontMutate) {
            return applyWorkflowChanges({
                ActionList : {
                        [id] : {
                            ...changes
                        }
                    }
                }, true
            )
        } else 
        applyWorkflowChanges(
            {
                ActionList : {
                    [id] : {
                        ...changes
                    }
                }
            }
        )
    }

    // Split invoke into id and rank i.e "invokeid(rank)" => {id, rank}
    const parseInvoke = (invoke) => {
        const hasRank = invoke.includes("(")
        const id = hasRank ? invoke.substring(0, invoke.indexOf("(") ) : invoke

        const rank = hasRank ? invoke.substring(invoke.indexOf("(") + 1, invoke.indexOf(")") ) : 1

        return { id : id, rank : rank}
    }

    // Delete invoke from action
    const deleteInvoke = ( actionId, invokeId, returnDontMutate = false) => {
        const oldInvokeNext = workflow.ActionList[actionId].InvokeNext
        let newInvokenext = [
            // Delete conditonals that match invoke Id
            {
                True : [...oldInvokeNext[0].True.filter( invoke => {
                    const { id } = parseInvoke(invoke);
                    return id !== invokeId
                })],
                False : [...oldInvokeNext[0].False.filter( invoke => {
                    const { id } = parseInvoke(invoke);
                    return id !== invokeId
                })]
            },
            // Delete unconditionals that match invoke Id
            ...oldInvokeNext.splice(1).filter( invoke => {
                const { id } = parseInvoke(invoke);
                return id !== invokeId
            })
        ]

        if (returnDontMutate){

            return updateAction( actionId, { InvokeNext : newInvokenext}, true)
        } else updateAction( actionId, { InvokeNext : newInvokenext})
    }

    const addInvoke = ( actionId, invokeId, conditonal = "Unconditional ", rank = null, returnDontMutate = false) => {
        
        const newInvoke = rank > 1 ? invokeId+"("+rank+")" : invokeId
        const oldInvokeNext = workflow.ActionList[actionId].InvokeNext
        const newInvokenext = [
            // Delete conditonals that match invoke Id
            {
                True : [
                    ...oldInvokeNext[0].True,
                    ...((conditonal === "True") ? [newInvoke] : [])
                ],
                False : [
                    ...oldInvokeNext[0].False,
                    ...((conditonal === "False") ? [newInvoke] : [])
                ]
            },
            ...oldInvokeNext.splice(1),
            ...((conditonal === "Unconditional") ? [newInvoke] : [])
        ]

        if (returnDontMutate) {
            return updateAction( actionId, { InvokeNext : newInvokenext}, true)
        } else updateAction( actionId, { InvokeNext : newInvokenext})
    }

    const concatInvoke = (id, rank) => {
        const invoke = (rank > 1) ? id+"("+rank+")" : id

        return invoke
    }

        // Find true/false/unconditional value of invoke
    const getInvokeCondition = (funcId, invoke) => {
        const invokeNext = workflow.ActionList[funcId].InvokeNext
        if ( invokeNext[0].True.includes(invoke)) return "True"
        else if ( invokeNext[0].False.includes(invoke)) return "False"
        else if (invokeNext.includes(invoke)) return "Unconditional"
        return ""
    }

    const updateInvoke = (actionId, oldInvoke, { newCondition = undefined, newRank = undefined, newTarget = undefined } = {}, returnDontMutate = false) => {
        const { id: oldId, rank: oldRank } = parseInvoke(oldInvoke)
        const newInvoke = concatInvoke( newTarget ? newTarget : oldId, newRank ? newRank : oldRank)

        const oldCondition = getInvokeCondition(actionId, oldInvoke)
        const oldInvokeNext = workflow.ActionList[actionId].InvokeNext

        const newInvokenext = [
            // Delete conditionals that match invoke Id
            {
                True : [
                    ...oldInvokeNext[0].True.filter( invoke => invoke !== oldInvoke),
                    ...(((newCondition ? newCondition : oldCondition) === "True") ? [newInvoke] : [])
                ],
                False : [
                    ...oldInvokeNext[0].False.filter( invoke => invoke !== oldInvoke),
                    ...(((newCondition ? newCondition : oldCondition) === "False") ? [newInvoke] : [])
                ]
            },
            ...oldInvokeNext.splice(1).filter( invoke => invoke !== oldInvoke),
            ...(((newCondition ? newCondition : oldCondition) === "Unconditional" ) ? [newInvoke] : [])
        ]

        if (returnDontMutate) {
            return updateAction( actionId, { InvokeNext : newInvokenext}, true)
        } else updateAction( actionId, { InvokeNext : newInvokenext})
    }

    return {
        applyWorkflowChanges,
        addAction,
        deleteAction,
        updateAction,
        deleteInvoke,
        addInvoke,
        updateInvoke,
        parseInvoke,
    };

}

export default useWorkflowUtils
