import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../../API/EndpointAPI";
import Button from "../../../Utilities/Button";
import { SwizzleContext } from "../../../Utilities/GlobalContext";
import { Page } from "../../../Utilities/Page";
import MessageList from "./MessageList";
import SchemaViewer from "./SchemaViewer";

export default function AssistantPage() {
  const [aiPrompt, setAiPrompt] = useState<string>("")
  const { promptAiPlanner, getSchema, setSchema, promptSchemaPlanner, executeTask } = useEndpointApi()
  const [messages, setMessages] = useState<any[]>([])
  const {activeProject, setTaskQueue, setSelectedTab, setFullTaskQueue, ideReady } = useContext(SwizzleContext)
  const [schema, setSchemaLocal] = useState<any>({})
  const [needsAuth, setNeedsAuth] = useState<boolean>(true)
  const schemaRef = useRef(null)

  const filterUniqueTasks = (tasks) => {
    return tasks.filter((v, i, a) => 
      a.findIndex(t => (
        t.type === v.type && 
        t.inputs.path === v.inputs.path && 
        (t.type === "CreateEndpoint" ? t.inputs.method === v.inputs.method : true)
      )) === i
    );
  };

  
  const beginCodeGeneration = async () => {
    if(needsAuth){
      //TODO: show user auth modal then move forward
    }

    var endpointsToBuild = messages.filter(message => message.role == "assistant").map(message => message.tasks).flat().filter(task => task.type == "CreateEndpoint")
    endpointsToBuild = endpointsToBuild.filter((v, i, a) => a.findIndex(t => (t.inputs.path === v.inputs.path && t.inputs.method === v.inputs.method)) === i)

    var pagesToBuild = messages.filter(message => message.role == "assistant").map(message => message.tasks).flat().filter(task => task.type == "CreatePage")
    pagesToBuild = pagesToBuild.filter((v, i, a) => a.findIndex(t => (t.inputs.path === v.inputs.path)) === i)

    if(endpointsToBuild.length == 0 && pagesToBuild.length == 0){
      toast.error("No new endpoints or pages to build")
      return
    }

    const newTaskQueue = [...endpointsToBuild, ...pagesToBuild]
    //run first task
    const firstTask = newTaskQueue[0]
    await executeTask(firstTask, newTaskQueue)

    setTaskQueue(newTaskQueue)
    setFullTaskQueue(newTaskQueue)

    if(endpointsToBuild.length > 0){
      setSelectedTab(Page.Apis)
    } else{
      setSelectedTab(Page.Hosting)
    }
  }

  const runAiPlanner = async () => {
    const messageSaved = messages
    setMessages([{role: "user", content: aiPrompt}, ...messageSaved])
    var rawResponse = await promptAiPlanner(aiPrompt, messages.reverse())

    if(rawResponse.tasks.length == 0){
      console.log("no new tasks, return early")
      setMessages([{role: "assistant", content: rawResponse.gpt_response, tasks: []}, {role: "user", content: aiPrompt}, ...messageSaved])
      toast.promise(callUpdateSchema([{role: "assistant", content: rawResponse.gpt_response, tasks: []}, {role: "user", content: aiPrompt}, ...messageSaved]), {
        loading: "Updating schema...",
        success: "Done",
        error: "An error occured",
      })
      return
    }

    if(rawResponse.needs_auth != undefined){
      setNeedsAuth(rawResponse.needs_auth)
    }

    var audio = new Audio("/newendpoint.mp3");
    audio.play();    

    const sortByFeatureGroup = (a, b) => a.feature_group.localeCompare(b.feature_group);
    console.log("rawResponse", rawResponse)
    const sortedEndpoints = rawResponse.tasks.filter(task => task.type == "CreateEndpoint").sort(sortByFeatureGroup)
    const sortedPages = rawResponse.tasks.filter(task => task.type == "CreatePage").sort(sortByFeatureGroup)
    var newTasks = [...sortedEndpoints, ...sortedPages]
    newTasks = filterUniqueTasks(newTasks); 

    //deal with overwriting tasks in previous messages
    var uniqueMessages = []
    for(var i = 0; i < messageSaved.length; i++){
      if(messageSaved[i].role == "assistant"){ //for each old assistant message
        const tasks = messageSaved[i].tasks
        console.log("tasks", tasks)
        for(var j = 0; j < tasks.length; j++){ //for each task in the old assistant message
          console.log("task", tasks[j])
          if(tasks[j].type == "CreateEndpoint"){
            console.log("checking for", tasks[j].inputs.path, tasks[j].inputs.method)
            const newTaskWithSamePathAndMethod = sortedEndpoints.filter(task => task.inputs.path == tasks[j].inputs.path && task.inputs.method == tasks[j].inputs.method)
            console.log("sortedEndpoints", sortedEndpoints)
            console.log("array of the same tasks", newTaskWithSamePathAndMethod)
            if(newTaskWithSamePathAndMethod.length == 0){
              //there is no new task with the same path and method, so we can keep the old one
              uniqueMessages.push(messageSaved[i])
            }
          } else if(tasks[j].type == "CreatePage"){
            console.log("checking for page", tasks[j].inputs.path)
            const newTaskWithSamePath = sortedPages.filter(task => task.inputs.path == tasks[j].inputs.path)
            console.log("array of the same tasks", newTaskWithSamePath)
            if(newTaskWithSamePath.length == 0){
              //there is no new task with the same path and method, so we can keep the old one
              uniqueMessages.push(messageSaved[i])
            }
          }
        }
      }
    }
    console.log("old messages", messageSaved)
    console.log("filtered old messages", uniqueMessages)
    console.log("new tasks", newTasks)

    setMessages([{role: "assistant", tasks: newTasks}, {role: "user", content: aiPrompt}, ...uniqueMessages])
    // setHistory([...history, {role: "user", content: aiPrompt}, {role: "assistant", content: JSON.stringify(rawResponse.openai_message)}])

    toast.promise(callUpdateSchema([{role: "assistant", tasks: newTasks}, {role: "user", content: aiPrompt}, ...uniqueMessages]), {
      loading: "Updating schema...",
      success: "Done",
      error: "An error occured",
    })

  }

  const callUpdateSchema = async (messages) => {
    var backendTasks = []
    var userPrompts = []
    for(var i = 0; i < messages.length; i++){
      if(messages[i].role == "assistant"){
        for(var j = 0; j < messages[i].tasks.length; j++){
          if(messages[i].tasks[j].type == "CreateEndpoint"){
            backendTasks.push(messages[i].tasks[j])
          }
        }
      } else if(messages[i].role == "user"){
        userPrompts.push(messages[i].content)
      }
    }

    if(backendTasks.length == 0){ return }
    var rawResponse = await promptSchemaPlanner(userPrompts, backendTasks)
    if(rawResponse.schema){
      setSchemaLocal(rawResponse.schema)
    }
  }

  useEffect(() => {
    async function fetchSchema(){
      var rawResponse = await getSchema()
      setSchemaLocal(rawResponse.schema)
    }

    if(activeProject != ""){
      var messages = localStorage.getItem("messages_"+activeProject)
      if(messages != null){
        setMessages(JSON.parse(messages))
      }
      
      fetchSchema()
    }
  }, [activeProject])

  useEffect(() => {
    if(messages != null){
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

    //TODO: not working
    // const scroll = schemaRef.current;
    // if (scroll) {
    //   scroll.scrollTop = scroll.scrollHeight;
    // }
  }

  return (
    <div className="w-full h-full">
      <div className="flex mx-4 mr-2 mb-4">
      <Button
          className={`${messages && messages.length == 0 && "hidden"} text-red-400 text-sm mr-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-red-400 border-opacity-70 border`} 
          onClick={() => {
            setAiPrompt("")
            setMessages([])
            setSchemaLocal({})
            toast.promise(setSchema({}), { loading: "Clearing...", success: "Done", error: "An error occured" })
          }}
          children={<FontAwesomeIcon icon={faXmark} className="text-sm py-1 w-4 h-4" />}
          // text="Clear"
        />
        <input
          className="grow mx-2 ml-0 mr-0 bg-[#252629] border-[#525363] border rounded font-sans text-sm font-normal outline-0 focus:bg-[#28273c] focus:border-[#4e52aa] p-2"
          placeholder={messages && messages.length == 0 ? "What do you want to make?" : "What do you want to add?"}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              toast.promise(runAiPlanner(), {
                loading: "Thinking...",
                success: () => {
                  setAiPrompt("")
                  return "Done"
                },
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
          text={messages && messages.length == 0  ? "Create" : "Update"}
        />
       
        <Button
          className={`${messages && messages.length == 0 && "hidden"} text-green-400 text-sm ml-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-green-400 border-opacity-70 border`} 
          onClick={() => {
            if(!ideReady){ toast.error("Please wait for the IDE to load"); return }
            beginCodeGeneration()
          }}
          text="Build"
        />
      </div>
      <div className="flex flex-col align-center justify-center overflow-scroll">
        {messages == null || messages.length == 0 ? (
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
          <>
          <div className="w-full flex flex-col px-4 mt-6 overflow-x-hidden">
              <div className="ml-1 mt-0.5 flex justify-between">
                <div className="flex"> 
                  <Button
                    onClick={addNewSchemaCollection}
                    children={<FontAwesomeIcon icon={faPlus} className="text-sm py-1 w-4 h-4" />}
                    className="ml-0 pl-0 mr-1 my-2 text-sm px-2 py-1 font-medium rounded flex justify-center items-center cursor-pointer"
                  />
                  <div>
                    <div className="flex">
                        <img src="/database.svg" className="w-4 h-4 my-auto mr-1.5" />
                        <div className="text-base font-bold mb-0">Schema</div>
                    </div>
                    <div className="mt-0.5">This is your database structure</div>
                  </div>
                </div>
                
              </div>
            </div>
            <SchemaViewer schema={schema} setSchema={setSchemaLocal} commitSchema={schemaEditHandler} schemaRef={schemaRef} />
            </>
          </>
        )}
      </div>
    </div>
  );
}
