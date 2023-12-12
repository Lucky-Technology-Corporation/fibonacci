import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../../API/EndpointAPI";
import Button from "../../../Utilities/Button";
import { SwizzleContext } from "../../../Utilities/GlobalContext";
import MessageList from "./MessageList";

export default function AssistantPage() {
  const [aiPrompt, setAiPrompt] = useState<string>("")
  const { promptAiPlanner } = useEndpointApi()
  const [messages, setMessages] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const {testDomain, activeProject} = useContext(SwizzleContext)
  const [path, setPath] = useState<string>("")
  const [url, setUrl] = useState<string>("")
  const [debouncedPath, setDebouncedPath] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);

  const handlePathChange = (newPath) => {
    clearTimeout(timeoutId); 
    const id = setTimeout(() => {
      setPath(newPath); 
    }, 500); 
    setTimeoutId(id); 
  };

  const runAiPlanner = async () => {
    console.log("Submitting " + aiPrompt)
    const messageSaved = messages
    
    setMessages([{role: "user", content: aiPrompt}, ...messageSaved])
    var rawResponse = await promptAiPlanner(aiPrompt, history)
    if(rawResponse == undefined || rawResponse.tasks == undefined || rawResponse.tasks.length == 0){
      var audio = new Audio("/error.mp3");
      audio.play();      
      toast("No tasks found. Please try again with more detail.")
      return
    }
    var audio = new Audio("/newendpoint.mp3");
    audio.play();    

    setMessages([{role: "assistant", tasks: rawResponse.tasks}, {role: "user", content: aiPrompt}, ...messageSaved])

    console.log("adding to history", ...rawResponse.openai_message)
    setHistory([...history, {role: "user", content: aiPrompt}, ...rawResponse.openai_message])
  }
  
  useEffect(() => {
    if(testDomain != ""){
      setDebouncedPath(path)
      setUrl(testDomain + path)
    }
  }, [path, testDomain])

  useEffect(() => {
    if(activeProject != ""){
      var history = localStorage.getItem("history_"+activeProject)
      if(history != null){
        setHistory(JSON.parse(history))
      }
      var messages = localStorage.getItem("messages_"+activeProject)
      if(messages != null){
        setMessages(JSON.parse(messages))
      }
    }
  }, [activeProject])

  useEffect(() => {
    if(history != null){
      localStorage.setItem("history_"+activeProject, JSON.stringify(history))
    }
  }, [history])

  useEffect(() => {
    if(messages != null){
      localStorage.setItem("messages_"+activeProject, JSON.stringify(messages))
    }
  }, [messages])

  return (
    <div className="w-full h-[100vh] overflow-none">
      <div className="flex mx-4 mb-4">
        <input
          className="grow mx-2 ml-0 mr-0 bg-[#252629] border-[#525363] border rounded font-sans text-sm font-normal outline-0 focus:bg-[#28273c] focus:border-[#4e52aa] p-2"
          placeholder={messages.length == 0 ? "What do you want to make?" : "What do you want to add?"}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onFocus={() => { setAiPrompt("") }}
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              toast.promise(runAiPlanner(), {
                loading: "Thinking...",
                success: "Done",
                error: "An error occured",
              });
            }
          }}
        />
        <Button
          className="text-sm ml-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border" 
          onClick={() => {
            toast.promise(runAiPlanner(), {
              loading: "Thinking...",
              success: "Done",
              error: "An error occured",
            })
          }}
          text={messages.length == 0  ? "Create Plan" : "Update Plan"}
        />
          <Button
            className={`${messages.length == 0 && "hidden"} text-sm ml-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border`} 
            onClick={() => {
              setAiPrompt("")
              setMessages([])
              setHistory([])
            }}
            text="Clear Plan"
          />
      </div>
      <div className="h-full flex align-center justify-center overflow-scroll">
        {messages.length == 0 ? (
          <div>
            <img src="logo_white.png" className="w-20 h-20 mx-auto mt-28 pulsate" />
            <div className="w-full mt-4 text-center opacity-70">Waiting for instructions</div>
          </div>
        ) : (
          <>
          <MessageList 
            messages={messages}
            setMessages={setMessages} 
            setPath={setPath}
          />
          <div className="w-1/2">
            <div className="text-base font-bold mb-1 flex no-focus-ring">
              Preview
              <input 
                type="text" 
                className="w-full bg-[#2D2E33] border-[#525363] border rounded p-0.5 px-1 mr-2 ml-2 font-normal text-sm m-auto" 
                placeholder="/path/to/page" 
                value={debouncedPath}
                onChange={(e) => { setDebouncedPath(e.target.value); handlePathChange(e.target.value); }}
                onKeyDown={(event) => {
                  if(event.key == "Enter"){
                    setPath(debouncedPath)
                  }
                }}
              />
            </div>
             <iframe 
                className="bg-white"
                src={url} 
                title="Preview" 
                width="100%" 
                height="100%" 
                frameBorder="0"
                z-index="1000"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
