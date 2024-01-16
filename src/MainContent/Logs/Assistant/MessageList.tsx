import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Task from "./Task";

export default function MessageList( {messages, setMessages, setPath} : {messages: any[], setMessages: any, setPath: any}){

    const removeTaskFromMessage = (messageIndex: number, taskIndex: number) => {
        console.log("removing task", messageIndex, taskIndex)
        const newMessages = [...messages]
        newMessages[messageIndex].tasks.splice(taskIndex, 1)
        setMessages(newMessages)
    }

    const editTaskInMessage = (messageIndex: number, taskIndex: number, newTask: any) => {
        console.log("editing task", messageIndex, taskIndex, newTask)
        const newMessages = [...messages]
        newMessages[messageIndex].tasks[taskIndex] = newTask
        setMessages(newMessages)
    }

    function removeQuotes(str) {
        if (typeof str !== 'string') return str;
        if (str.startsWith('"') && str.endsWith('"')) {
            return str.slice(1, -1);
        }
        return str;
    }    

    const message = messages[0]

    if(!messages) return <></>

    return (
        <div className="w-full flex flex-row overflow-x-hidden">

            <div className="w-1/2 h-full flex flex-col mx-4">
                <div className="ml-1 mt-0.5 mb-2 flex align-bottom justify-between w-full">
                <div className="flex"> 
                    <div>
                        <div className="flex">
                            <img src="/cloud.svg" className="w-4 h-4 my-auto mr-1.5" />
                            <div className="text-base font-bold mb-0">Backend</div>
                        </div>
                        <div className="mt-0.5 flex">
                            Can update your
                            <div className="font-bold flex"><img src="database.svg" className="w-3 h-3 my-auto ml-1.5 mr-1" />Database</div>, 
                            access 
                            <div className="font-bold flex"><img src="files.svg" className="w-3 h-3 my-auto ml-1.5 mr-1" />Files</div>, 
                            and connect to other APIs.
                        </div>
                    </div>
                </div>
                </div>
                {/* {messages.map((message, messageIndex) => ( */}
                    <>
                        {message.role == "assistant" && 
                            (message.tasks.length == 0 && (
                                <div className="flex flex-col leading-normal mb-0.5" key={0}>
                                <div className="flex items-top mb-0.5 mt-1 ml-2 font-bold text-violet-300">
                                    <FontAwesomeIcon icon={faRobot} className="text-sm mt-0.5 mr-1" />
                                    <span className="text-sm ml-0">"{removeQuotes(message.content)}"</span>
                                </div>
                                </div>
                            ))
                        }
                        {message.role == "assistant" && (
                            message.tasks.map((task, taskIndex) => (
                                (task.type == "CreateEndpoint") ? (
                                    <div className="flex flex-col leading-normal mb-0.5" key={taskIndex}>
                                        <div className="flex flex-col justify-center items-center">
                                        <Task 
                                            key={taskIndex + "-task"}
                                            task={task} 
                                            removeTask={() => { removeTaskFromMessage(0, taskIndex) }} 
                                            editTask={(newTask: any) => { editTaskInMessage(0, taskIndex, newTask) }} 
                                            allTasks={messages.map((message) => message.tasks).flat()}
                                            setPath={setPath}
                                        />
                                        </div>
                                    </div>
                                ) : (<></>)
                            ))
                        )}
                    </> 
                {/* ))} */}
            </div>   


            <div className="w-1/2 h-full flex flex-col mx-4">
                <div className="ml-1 mt-0.5 mb-2 flex align-bottom justify-between w-full">
                    <div>
                        <div className="flex"> 
                            <div className="w-full grow">
                                <div className="flex">
                                    <img src="/world.svg" className="w-4 h-4 my-auto mr-1.5" />
                                    <div className="text-base font-bold mb-0">Frontend</div>
                                </div>
                                <div className="mt-0.5 flex">
                                    Code that runs in the browser and generates UI
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {/* {messages.map((message, messageIndex) => ( */}
                    <>
                        {message.role == "assistant" && (
                            message.tasks.map((task, taskIndex) => (
                                (task.type == "CreatePage") ? (
                                    <div className="flex flex-col leading-normal mb-0.5" key={taskIndex}>
                                        <div className="flex flex-col justify-center items-center">
                                        <Task 
                                            key={taskIndex + "-task"}
                                            task={task} 
                                            removeTask={() => { removeTaskFromMessage(0, taskIndex) }} 
                                            editTask={(newTask: any) => { editTaskInMessage(0, taskIndex, newTask) }} 
                                            allTasks={messages.map((message) => message.tasks).flat()}
                                            setPath={setPath}
                                        />
                                        </div>
                                    </div>
                                ) : (<></>)
                            ))
                        )}
                    </> 
                {/* ))} */}
            </div>     
        </div>
    )
}