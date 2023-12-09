import { useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../../API/EndpointAPI";
import Button from "../../../Utilities/Button";
import MessageList from "./MessageList";

export default function AssistantPage() {
  const [aiPrompt, setAiPrompt] = useState<string>("")
  const { promptAiPlanner } = useEndpointApi()
  const [messages, setMessages] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  
  const runAiPlanner = async () => {
    console.log("Submitting " + aiPrompt)
    const messageSaved = messages
    
    setMessages([{role: "user", content: aiPrompt}, ...messageSaved])
    var rawResponse = await promptAiPlanner(aiPrompt, history)
    setMessages([{role: "assistant", tasks: rawResponse.tasks}, {role: "user", content: aiPrompt}, ...messageSaved])

    console.log("adding to history", ...rawResponse.openai_message)
    setHistory([...history, {role: "user", content: aiPrompt}, ...rawResponse.openai_message])
  }
  
  return (
    <div className="w-full h-[100vh] overflow-none">
      <div className="flex mx-4 mb-4">
        <input
          className="grow mx-2 ml-0 mr-0 bg-[#252629] border-[#525363] border rounded font-sans text-sm font-normal outline-0 focus:bg-[#28273c] focus:border-[#4e52aa] p-2"
          placeholder="What do you want to make?"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
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
          <MessageList 
            messages={messages}
            setMessages={setMessages} 
          />
        )}
      </div>
    </div>
  );
}
