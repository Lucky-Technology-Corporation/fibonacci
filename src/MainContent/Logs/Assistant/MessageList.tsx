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
        <div className="w-full h-full flex flex-col mx-4">
            {messages.map((message, messageIndex) => (
                <div className="flex flex-col leading-normal">
                    <div className="flex items-center">
                        {message.role == "assistant" ? (
                            <span className="font-bold text-base ml-2">Items</span>
                        ) : (
                            <></>
                            // <span className="font-bold text-base ml-2">Me</span>
                        )}
                    </div>
                    <div className="flex flex-col justify-center items-center">
                            {message.role == "user" ? (
                                <></>
                                // <div className="bg-[#85869822] rounded px-4 p-2 mt-2 mb-2 w-full">
                                //     <div className={`text-white italic opacity-70`}>{message.content}</div>
                                // </div>
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