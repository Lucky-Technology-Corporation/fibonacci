import { faPlus, faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

    function removeQuotes(str) {
        if (str.startsWith('"') && str.endsWith('"')) {
            return str.slice(1, -1);
        }
        return str;
    }    

    if(!messages) return <></>

    return (
        <div className="w-full flex flex-row overflow-x-hidden space-x-8">

            <div className="w-1/2 h-full flex flex-col mx-4">
                <div className="ml-1 mt-0.5 mb-2 flex align-bottom justify-between w-full">
                <div className="flex"> 
                    <Button
                        onClick={() => {}}
                        children={<FontAwesomeIcon icon={faPlus} className="text-sm py-1 w-4 h-4" />}
                        className="mr-1 my-2 text-sm px-2 py-1 font-medium rounded flex justify-center items-center cursor-pointer"
                    />
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
                    <Button
                        className={`${messages && messages.length == 0 && "hidden"} text-green-400 text-sm ml-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border`} 
                        onClick={() => { }}
                        text="Start"
                    />
                </div>
                </div>
                {messages.map((message, messageIndex) => (
                    <>
                        {message.role == "assistant" && 
                            (message.tasks.length == 0 && (
                                <div className="flex flex-col leading-normal mb-0.5" key={messageIndex}>
                                <div className="flex items-top mb-0.5 mt-1 ml-2 font-bold text-violet-300">
                                    <FontAwesomeIcon icon={faRobot} className="text-sm mt-0.5 mr-1" />
                                    <span className="text-sm ml-0">"{removeQuotes(message.content)}"</span>
                                </div>
                                </div>
                            ))
                        }
                        {message.role == "assistant" && (
                            message.tasks.filter(t => t.type == "CreateEndpoint").map((task, taskIndex) => (
                                <div className="flex flex-col leading-normal mb-0.5" key={messageIndex}>
                                    <div className="flex flex-col justify-center items-center">
                                    <Task 
                                        key={taskIndex + "-task"}
                                        task={task} 
                                        removeTask={() => { removeTaskFromMessage(messageIndex, taskIndex) }} 
                                        editTask={(newTask: any) => { editTaskInMessage(messageIndex, taskIndex, newTask) }} 
                                        allTasks={messages.map((message) => message.tasks).flat()}
                                        setPath={setPath}
                                    />
                                    </div>
                                </div>
                            ))
                        )}
                    </> 
                ))}
            </div>   


            <div className="w-1/2 h-full flex flex-col">
                <div className="ml-1 mt-0.5 mb-2 flex align-bottom justify-between w-full">
                    <div>
                        <div className="flex"> 
                            <Button
                                onClick={() => {}}
                                children={<FontAwesomeIcon icon={faPlus} className="text-sm py-1 w-4 h-4" />}
                                className="mr-1 my-2 text-sm px-2 py-1 font-medium rounded flex justify-center items-center cursor-pointer"
                            />
                            <div className="w-full grow">
                                <div className="flex">
                                    <img src="/world.svg" className="w-4 h-4 my-auto mr-1.5" />
                                    <div className="text-base font-bold mb-0">Frontend</div>
                                </div>
                                <div className="mt-0.5 flex">
                                    Code that runs in the browser and generates UI
                                </div>
                            </div>
                            <Button
                                className={`${messages && messages.length == 0 && "hidden"} text-green-400 text-sm ml-auto mr-0 px-5 py-2 h-10 my-auto font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border`} 
                                onClick={() => { }}
                                text="Start"
                            />
                        </div>
                    </div>
                    {/* <Button
                        onClick={() => { setPath("appCode") }}
                        text="+"
                        className="mr-1.5 text-sm px-3 my-2 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                    /> */}
                </div>
                {messages.map((message, messageIndex) => (
                    <>
                        {message.role == "assistant" && 
                            (message.tasks.length == 0 && (
                                <div className="flex flex-col leading-normal mb-0.5" key={messageIndex}>
                                <div className="flex items-top mb-0.5 mt-1 ml-2 font-bold text-violet-300">
                                    <FontAwesomeIcon icon={faRobot} className="text-sm mt-0.5 mr-1" />
                                    <span className="text-sm ml-0">"{removeQuotes(message.content)}"</span>
                                </div>
                                </div>
                            ))
                        }
                        {message.role == "assistant" && (
                            message.tasks.filter(t => t.type == "CreatePage").map((task, taskIndex) => (
                                <div className="flex flex-col leading-normal mb-0.5" key={messageIndex}>
                                    <div className="flex flex-col justify-center items-center">
                                    <Task 
                                        key={taskIndex + "-task"}
                                        task={task} 
                                        removeTask={() => { removeTaskFromMessage(messageIndex, taskIndex) }} 
                                        editTask={(newTask: any) => { editTaskInMessage(messageIndex, taskIndex, newTask) }} 
                                        allTasks={messages.map((message) => message.tasks).flat()}
                                        setPath={setPath}
                                    />
                                    </div>
                                </div>
                            ))
                        )}
                    </> 
                ))}
            </div>     
        </div>
    )
}