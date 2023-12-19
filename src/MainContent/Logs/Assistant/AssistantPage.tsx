import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../../API/EndpointAPI";
import Button from "../../../Utilities/Button";
import { SwizzleContext } from "../../../Utilities/GlobalContext";
import MessageList from "./MessageList";
import SchemaViewer from "./SchemaViewer";

export default function AssistantPage() {
  const [aiPrompt, setAiPrompt] = useState<string>("")
  const { promptAiPlanner, getSchema, setSchema } = useEndpointApi()
  const [messages, setMessages] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const {activeProject} = useContext(SwizzleContext)
  const [schema, setSchemaLocal] = useState<any>({})

  const runAiPlanner = async () => {
    const messageSaved = messages
    
    setMessages([{role: "user", content: aiPrompt}, ...messageSaved])
    var rawResponse = await promptAiPlanner(aiPrompt, history)

    if(rawResponse.schema){
      setSchemaLocal(rawResponse.schema)
    }

    var audio = new Audio("/newendpoint.mp3");
    audio.play();    

    setMessages([{role: "assistant", tasks: rawResponse.tasks}, {role: "user", content: aiPrompt}, ...messageSaved])

    setHistory([...history, {role: "user", content: aiPrompt}, ...rawResponse.openai_message])
  }

  useEffect(() => {
    async function fetchSchema(){
      var rawResponse = await getSchema()
      setSchemaLocal(rawResponse.schema)
    }

    if(activeProject != ""){
      var history = localStorage.getItem("history_"+activeProject)
      if(history != null){
        setHistory(JSON.parse(history))
      }
      var messages = localStorage.getItem("messages_"+activeProject)
      if(messages != null){
        setMessages(JSON.parse(messages))
      }
      
      fetchSchema()
    }
  }, [activeProject])

  useEffect(() => {
    if(history != null && history.length > 0){
      localStorage.setItem("history_"+activeProject, JSON.stringify(history))
    }
  }, [history])

  useEffect(() => {
    if(messages != null && messages.length > 0){
      localStorage.setItem("messages_"+activeProject, JSON.stringify(messages))
    }
  }, [messages])

  const schemaEditHandler = (newSchema: object) => {

    const cleanSchema = Object.keys(newSchema).reduce((acc, key) => {
      if (key.replace(/\s/g, "").length > 0) {
        acc[key] = newSchema[key];
      }
      return acc;
    }, {});
  
    toast.promise(setSchema(cleanSchema), {
      loading: "Saving...",
      success: "Done",
      error: "An error occured",
    })
  }

  const addNewSchemaCollection = () => {
    const newData = { ...schema };
    newData[""] = {}
    setSchemaLocal(newData);
  }

  return (
    <div className="w-full h-full overflow-none">
      <div className="flex mx-4 mr-2 mb-4">
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
          text={messages.length == 0  ? "Create" : "Update"}
        />
        <Button
          className={`${messages.length == 0 && "hidden"} text-red-400 text-sm ml-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-red-400 border-opacity-70 border`} 
          onClick={() => {
            setAiPrompt("")
            setMessages([])
            setHistory([])
            setSchemaLocal({})
            toast.promise(setSchema({}), { loading: "Clearing...", success: "Done", error: "An error occured" })
          }}
          text="Clear"
        />
        <Button
          className={`${messages.length == 0 && "hidden"} text-green-400 text-sm ml-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border`} 
          onClick={() => {
            setAiPrompt("")
            setMessages([])
            setHistory([])
          }}
          text="Start Plan"
        />
      </div>
      <div className="h-screen flex align-center justify-center overflow-none">
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
            setPath={() => {}} //this is the onclick handler
          />
          <div className="w-1/3 mx-2 h-screen flex-col overflow-scroll pb-[68px]">
              <div className="ml-1 mt-0.5 flex justify-between">
                <div>
                  <div className="text-sm font-bold flex">
                    Schema
                  </div>
                  <div className="mt-0.5">This is your database structure</div>
                </div>
                <Button
                  onClick={addNewSchemaCollection}
                  text="+"
                  className="mr-1 my-2 text-sm px-3 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                />
              </div>
              <SchemaViewer schema={schema} setSchema={setSchemaLocal} commitSchema={schemaEditHandler} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
