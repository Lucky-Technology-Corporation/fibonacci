import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../../API/EndpointAPI";
import Button from "../../../Utilities/Button";
import { SwizzleContext } from "../../../Utilities/GlobalContext";

export default function TaskComponent({task, headerNode, removeTask, editTask, allTasks, setPath}: {task: any, headerNode: ReactNode, removeTask: any, editTask: any, allTasks: any[], setPath?: any}){
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isPromptDisabled, setIsPromptDisabled] = useState<boolean>(false)
    const [taskEditPrompt, setTaskEditPrompt] = useState<string>(task.summary)
    const { promptAiTaskEdit, aiTaskExecute } = useEndpointApi()
    const [isTaskComplete, setIsTaskComplete] = useState<boolean>(task.complete)
    const [taskCode, setTaskCode] = useState<string>("")
    const [isExecuting, setIsExecuting] = useState<boolean>(false)
    
    const { promptAiEditor, writeFile } = useEndpointApi()

    const { shouldRefreshList, setShouldRefreshList, setActiveEndpoint, setSelectedTab } = useContext(SwizzleContext)

    const editTaskSummary = () => {
        editTask({ ...task, summary: taskEditPrompt })    
    }

    const executeTask = () => {
        setIsExecuting(true)
        setIsEditing(false)
        toast.promise(aiTaskExecute(task, allTasks.filter(v => v != null)), {
            loading: "Thinking...",
            success: (response: any) => {
                if(response.status == "TASK_WAITING_FOR_APPROVAL"){
                    setTaskCode(response.task.code)
                    editTask(response.task)
                } else if(response.status == "TASK_SUCCEEDED"){
                    setTaskCode("")
                    setIsTaskComplete(true)
                    setShouldRefreshList(!shouldRefreshList)
                    var newTask = task
                    newTask.complete = true
                    editTask(newTask)
                } else{
                    toast.error("An error occured")
                }
                setIsExecuting(false)
                return "Done"
            },
            error: () => {
                setIsExecuting(false)
                return "An error occured"
            },
        });
    }

    return (
        <div className={`flex flex-col bg-[#85869822] rounded px-4 p-2 mt-2 mb-2 w-full ${setPath && "cursor-pointer"}`} onClick={() => {
            if(setPath){
                setPath(task.inputs.path)
            }
        }}>
            <div className="flex items-center">
                <div className="w-full">
                    <div className="flex text-sm items-center">
                        {headerNode}
                    </div>
                    <div className="flex mt-2 w-full items-top">
                        {isTaskComplete && (
                            <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-green-400 text-lg w-3 h-3 mr-1 my-auto"
                            />
                        )}
                        <div className="font-bold mr-2 shrink-0">{task.feature_group}</div>
                        <div className="no-focus-ring w-full">
                            {isEditing ? (
                                <input 
                                    className="my-auto w-full text-xs font-semibold bg-[#85869822] border-[#525363] border rounded p-1 px-1 mx-0 mr-2"
                                    placeholder="Change the summary"
                                    value={taskEditPrompt}
                                    onChange={(e) => { setTaskEditPrompt(e.target.value) } }
                                    onKeyDown={(event) => {
                                        if(event.key == "Enter"){
                                            editTaskSummary()
                                        }
                                    }}
                                    disabled={isPromptDisabled}
                                />
                            ) : (
                                task.summary
                            )}
                        </div>
                    </div>
                </div>
                <div className="ml-auto flex">
                    {isEditing ? (
                        <>
                            <Button
                                className="text-sm px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border" 
                                onClick={() => { setIsEditing(false); editTaskSummary(); }}
                                text={`Done`}
                            />
                        </>
                    ) : (
                        <div className={`${isExecuting && "opacity-50 pointer-events-none"} ml-auto flex`}>
                             <Button
                                className="text-sm px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border" 
                                onClick={() => { setIsEditing(true) }}
                                text={`Edit`}
                            />
                            <Button
                                className="text-sm text-red-400 px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-red-400 border-opacity-70 border-[#525363] border" 
                                onClick={removeTask}
                                text={`Remove`}
                            />
                            {/* <Button
                                className="text-sm text-green-400 px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border" 
                                onClick={executeTask}
                                text="Go"
                            /> */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}