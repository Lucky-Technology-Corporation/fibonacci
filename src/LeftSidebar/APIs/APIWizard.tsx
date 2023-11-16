import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useFilesystemApi from "../../API/FilesystemAPI";
import { endpointSort } from "../../Utilities/ActiveEndpointHelper";
import Dropdown from "../../Utilities/Dropdown";
import { endpointToFilename } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function APIWizard({
  isVisible,
  setIsVisible,
  setEndpoints,
  setFullEndpoints,
  endpoints
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  setEndpoints: React.Dispatch<React.SetStateAction<any[]>>;
  setFullEndpoints: React.Dispatch<React.SetStateAction<any[]>>;
  endpoints: any[];
}) {
  const filesystemApi = useFilesystemApi()
  const [inputValue, setInputValue] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("get");
  const [validUrl, setValidUrl] = useState<boolean>(true)
  const { setPostMessage, setActiveEndpoint } = useContext(SwizzleContext);

  const methods: any = [
    { id: "get", name: "GET" },
    { id: "post", name: "POST" },
    { id: "schedule", name: "Scheduled Job" }
  ];

  const createHandler = async () => {
    var cleanInputValue = inputValue;
    if (inputValue == "") {
      toast.error("Please enter a value");
      return;
    }
    
    //Remove trailing /
    if(cleanInputValue.endsWith("/")){
      cleanInputValue = cleanInputValue.substring(0, cleanInputValue.length - 1)
    }

    if(!cleanInputValue.startsWith("/")){
      cleanInputValue = "/" + cleanInputValue
    }

    if(cleanInputValue.startsWith("/cron")){
      toast.error("/cron is reserved for scheduled jobs")
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

    var methodToUse = selectedMethod
    if(selectedMethod == "schedule"){
      methodToUse = "get"
      cleanInputValue = "cron/" + cleanInputValue
    }
  
    const newEndpointName = methodToUse + "/" + cleanInputValue.replace(/\/+$/, "");
    const fileName = endpointToFilename(newEndpointName);

    if(endpoints.includes(newEndpointName)){
      toast.error("That endpoint already exists")
      return
    }

    await filesystemApi.createNewFile("/backend/user-dependencies/" + fileName, newEndpointName)

    setFullEndpoints((endpoints: any[]) => {
      if (!endpoints.includes(newEndpointName)) {
        return [...endpoints, newEndpointName].sort(endpointSort);
      }
      return endpoints;
    });

    setEndpoints((endpoints: any[]) => {
      if (!endpoints.includes(newEndpointName)) {
        return [...endpoints, newEndpointName].sort(endpointSort);
      }
      return endpoints;
    });

    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      setInputValue("");
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
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#181922] border-[#525363] border w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="bg-[#181922] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <>
                <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                  New API
                </h3>
                <div className="mt-1">
                  <p className="text-sm text-[#D9D9D9]">Name your endpoint</p>
                </div>
                <div className="mt-3 mb-2 flex">
                  <Dropdown
                    className="mr-2 fixed"
                    onSelect={(item: any) => {
                      setSelectedMethod(item);
                    }}
                    children={methods}
                    direction="left"
                    title={selectedMethod.toUpperCase()}
                  />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      const regex = /^\/?([a-zA-Z0-9-_]+(\/(:?[a-zA-Z0-9-_]+)*)*)$/
                      if(!regex.test(e.target.value)){
                        setValidUrl(false)
                      } else{
                        setValidUrl(true)
                      }
                      setInputValue(e.target.value);
                    }}
                    className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                    placeholder={selectedMethod == "schedule" ? "jobName" : "/path/:variable"}
                    onKeyDown={(event: any) => {
                      if (event.key == "Enter") {
                        createHandler();
                      }
                    }}
                  />
                </div>
                <div className="bg-[#181922] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                  <div className="bg-[#181922] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        createHandler();
                      }}
                      className={`${validUrl ? "" : "opacity-70"} w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm`}
                      disabled={!validUrl}
                    >
                      {validUrl ? "Next" : "Invalid URL"}
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
