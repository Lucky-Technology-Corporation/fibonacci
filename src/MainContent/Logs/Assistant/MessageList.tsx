import Button from "../../../Utilities/Button";
import Task from "./Task";

export default function MessageList( {messages, setMessages, setPath} : {messages: any[], setMessages: any, setPath: any}){

    const removeTaskFromMessage = (messageIndex: number, taskIndex: number) => {
        const newMessages = [...messages]
        newMessages[messageIndex].tasks.splice(taskIndex, 1)
        setMessages(newMessages)
    }

    const editTaskInMessage = (messageIndex: number, taskIndex: number, newTask: any) => {
        const newMessages = [...messages]
        newMessages[messageIndex].tasks[taskIndex] = newTask
        setMessages(newMessages)
    }

    return (
        <div className="w-full h-full flex flex-col mx-4 overflow-scroll" style={{paddingBottom: "68px"}}>
            <div className="ml-1 mt-0.5 mb-2 flex align-bottom justify-between w-full">
                <div>
                    <div className="text-sm font-bold mb-0">App code</div>
                    <div className="mt-0.5">This is a list of resources Swizzle will build for you</div>
                </div>
                <Button
                    onClick={() => { setPath("appCode") }}
                    text="+"
                    className="mr-1.5 text-sm px-3 my-2 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                />
            </div>
            {messages.map((message, messageIndex) => (
                <div className="flex flex-col leading-normal mb-0.5" key={messageIndex}>
                    {message.role == "assistant" && message.tasks.length > 0 ? (
                        <div className="flex items-center mb-0.5 mt-1">
                            <span className="text-sm ml-1">"{messages[messageIndex + 1].content}"</span>
                        </div>
                    ) : (
                        <></>
                    )}
                    <div className="flex flex-col justify-center items-center">
                            {message.role == "user" ? (
                                <></>
                            ) : (
                                message.tasks.map((task, taskIndex) => (
                                   <Task 
                                        key={taskIndex + "-task"}
                                        task={task} 
                                        removeTask={() => { removeTaskFromMessage(messageIndex, taskIndex) }} 
                                        editTask={(newTask: any) => { editTaskInMessage(messageIndex, taskIndex, newTask) }} 
                                        allTasks={messages.map((message) => message.tasks).flat()}
                                        setPath={setPath}
                                    />
                                ))
                            )}
                    </div>
                </div>
            ))}
        </div>    
    )
}