import { ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Checkbox from "../../Utilities/Checkbox";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function APIWizard({
  isVisible,
  setIsVisible,
  files,
  fileType
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  files: string[];
  fileType: string
}) {
  const [inputValue, setInputValue] = useState("");
  const [fallbackInputValue, setFallbackInputValue] = useState("");

  const [authRequired, setAuthRequired] = useState(false);
  const { setPostMessage, shouldRefreshList, setShouldRefreshList } = useContext(SwizzleContext);

  const [overrideRender, setOverrideRender] = useState<ReactNode | null>(null);

  const createHandler = () => {
    if (inputValue == "") {
      toast.error("Please enter a filename");
      return;
    }
    console.log("start createHandler", newFileName)

    if(inputValue == "/"){
      toast.error("Your homepage already exists")
      return
    }

    var newFileName = inputValue;
    if (!newFileName.endsWith(".js") || !newFileName.endsWith(".jsx")) {
      newFileName = newFileName + ".js";
    }

    if(newFileName.startsWith("/")){
      newFileName = newFileName.substring(1)
    }

    console.log("newFileName", newFileName)

    if(fileType == "page" && convertPath(newFileName.replace(".js", "")) == "Home.js"){
      toast.error("The name Home is reserved for the homepage")
      return
    }

    const testPath = fileType == "page" ? "pages/" + convertPath(newFileName.replace(".js", "")) : "components/" + convertPath(newFileName.replace(".js", ""))
    if(files.includes(testPath)){
      toast.error("That endpoint already exists")
      return
    }

    if(fileType == "page"){
      if(newFileName.endsWith(".js")){
        newFileName = newFileName.substring(0, newFileName.length - 3)
      }
      if(newFileName.startsWith("/")){
        if(newFileName == "/"){
          newFileName = "Home"
        } else{
          newFileName = newFileName.substring(1)
        }
      }
      
      const routePath = "/" + newFileName
      var parsedFileName = convertPath(newFileName);
      var unauthenticatedFallback = null
      if(authRequired){
        unauthenticatedFallback = fallbackInputValue
      }
      setPostMessage({ type: "newFile", fileName: "/frontend/src/pages/" + parsedFileName, routePath: routePath, fallbackPath: unauthenticatedFallback});  
    } else if(fileType == "file"){
      setPostMessage({ type: "newFile", fileName: "/frontend/src/components/" + newFileName});  
    }
    
    setTimeout(() => {
      setShouldRefreshList(!shouldRefreshList);
    }, 250);

    setIsVisible(false);
  };

  const convertPath = (path) => {
    console.log("convertPath", path)
    const segments = path.split('/').filter(Boolean);

    // Capitalize the first letter of each segment and letters after underscores, also handle dashes
    const capitalizedSegments = segments.map(segment => {
      // Convert dashes to camelCase
      const camelCaseSegment = segment.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      
      // Capitalize first letter and letters after underscores
      return camelCaseSegment
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('_');
    });
    
    return capitalizedSegments.join('_') + '.js';  
  }
  

  useEffect(() => {
    if (isVisible) {
      setInputValue("");
      setFallbackInputValue("");
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#32333b] w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="bg-[#32333b] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <>
                <div className="flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    {fileType == "file" ? "New Component" : "New Page"}
                  </h3>
                </div>
                <div className="my-2">
                  {fileType == "file" 
                    ? "Include a path to create the component in a specific folder. If the folder does not exist, it will be created." 
                    : <div className="mt-1"><Checkbox
                        id="requireAuth"
                        label="Require Authentication"
                        isChecked={authRequired}
                        setIsChecked={setAuthRequired}
                      /></div>
                  }
                </div>
                {overrideRender ? (
                  overrideRender
                ) : (
                  <>
                    <div className="mt-1">
                    {fileType == "file" ? "Component Path" : "Page URL (e.g. /about)"}
                    </div>
                    <div className="mt-1 mb-2 flex">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                          const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-_/]/g, "");
                          setInputValue(sanitizedValue.trim());
                        }}
                        className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                        placeholder={`/path/to/name`}
                        onKeyDown={(event: any) => {
                          if (event.key == "Enter") {
                            createHandler();
                          }
                        }}
                      />
                    </div>
                    {authRequired && (
                      <>
                      <div className="mt-1">Unauthenticated fallback path (e.g. /login)</div>
                      <div className="mt-1 mb-2 flex">
                        <input
                          type="text"
                          value={fallbackInputValue}
                          onChange={(e) => {
                            const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-_/]/g, "");
                            setFallbackInputValue(sanitizedValue.trim());
                          }}
                          className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                          placeholder={`/login`}
                          onKeyDown={(event: any) => {
                            if (event.key == "Enter") {
                              createHandler();
                            }
                          }}
                        />
                      </div>
                      </>
                    )}
                    <div className="bg-[#32333b] py-3 pt-0 mt-3 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={() => {
                          createHandler();
                        }}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Next
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOverrideRender(null);
                          setIsVisible(false);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
