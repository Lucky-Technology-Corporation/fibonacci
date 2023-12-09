import { ReactNode, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../../API/EndpointAPI";
import Button from "../../../Utilities/Button";

export default function TaskComponent({task, headerNode, removeTask, editTask, allTasks}: {task: any, headerNode: ReactNode, removeTask: any, editTask: any, allTasks: any[]}){
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isPromptDisabled, setIsPromptDisabled] = useState<boolean>(false)
    const [taskEditPrompt, setTaskEditPrompt] = useState<string>("")
    const { promptAiTaskEdit, aiTaskExecute } = useEndpointApi()
    const [isTaskComplete, setIsTaskComplete] = useState<boolean>(false)
    const [taskCode, setTaskCode] = useState<string>("")
    const [isExecuting, setIsExecuting] = useState<boolean>(false)

    const editTaskWithAi = () => {
        setIsPromptDisabled(true)
        toast.promise(promptAiTaskEdit(task, taskEditPrompt), {
            loading: "Thinking...",
            success: (data) => {
                editTask(data)
                setIsEditing(false)
                setIsPromptDisabled(false)
                setTaskCode("")
                return "Done"
            },
            error: () => {
                setIsPromptDisabled(false)
                return "An error occured"
            }
        })
    }

    const executeTask = () => {
        setIsExecuting(true)
        setIsEditing(false)
        toast.promise(aiTaskExecute(task, allTasks), {
            loading: "Thinking...",
            success: (response: any) => {
                console.log(response)
                if(response.status == "WaitingForApproval"){
                    setTaskCode(response.task.code)
                    editTask(response.task)
                } else if(response.status == "Succeeded"){
                    setTaskCode("")
                    setIsTaskComplete(true)
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
        <div className="flex flex-col bg-[#85869822] rounded px-4 p-2 mt-2 mb-2 w-full">
            <div className="flex items-center">
                <div className="">
                    <div className="flex text-sm items-center">
                        {headerNode}
                    </div>
                    <div className="flex flex-col mt-2">
                        {task.summary}
                    </div>
                </div>
                <div className="ml-auto flex">
                    {isTaskComplete ? (
                        <div className="">
                            Completed
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
                                text={`Remove`}
                            />
                            <Button
                                className={`text-sm px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border`} 
                                onClick={() => { setIsEditing(true) }}
                                text={`Edit`}
                            />
                            <Button
                                className="text-sm text-green-400 px-3 py-1 ml-4 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border" 
                                onClick={executeTask}
                                text={taskCode != "" ? "Create" : `Execute`}
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