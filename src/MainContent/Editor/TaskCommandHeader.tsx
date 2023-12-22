import { faClock, faCloud } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { methodToColor } from "../../Utilities/Method";

export default function TaskCommandHeader(){
  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [updateValue, setUpdateValue] = useState<string>("")
  const { aiTaskExecute } = useEndpointApi()

  const {taskQueue, fullTaskQueue, setTaskQueue} = useContext(SwizzleContext)

  const executeTask = () => {
    setIsExecuting(true)
    toast.promise(aiTaskExecute(taskQueue[0], fullTaskQueue.filter(v => v != null)), {
        loading: "Thinking...",
        success: (response: any) => {
            if(response.status == "TASK_WAITING_FOR_APPROVAL"){
                //ai is asking for approval on response.task.code
            } else if(response.status == "TASK_SUCCEEDED"){
                //ai wrote the file
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

  if(taskQueue[0] == null){
    return (<></>)
  }
  console.log(taskQueue[0])
  return (
    <div className="flex w-full py-2 justify-between no-focus-ring">
      {isEditing ? (
        <input
          className="ml-4 flex-1 p-2 my-1 bg-[#85869822] rounded"
          value={updateValue}
          onChange={(e) => {
            setUpdateValue(e.target.value)
          }}
          placeholder="What do you need changed?"
        />
      ) : (
      <div className="flex flex-col justify-leading ml-5 pt-2">
        <div>
          {fullTaskQueue.length - taskQueue.length} of {fullTaskQueue.length} tasks
        </div>
       <div className="mb-0.5">
          {taskQueue[0].type == "CreatePage" ? (
            <div className="flex align-middle pr-2 font-normal font-mono">
              <img src="/world.svg" className="inline-block w-3 h-3 mr-2 my-auto ml-0 opacity-100" />
              {taskQueue[0].inputs.path}
            </div>
          ) : (taskQueue[0].type == "CreateEndpoint" ? (
            <div className="flex align-middle pr-2 font-normal font-mono">
              <FontAwesomeIcon icon={faCloud} className="w-3 h-3 my-auto mr-2" />
              {taskQueue[0].inputs.path.startsWith("/cron") ? (
                <FontAwesomeIcon icon={faClock} className="w-3 h-3 my-auto mr-2" />
              ) : (
                <span className={`${methodToColor(taskQueue[0].inputs.method)} font-semibold mr-1 `}>{taskQueue[0].inputs.method}</span> 
              )}
              {taskQueue[0].inputs.path.startsWith("/cron/") ? taskQueue[0].inputs.path.replace("/cron/", "") : taskQueue[0].inputs.path}
            </div>
          ) : (<></>))}
        </div>
        <div>
          {taskQueue[0].summary}
        </div>
      </div> 
      )}
      <div className="align-middle flex">
        <Button
          className="text-sm ml-4 px-5 py-2 ml-2 my-auto font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border" 
          onClick={() => {
            setIsEditing(!isEditing)
          }}
          text={isEditing ? "Cancel" : "Edit"}
        />
        <Button
          className={`text-green-400 text-sm ml-4 my-auto mr-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border`} 
          onClick={() => {
            //DO IT
          }}
          text={isEditing ? "Revise" : "Approve"}
        />
      </div>
    </div>
  )

}