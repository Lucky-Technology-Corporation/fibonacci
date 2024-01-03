import { faClock, faCloud } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { methodToColor } from "../../Utilities/Method";

export default function TaskCommandHeader(){
  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [updateValue, setUpdateValue] = useState<string>("")
  const { executeTask, promptAiEditor } = useEndpointApi()

  const {taskQueue, fullTaskQueue, fileErrors, setFileErrors, setPostMessage, setTaskQueue} = useContext(SwizzleContext)

  const [ promptQuery, setPromptQuery ] = useState<string>("");
  const [isWaitingForErrors, setIsWaitingForErrors] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  if(taskQueue[0] == null){
    return (<></>)
  }

  const runEdit = async (promptQuery: string) => {
      //find file errors if they exist
      setPromptQuery(promptQuery)
      setFileErrors("")
      setIsWaitingForErrors(true)
      setPostMessage({
        type: "getFileErrors"
      })
      toast("Scanning for build errors...")
  };

  useEffect(() => {
    if(!isWaitingForErrors) return
    setIsWaitingForErrors(false)
    runQueryFromState()
  }, [fileErrors])

  const runQueryFromState = () => {
    setIsThinking(true)
    toast.promise(promptAiEditor(promptQuery, "edit", undefined, undefined, undefined, fileErrors), {
      loading: "Thinking...",
      success: (data) => {
        //Replace the text
        setPostMessage({
          type: "replaceText",
          content: data.new_code,
        })

        setTimeout(() => {
          setPostMessage({
            type: "saveFile"
          })
        }, 100)
        setIsThinking(false)
        setIsEditing(false)
        return "Done";
      },
      error: () => {
        setIsThinking(false)
        setIsEditing(false)
        return "Failed"
      },
    });
  }

  return (
    <div className="flex w-full py-2 justify-between no-focus-ring">
      {isEditing ? (
        <input
          className="ml-4 flex-1 p-2 my-1 bg-[#85869822] rounded"
          value={updateValue}
          onChange={(e) => {
            setUpdateValue(e.target.value)
          }}
          onKeyDown={(e) => {
            if(e.key == "Enter"){
              runEdit(updateValue)
            }
          }}
          placeholder="What do you need changed?"
        />
      ) : (
      <div className="flex flex-col justify-leading ml-5 pt-2">
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
      <div className={`align-middle flex ${isThinking && "opacity-50 pointer-events-none"}`}>
        <div className={`py-2 ml-2 my-auto ${isEditing && "hidden"}`}>
          {fullTaskQueue.length - taskQueue.length + 1} of {fullTaskQueue.length} tasks
        </div>
        <Button
          className={`text-sm ml-4 px-5 py-2 ml-2 my-auto font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border`} 
          onClick={() => {
            setIsEditing(!isEditing)
          }}
          text={isEditing ? "Cancel" : "Edit"}
        />
        <Button
          className={`text-green-400 text-sm ml-4 my-auto mr-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border`} 
          onClick={() => {
            if(isEditing){
              runEdit(updateValue)
            } else{
              if(taskQueue[1] == undefined){ setTaskQueue([]); return; }
              executeTask(taskQueue[1], fullTaskQueue)
            }
          }}
          text={isEditing ? "Revise" : "Approve"}
        />
      </div>
    </div>
  )

}