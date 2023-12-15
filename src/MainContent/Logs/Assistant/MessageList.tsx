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
            <div className="ml-1 mt-0.5"><div className="text-sm font-bold">App code</div></div>
            {messages.map((message, messageIndex) => (
                <div className="flex flex-col leading-normal mb-0.5">
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