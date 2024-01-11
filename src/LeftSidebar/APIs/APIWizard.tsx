import cronstrue from 'cronstrue';
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import useFilesystemApi from "../../API/FilesystemAPI";
import Checkbox from "../../Utilities/Checkbox";
import Dropdown from "../../Utilities/Dropdown";
import { endpointToFilename } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function APIWizard({
  isVisible,
  setIsVisible,
  setEndpoints,
  setFullEndpoints,
  endpoints,
  endpointPathIfEditing = "",
  currentFileProperties,
  isCron = false,
  fullScheduledFunctions
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  setEndpoints: React.Dispatch<React.SetStateAction<any[]>>;
  setFullEndpoints: React.Dispatch<React.SetStateAction<any[]>>;
  endpoints: any[];
  endpointPathIfEditing?: string
  currentFileProperties?: any
  isCron: boolean;
  fullScheduledFunctions?: any[]
}) {
  const endpointApi = useEndpointApi();
  const filesystemApi = useFilesystemApi()
  const [inputValue, setInputValue] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("get");
  const [validUrl, setValidUrl] = useState<boolean>(true)
  const { shouldRefreshList, setShouldRefreshList, setPostMessage } = useContext(SwizzleContext);
  const [authRequired, setAuthRequired] = useState<boolean>(false);

  const [cronExpression, setCronExpression] = useState<string>("")
  const [cronIdIfEditing, setCronIdIfEditing] = useState<string>("")

  const methods: any = [
    { id: "get", name: "GET" },
    { id: "post", name: "POST" },
    { id: "put", name: "PUT" },
    { id: "delete", name: "DELETE" },
  ];

  const createHandler = async () => {
    const newEndpointPath = cleanInputValue(selectedMethod, inputValue);
    if (newEndpointPath == undefined) {
      return;
    }
    if(!checkForConflicts(newEndpointPath)){
      return
    }

    var methodToUse = selectedMethod
    if(isCron){
      methodToUse = "get"
    }

    //If we're editing an existing endpoint, copy the contents over to a new file
    var contentsToCopy = ""
    if(endpointPathIfEditing != ""){
      setPostMessage({
        type: "saveFile"
      });

      const fileNameOnServer = "backend/user-dependencies/" + endpointToFilename(endpointPathIfEditing)
      contentsToCopy = await endpointApi.getFile(fileNameOnServer)

      const methodToDelete = endpointPathIfEditing.split("/")[0].toUpperCase()
      const pathToDelete = endpointPathIfEditing.split("/").slice(1).join("/")
      const fileName = endpointToFilename(endpointPathIfEditing)

      setPostMessage({
        type: "removeFile",
        fileName: "/backend/user-dependencies/" + fileName,
      });

      await filesystemApi.deleteEndpoint(methodToDelete, pathToDelete)

      if(authRequired){
        contentsToCopy = contentsToCopy.replace(/optionalAuthentication/g, "requiredAuthentication")
      } else{
        contentsToCopy = contentsToCopy.replace(/requiredAuthentication/g, "optionalAuthentication")
      }
      //Note this only works with single quotes right now
      contentsToCopy = contentsToCopy.replace(`router.${methodToDelete.toLowerCase()}('/${pathToDelete}'`, `router.${methodToUse.toLowerCase()}('/${newEndpointPath}'`)
    }

    //Make the new file
    await filesystemApi.createNewEndpoint(newEndpointPath, methodToUse, authRequired, contentsToCopy)

    if(isCron){
      if(endpointPathIfEditing != ""){
        await endpointApi.updateScheduledFunction(cronIdIfEditing, newEndpointPath, cronExpression)
      } else{
        await endpointApi.scheduleFunction(newEndpointPath, cronExpression)
      }
    }

    setPostMessage({
      type: "openFile",
      fileName: "/backend/user-dependencies/" + endpointToFilename(methodToUse + "/" + newEndpointPath),
    })

    setShouldRefreshList(!shouldRefreshList);
    setIsVisible(false);
  }

  const checkForConflicts = (inputValue: string) => {
    if (endpoints.includes(inputValue)) {
      toast.error("That endpoint already exists");
      return false
    }
    return true
  }

  function cronToEnglish(cron) {
    try {
        return cronstrue.toString(cron);
    } catch (e) {
        return 'Invalid cron expression';
    }
  }

  const cleanInputValue = (methodToUse: string, inputValue: string) => { 
    var cleanInputValue = inputValue;
    if (inputValue == "") {
      throw "Please fill out all fields";
    }
    
    if(cleanInputValue.endsWith("/")){
      cleanInputValue = cleanInputValue.substring(0, cleanInputValue.length - 1)
    }

    if(!cleanInputValue.startsWith("/")){
      cleanInputValue = "/" + cleanInputValue
    }

    if(!isCron && cleanInputValue.startsWith("/cron")){
      toast.error("/cron is reserved for scheduled jobs")
      return
    }

    if(cleanInputValue.endsWith("/d") || cleanInputValue.includes("/d/")){
      toast.error("/d cannot be used in endpoints")
      return
    }

    const regex = /^(\/|(\/((:[a-zA-Z][a-zA-Z0-9_]*)|([a-zA-Z0-9-_]+)))+)$/
    if(!regex.test(cleanInputValue)){
      toast.error("Invalid path.")
      return
    }

    if (cleanInputValue.endsWith(".ts")) {
      cleanInputValue = cleanInputValue.slice(0, -3);
    }

    if(cleanInputValue.startsWith("/")){
      cleanInputValue = cleanInputValue.substring(1)
    }
  
    if(isCron){
      cleanInputValue = "cron/" + cleanInputValue
    }

    return cleanInputValue.replace(/\/+$/, "");
  }

  //HACK not the best way of doing this... but it works since the wizard can only be triggered when the file is open
  useEffect(() => {
    setAuthRequired(currentFileProperties.hasPassportAuth)
  }, [currentFileProperties])

  useEffect(() => {
    if (isVisible) {
      if(endpointPathIfEditing){
        setSelectedMethod(endpointPathIfEditing.split("/")[0])
        var endpointPath = "/" + endpointPathIfEditing.split("/").slice(1).join("/")
        if(isCron){ 
          //clean up the path
          endpointPath = endpointPath.replace("/cron/", "") 
          //set the existing cron expression
          const cronFunction = fullScheduledFunctions.find((func) => {
            return func.path.split("cron/")[1] == endpointPath
          })
          if(cronFunction){
            setCronExpression(cronFunction.cron)
            setCronIdIfEditing(cronFunction.id)
          }
        }
        setInputValue(endpointPath)
      } else{
        setInputValue("");
        setAuthRequired(false);
      }
    } else{
      setInputValue("");
      setAuthRequired(false);
    }
  }, [isVisible]);

  return (
    <div
      className={`fixed z-50 inset-0 overflow-y-auto ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ transition: "opacity 0.2s" }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#181922] border-[#525363] border w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="bg-[#181922] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <>
                <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                {endpointPathIfEditing == "" ? "New" : "Edit"} {isCron ? "job" : "endpoint"}
                </h3>
                {isCron ? (
                  <>
                  <div className="w-full h-4"></div>
                  {/* cron input */}
                  <div className="text-sm text-gray-400 mb-0.5">Cron expression</div>
                  <input 
                    type="text"
                    value={cronExpression}
                    onChange={(e) => {
                      setCronExpression(e.target.value)
                    }}
                    className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                    placeholder="0 0 * * *"
                  />
                  <div className="text-sm text-gray-300 mb-1 mt-1.5">{cronToEnglish(cronExpression)}</div>
                  </>
                ) : (
                  <div className="mt-2"><Checkbox
                    id="requireAuth"
                    label="Require Authentication"
                    isChecked={authRequired}
                    setIsChecked={setAuthRequired}
                  /></div>
                )}

                {isCron && (
                    <div className="text-sm text-gray-400 mb-[-10px] mt-2">Job name</div>
                )}

                <div className="mt-3 mb-2 flex">
                  {!isCron && (
                    <Dropdown
                      className="mr-2 fixed"
                      onSelect={(item: any) => {
                        setSelectedMethod(item);
                      }}
                      children={methods}
                      direction="center"
                      title={selectedMethod.toUpperCase()}
                    />
                  )}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      if(endpointPathIfEditing == "/"){ return }
                      var regex = /^(\/|(((:[a-zA-Z][a-zA-Z0-9_]*)|([a-zA-Z0-9-_]+)))?(\/((:[a-zA-Z][a-zA-Z0-9_]*)|([a-zA-Z0-9-_]+)))*)$/
                      if(isCron){
                        regex = /^[a-zA-Z0-9]+$/
                      }
                      if(!regex.test(e.target.value)){
                        setValidUrl(false)
                      } else{
                        setValidUrl(true)
                      }
                      setInputValue(e.target.value);
                    }}
                    disabled={endpointPathIfEditing == "/"}
                    className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                    placeholder={isCron ? "jobName" : "/path/:variable"}
                    onKeyDown={(event: any) => {
                      if (event.key == "Enter") {
                        toast.promise(createHandler(), {
                          "loading": "Loading...",
                          "success": "Done",
                          "error": "An error occured"
                        })
                      }
                    }}
                  />
                </div>
                <div className="bg-[#181922] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                  <div className="bg-[#181922] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        toast.promise(createHandler(), {
                          "loading": "Loading...",
                          "success": "Done",
                          "error": (err) => {
                            return err || "An error occured"
                          }
                        })
                      }}
                      className={`${validUrl ? "" : "opacity-70"} w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm`}
                      disabled={!validUrl}
                    >
                      {validUrl ? "Next" : "Invalid input"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVisible(false);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#181922] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
