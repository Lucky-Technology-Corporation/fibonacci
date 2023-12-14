import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../../API/EndpointAPI";
import Button from "../../../Utilities/Button";
import { filenameToEndpoint, pathToFile } from "../../../Utilities/EndpointParser";
import { SwizzleContext } from "../../../Utilities/GlobalContext";
import { Page } from "../../../Utilities/Page";

export default function TaskComponent({task, headerNode, removeTask, editTask, allTasks, setPath}: {task: any, headerNode: ReactNode, removeTask: any, editTask: any, allTasks: any[], setPath?: any}){
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isPromptDisabled, setIsPromptDisabled] = useState<boolean>(false)
    const [taskEditPrompt, setTaskEditPrompt] = useState<string>("")
    const { promptAiTaskEdit, aiTaskExecute } = useEndpointApi()
    const [isTaskComplete, setIsTaskComplete] = useState<boolean>(task.complete)
    const [taskCode, setTaskCode] = useState<string>("")
    const [isExecuting, setIsExecuting] = useState<boolean>(false)
    
    const { promptAiEditor, writeFile } = useEndpointApi()

    const { shouldRefreshList, setShouldRefreshList, setActiveEndpoint, setSelectedTab } = useContext(SwizzleContext)

    const editTaskWithAi = () => {
        const fullPath = "frontend/src/pages/" + pathToFile(task.inputs.path)  
        setIsPromptDisabled(true)
        toast.promise(promptAiEditor(taskEditPrompt, "edit", null, null, fullPath), {
            loading: "Thinking...",
            success: (data) => {
                const updatedPageCode = data.new_code
                writeFile(fullPath, updatedPageCode)
                setIsEditing(false)
                setIsPromptDisabled(false)
                setTaskEditPrompt("")
                return "Generated Code"
            },
            error: () => {
                setIsPromptDisabled(false)
                return "An error occured"
            },
        });    
    }

    const executeTask = () => {
        setIsExecuting(true)
        setIsEditing(false)
        toast.promise(aiTaskExecute(task, allTasks.filter(v => v != null)), {
            loading: "Thinking...",
            success: (response: any) => {
                console.log(response)
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
                    console.log("task", task)
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
                <div className="">
                    <div className="flex text-sm items-center">
                        {headerNode}
                    </div>
                    <div className="flex mt-2">
                        {isTaskComplete && (
                            <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-green-400 text-lg w-3 h-3 mr-1 my-auto"
                            />
                        )}
                        {task.summary}
                    </div>
                </div>
                <div className="ml-auto flex">
                    {isTaskComplete ? (
                        <div className="cursor-pointer">
                            <div className="flex">
                                {(task.type == "CreateEndpoint") ? (
                                    <Button
                                        className={`text-sm px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border`} 
                                        onClick={() => { 
                                            setActiveEndpoint(filenameToEndpoint(task.inputs.method.toLowerCase() + task.inputs.path))
                                            setSelectedTab(Page.Apis)            
                                         }}
                                        text={"Open"}
                                    />
                                ) : (
                                    <Button
                                        className={`text-sm px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border`} 
                                        onClick={() => { setIsEditing(!isEditing) }}
                                        text={!isEditing ? "Edit" : "Done"}
                                    />
                                )}
                            </div>
                        </div>
                    ) : isEditing ? (
                        <>
                            <Button
                                className="text-sm px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border" 
                                onClick={() => { setIsEditing(false) }}
                                text={`Done`}
                            />
                        </>
                    ) : (
                        <div className={`${isExecuting && "opacity-50 pointer-events-none"} ml-auto flex`}>
                            <Button
                                className="text-sm text-red-400 px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-red-400 border-opacity-70 border-[#525363] border" 
                                onClick={removeTask}
                                text={`Cancel`}
                            />
                            <Button
                                className="text-sm text-green-400 px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border" 
                                onClick={executeTask}
                                text="Go"
                            />
                        </div>
                    )}
                </div>
            </div>
            {taskCode != "" && (
                <div className="whitespace-pre font-mono w-full mx-2 overflow-auto mt-4">
                    {taskCode}
                </div>
            )}
            {isEditing && (
                <div className="flex mt-4 mb-2 no-focus-ring">
                    <input 
                        className="flex-grow bg-[#85869833] border-[#525363] border rounded text-sm px-3 py-1 font-medium mr-3"
                        placeholder="Not right? Ask AI to update here"
                        value={taskEditPrompt}
                        onChange={(e) => { setTaskEditPrompt(e.target.value) } }
                        onKeyDown={(event) => {
                            if(event.key == "Enter"){
                                editTaskWithAi()
                            }
                        }}
                        disabled={isPromptDisabled}
                    />
                    <Button
                        text={isPromptDisabled ? "Thinking..." : "Send"}
                        className={`text-sm px-3 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border ${isPromptDisabled && "opacity-50"}`}
                        onClick={editTaskWithAi}
                    />
                </div>
            )}
        </div>
    )
}