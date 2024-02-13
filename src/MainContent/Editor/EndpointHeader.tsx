import {
  faArrowLeft,
  faBoltLightning,
  faBug,
  faClock,
  faGear,
  faImage,
  faMicrophone,
  faMicrophoneSlash,
  faPuzzlePiece,
  faUndo,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import Autosuggest from "react-autosuggest";
import toast from "react-hot-toast";
import useDeploymentApi from "../../API/DeploymentAPI";
import useEndpointApi from "../../API/EndpointAPI";
import useFilesystemApi from "../../API/FilesystemAPI";
import useJarvis from "../../API/JarvisAPI";
import { ParsedActiveEndpoint } from "../../Utilities/ActiveEndpointHelper";
import Button from "../../Utilities/Button";
import { copyText } from "../../Utilities/Copyable";
import { endpointToFilename } from "../../Utilities/EndpointParser";
import FloatingModal from "../../Utilities/FloatingModal";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import IconTextButton from "../../Utilities/IconTextButton";
import { Method, methodToColor } from "../../Utilities/Method";
import { Page } from "../../Utilities/Page";
import AIResponseWithChat from "./AIResponseWithChat";
import { docOptions, frontendDocOptions, swizzleActionOptions } from "./HeaderDocOptions";
import TaskCommandHeader from "./TaskCommandHeader";
import GoogleSpeechRecognition from './google-cloud-speech/src/speech-recognition';

export default function EndpointHeader({
  selectedTab,
  currentFileProperties,
  setCurrentFileProperties,
  headerRef,
  activeCollection,
  isDebugging,
  setIsDebugging,
}: {
  selectedTab: Page;
  currentFileProperties: any;
  setCurrentFileProperties: any;
  headerRef: any;
  activeCollection?: string;
  isDebugging: boolean;
  setIsDebugging: any;
}) {
  const {
    taskQueue,
    setFileErrors,
    activeEndpoint,
    activeFile,
    ideReady,
    setPostMessage,
    fullEndpointList,
    selectedText,
    setSelectedText,
    setCurrentDbQuery,
    fileErrors,
    setSwizzleActionDispatch,
    activePage,
    setShouldCreateObject,
    setShouldRefreshList
  } = useContext(SwizzleContext);
  const [method, setMethod] = useState<Method>(Method.GET);
  const [path, setPath] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<ReactNode | undefined>(null);
  const [isUndoVisible, setIsUndoVisible] = useState<boolean>(false);
  const [isWaitingForText, setIsWaitingForText] = useState<boolean>(false);
  const [oldCode, setOldCode] = useState<string>("");
  const [highlighted, setHighlighted] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [autocheckResponse, setAutocheckResponse] = useState<ReactNode | undefined>();
  const [problemButtonText, setProblemButtonText] = useState<string>("Look for problems");
  const [micOn, setMicOn] = useState<boolean>(false);
  const micWasOn = useRef<boolean>(false);

  const { getPackageJson, getFile, promptDbHelper } = useEndpointApi();
  const { updatePackage } = useDeploymentApi();
  const { upsertImport } = useFilesystemApi();
  const { promptAiEditor } = useEndpointApi()
  const { editFrontend, editBackend, createMissingBackendEndpoint, fixProblems, createPageFromImage, createComponentFromImage } = useJarvis();
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  const isLoading = useRef(false);
  
  const runQuery = (promptOverride?: string) => {
    if(selectedTab == Page.Hosting){
      var promptToUse = promptOverride || prompt
      isLoading.current = true
      
      const toastId = toast.loading((t) => (
        <div>
          Thinking...
          <button onClick={() => {
            toast.dismiss(t.id);
            isLoading.current = false; // Stop loading indicator
          }} className="rounded mx-1 p-1 bg-gray-200">
            Cancel
          </button>
        </div>
      ));
    
      editFrontend(promptToUse, path, activeFile, messageHistory)
        .then((data) => {
          toast.dismiss(toastId);
          if(isLoading.current == false){ return }

          //Replace text in editor
          setPostMessage({
            type: "replaceText",
            content: data.new_code,
          });

          //Setup undo
          setupUndo(data.old_code);

          //Save history
          setMessageHistory(data.messages);

          //Run common post processing tasks
          runAiFrontendPostProcessing(data.new_code).then(() => {
            if(micWasOn.current == true){
              micWasOn.current = false
              // toggleMic()
            }
            isLoading.current = false
          })
        })
        .catch((e) => {
          console.error(e);
          toast.error('Something went wrong, please try again.', { id: toastId });
        })
        .finally(() => {
          isLoading.current = false; // Ensure loading state is cleared
        });

    } else if(selectedTab == Page.Db){
      if (prompt == "") {
        setCurrentDbQuery("_reset");
        return;
      }
      isLoading.current = true

      toast.promise(promptDbHelper(prompt, activeCollection), {
        loading: "Thinking...",
        success: (data) => {
          isLoading.current = false
          setResponse(
            <AIResponseWithChat
              descriptionIn={data.pending_operation_description}
              operationIn={data.pending_operation}
              historyIn={[
                { role: "user", content: prompt },
                { role: "assistant", content: data.pending_operation },
              ]}
              activeCollection={activeCollection}
              onApprove={() => {
                setPrompt("");
                setResponse(null);
                setCurrentDbQuery(data.pending_operation);
              }}
            />,
          );
          isLoading.current = false
          return "Done";
        },
        error: () => {
          isLoading.current = false
          return "Something went wrong, please try again.";
        }
      });
    } else if(selectedTab == Page.Apis){
      const fileName = currentFileProperties.fileUri.split("file:///swizzle/code")[1]
      toast.promise(editBackend(prompt, activeEndpoint, fileName, messageHistory), {
        loading: "Thinking...",
        success: (data) => {
          console.log(data)
          setPostMessage({
            type: "replaceText",
            content: data.new_code,
          });

          //Setup undo
          setupUndo(data.old_code);

          //Save history
          setMessageHistory(data.messages);

          return "Done";
        },
        error: (e) => {
          console.error(e);
          return "Something went wrong, please try again.";
        },
      })  
    }
  };

  const runAiFrontendPostProcessing = async (newCode: string) => {
    //Save the file after 100ms to give the editor time to update
    setTimeout(() => {
      setPostMessage({
        type: "saveFile",
      });
    }, 100);

    //Find uninstalled packages
    await findAndInstallRequiredPackages(newCode, "frontend")

    //Find backend endpoints
    await findAndCreateEndpoints(newCode)

    //CHeck for problems 500ms after the save
    setTimeout(() => {
      setPostMessage({
        type: "getFileErrors",
      });
    }, 600);

    setPrompt("")

    return true
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const uploadImage = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        var base64String = ""
        if (base64data instanceof ArrayBuffer) {
          const stringOutput = arrayBufferToBase64(base64data);
          base64String = "data:image/png;base64," + stringOutput;
        } else {
          base64String = base64data as string;
        }
        console.log("submitting", base64String)
        createPageFromData(base64String)
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  }

  const createPageFromData = async (base64: string) => {
    if(activeFile.includes("frontend/src/pages")){
      toast.promise(createPageFromImage(base64), {
        loading: "Parsing image and writing code...",
        success: (data) => {
          setPostMessage({
            type: "replaceText",
            content: data.new_code,
          });

          runAiFrontendPostProcessing(data.new_code)
          return "Done";
        },
        error: (e) => {
          console.error(e);
          return "Something went wrong, please try again.";
        },
      });
    } else if(activeFile.includes("frontend/src/components")){
      toast.promise(createComponentFromImage(base64), {
        loading: "Parsing image and writing code...",
        success: (data) => {
          setPostMessage({
            type: "replaceText",
            content: data.new_code,
          });

          runAiFrontendPostProcessing(data.new_code)
          return "Done";
        },
        error: (e) => {
          console.error(e);
          return "Something went wrong, please try again.";
        },
      });
    }
  }

  const findAndCreateEndpoints = async (newCode: string) => {
    const regex = /api\s*\.\s*(get|post|put|delete)\s*\(\s*(['"`])([\s\S]*?)\2.*?\)/g;
    const methodPaths = [];
    let match;
  
    // Use regex.exec in a loop to find all matches
    while ((match = regex.exec(newCode)) !== null) {
      // match[1] contains the captured HTTP method, match[2] contains the captured path
      if (match[1] && match[3]) {
        const cleanPath = match[3].replace(/\${/g, ":").replace(/}/g, "");
        const methodPath = `${match[1]}${cleanPath}`;
        methodPaths.push(methodPath);
      }
    }

    console.log("matched", methodPaths)

    var missingEndpoints = [];
    methodPaths.forEach((givenEndpoint) => {
      console.log("checking if " + givenEndpoint + " exists in " + fullEndpointList)
      const isMatch = fullEndpointList.some((existingEndpoint) => {
        const existingSegments = existingEndpoint.split('/');
        const givenSegments = givenEndpoint.split('/');
      
        // Check if the segments count matches, excluding the method part for flexibility
        if (existingSegments.length !== givenSegments.length) {
          return false;
        }
      
        // Compare each segment; treat segments with ':' as wildcard matches
        for (let i = 0; i < existingSegments.length; i++) {
          if (existingSegments[i] !== givenSegments[i] && !existingSegments[i].startsWith(':')) {
            return false; // Segment does not match and is not a wildcard
          }
        }
      
        return true; // All segments match or are accounted for by wildcards
      });
      if(!isMatch){
        missingEndpoints.push(givenEndpoint)
      }
    })

    for(var i = 0; i < missingEndpoints.length; i++){
      const segments = missingEndpoints[i].split('/')
      const method = segments[0].toUpperCase()
      const path = segments.slice(1).join('/')
      await toast.promise(createMissingBackendEndpoint(newCode, missingEndpoints[i]), {
        loading: "Creating " + method + " " + path + "...",
        success: (data) => {
          //Find uninstalled packages
          findAndInstallRequiredPackages(data.new_code, "backend")
          //add to list on console
          setShouldRefreshList(p => !p)
          return "Done";
        },
        error: (e) => {
          console.error(e);
          return "Something went wrong.";
        },
      });
    }
  
  }

  const findAndInstallRequiredPackages = async (newCode: string, location: string) => {
    const importRegex = /import\s+(?:[a-zA-Z{}\s*,]*\s+from\s+)?['"]([^'"]+)['"]/g;
    const packages = new Set();
    let match;
    while ((match = importRegex.exec(newCode)) !== null) {
        const packageName = match[1];
        // Check if it's a package (not a relative import)
        if (!packageName.startsWith('.') && !packageName.startsWith('/')) {
            // Handle scoped packages
            const scopedPackageMatch = packageName.match(/^@[^\/]+\/[^\/]+/);
            const simplePackageMatch = packageName.match(/^[^\/]+/);
            const finalMatch = scopedPackageMatch || simplePackageMatch;
            if (finalMatch) {
                packages.add(finalMatch[0]);
            }
        }
    }

    const packageArray = Array.from(packages);

    const installedPackages = await getPackageJson(location).then((data) => {
      if (data == undefined || data.dependencies == undefined) {
        return;
      }
      const dependencies = Object.keys(data.dependencies).map((key) => {
        return key;
      });
      return dependencies;
    });


    return packageArray.forEach(async (packageName: string) => {
      if(installedPackages && !installedPackages.includes(packageName)){
        await toast.promise(updatePackage([packageName], "install", location as 'frontend' | 'backend'), {
          loading: "Installing " + packageName + "...",
          success: (data) => {
            return packageName + " installed";
          },
          error: (e) => {
            console.error(e);
            return "Something went wrong, please try again.";
          },
        });
      }
    })
  }

  const problemButtonHandler = () => {
    if(problemButtonText == "Look for problems"){
      setPostMessage({
        type: "getFileErrors",
      });
      toast("Scanned for problems")
    } else{
      runFixer()
    }
  }

  useEffect(() => {
    if (fileErrors == undefined || fileErrors == ""){
      setProblemButtonText("Look for problems")
      return
    } 

    var severeErrors = []
    const parsed = JSON.parse(fileErrors)
    if(parsed.length == 0){
      return
    }
    parsed.forEach((error) => {
      if(error.severity == 1){
        severeErrors.push(error)
      }
    })

    if(severeErrors.length == 0){
      setProblemButtonText("Look for problems")
    } else{
      setProblemButtonText("Fix problems")
    }
  }, [fileErrors]);

  const runFixer = async () => {
    if (fileErrors == undefined) return;
    if (fileErrors == "") return;

    var severeErrors = []
    const parsed = JSON.parse(fileErrors)
    if(parsed.length == 0){
      return
    }
    parsed.forEach((error) => {
      if(error.severity == 1){
        severeErrors.push(error)
      }
    })

    if(severeErrors.length == 0){
      return
    }

    //Interrput dictation to fix problems
    setMicOn(false)

    var currentCode = (messageHistory[messageHistory.length - 1] || {}).content
    if(currentCode == undefined || currentCode == ""){
      if(selectedTab == Page.Hosting){
        currentCode = await getFile(activeFile)
      } else {
        console.error("Unimplemented for backend")
        return 
      }
    }

    toast.promise(fixProblems(currentCode, JSON.stringify(severeErrors)), {
      loading: "Debugging and fixing problems...",
      success: (data) => {
        if(data.new_code == undefined || data.new_code == ""){
          return "No problems found"
        }
        //Replace text in editor
        setPostMessage({
          type: "replaceText",
          content: data.new_code,
        });

        //Save the file after 100ms to give the editor time to update
        setTimeout(() => {
          setPostMessage({
            type: "saveFile",
          });
        }, 100);

        setFileErrors("")

        return "Done";
      },
      error: (e) => {
        console.error(e);
        return "Something went wrong, please try again.";
      },
    });
  }

  useEffect(() => {
    if (activeEndpoint && selectedTab == Page.Apis) {
      if (activeEndpoint.includes("!helper!")) {
        setMethod(Method.HELPER);
        setPath(activeEndpoint.replace("!helper!", ""));
      } else if (activeEndpoint.includes("!trigger!")) {
        setMethod(Method.TRIGGER);
        setPath(
          activeEndpoint.includes("signup_callback") ? "New user signup" : activeEndpoint.replace("!trigger!", ""),
        );
      } else {
        const splitEndpoint = activeEndpoint.split("/");
        setMethod(splitEndpoint[0].toUpperCase() as Method);
        setPath("/" + splitEndpoint.slice(1).join("/") || "");
      }
    }
    if (activeFile && selectedTab == Page.Hosting) {
      if (activeFile.includes("/src/pages")) {
        setPath(activePage);
      } else {
        setPath(activeFile.replace("frontend/src/components/", ""));
      }
    }
    setMicOn(false)
    setMessageHistory([]); //replace this with a store for each file later
    setProblemButtonText("Look for problems")
  }, [activeEndpoint, activeFile, activePage, selectedTab]);

  const setupUndo = (oldCode: string) => {
    setIsUndoVisible(true);
    setOldCode(oldCode);
  };

  const undoLastChange = () => {
    setPostMessage({
      type: "replaceText",
      content: oldCode,
    });
    setIsUndoVisible(false);

    setTimeout(() => {
      setPostMessage({
        type: "saveFile",
      });
    }, 250);
  };

  useEffect(() => {
    setOldCode("");
    setIsUndoVisible(false);
  }, [currentFileProperties]);

  const [suggestions, setSuggestions] = useState(docOptions);

  const onSuggestionsFetchRequested = ({ value }) => {
    if (selectedTab == Page.Apis) {
      const actions = swizzleActionOptions.filter(
        (action) =>
          (action.title.toLowerCase().includes(value.toLowerCase()) ||
            action.description.toLowerCase().includes(value.toLowerCase())) &&
          (action.filter == "" || action.filter == "backend"),
      );
      const docs = docOptions.filter(
        (doc) =>
          doc.title.toLowerCase().includes(value.toLowerCase()) ||
          doc.description.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions([...actions, ...docs]);
    } else if (selectedTab == Page.Hosting) {
      const actions = swizzleActionOptions.filter(
        (action) =>
          (action.title.toLowerCase().includes(value.toLowerCase()) ||
            action.description.toLowerCase().includes(value.toLowerCase())) &&
          (action.filter == "" || action.filter == "frontend"),
      );
      const docs = frontendDocOptions.filter(
        (doc) =>
          doc.title.toLowerCase().includes(value.toLowerCase()) ||
          doc.description.toLowerCase().includes(value.toLowerCase()),
      );
      const filteredList = fullEndpointList
        .filter((endpoint) => endpoint.includes(value) && !endpoint.startsWith("get/cron"))
        .map((endpoint) => {
          const parsedEndpoint = new ParsedActiveEndpoint(endpoint);
          return { type: "endpoint", ...parsedEndpoint };
        });
      setSuggestions([...actions, ...docs, ...filteredList]);
    } else if (selectedTab == Page.Db) {
      setSuggestions([])
    }
  };

  const srRef = useRef(null);

  const toggleMic = () => {
    if(micOn){
      if(srRef.current != null){
        srRef.current.stopListening();
        srRef.current = null;
      }
      micWasOn.current = false
      setMicOn(false)
    } else{
      startAudioCapture();
      setMicOn(true)
    }
  }
  async function startAudioCapture() {
    // var start = new Audio("/start.mp3");
    // var stop = new Audio("/stop.mp3");
    
    const GOOGLE_API_KEY = 'AIzaSyAC_RAyFgGrr1o1lO2_z2P0bOU3a6-vUSE';
    const speechRecognition = new GoogleSpeechRecognition(GOOGLE_API_KEY);
    srRef.current = speechRecognition;

    await speechRecognition.startListening(async () => {
      const result = await speechRecognition.stopListening();
      setMicOn(false)

      if(srRef.current == null){ return }
      if(result.results == undefined){ return }

      const transcript = result.results[0].alternatives[0].transcript;
      if(transcript != undefined && transcript != ""){
        micWasOn.current = true //turns mic back on once its done
        setPrompt(transcript)
        runQuery(transcript)
      }

    });
  }


    
  const onSuggestionsClearRequested = () => {
    setSuggestions(docOptions);
  };

  const getSuggestionValue = (suggestion) => suggestion.title;

  const renderSuggestion = (suggestion, { query, isHighlighted }) => {
    if (suggestion == undefined) return;
    if (suggestion.type == "doc" || suggestion.type == "externalDoc" || suggestion.type == "link") {
      return (
        <div className={`w-full p-2 pl-3 hover:bg-[#30264f] ${isHighlighted && "bg-[#30264f]"} cursor-pointer`}>
          <div className="font-bold text-sm flex">
            <img src={`/${suggestion.image}.svg`} className="mr-2 w-4 h-4 my-auto" />
            <div>{suggestion.title}</div>
          </div>
          <div
            className="text-sm font-normal mt-0.5"
            dangerouslySetInnerHTML={{ __html: suggestion.description }}
          ></div>
        </div>
      );
    } else if (suggestion.type == "ai") {
      if (suggestion.ai_type == -1 && (selectedText == null || selectedText == "")) {
        return;
      }
      return (
        <>
          <div className={`w-full p-2 pl-3 hover:bg-[#30264f] ${isHighlighted && "bg-[#30264f]"} cursor-pointer`}>
            <div className="font-semibold text-sm flex">
              <img src={`/${suggestion.image}.svg`} className="mr-2 w-4 h-4 my-auto" />
              {suggestion.title}
            </div>
            <div className="text-xs font-normal mt-1">{suggestion.description}</div>
          </div>
        </>
      );
    } else if (suggestion.type == "endpoint") {
      return (
        <div className={`w-full p-2 pl-3 hover:bg-[#30264f] ${isHighlighted && "bg-[#30264f]"} cursor-pointer`}>
          <div className="font-mono text-sm flex">
            <img src={"/cloud.svg"} className="mr-2 w-4 h-4 my-auto" />
            <span className={`${methodToColor(suggestion.method)} font-semibold mr-1`}>{suggestion.method}</span>{" "}
            {suggestion.fullPath}
          </div>
          <div className="text-xs mt-0.5 font-mono font-normal">
            {`const result = await api.${suggestion.method.toLowerCase()}("${suggestion.fullPath}")`}
          </div>
        </div>
      );
    } else if (suggestion.type == "action") {
      return (
        <>
          <div className={`w-full p-2 pl-3 hover:bg-[#30264f] ${isHighlighted && "bg-[#30264f]"} cursor-pointer`}>
            <div className="font-bold text-sm flex">
              <img src={`/${suggestion.image}.svg`} className="mr-2 w-4 h-4 my-auto" />
              <div>{suggestion.title}</div>
            </div>
            <div
              className="text-sm font-normal mt-0.5"
              dangerouslySetInnerHTML={{ __html: suggestion.description }}
            ></div>
          </div>
          {suggestions.some((s) => s.type == "doc" || s.type == "externalDoc" || s.type == "link") &&
            !suggestions.some((s) => s.type == "action") &&
            !suggestions.some((s) => s.type == "endpoint") && (
              <div className="">
                <div style={{ height: "1px" }} className="w-full mt-0 bg-gray-500" />
                <div className="mt-2 pl-3 pr-3 pb-1 text-sm opacity-70">Documentation</div>
              </div>
            )}
        </>
      );
    }
  };

  const renderSuggestionsContainer = ({ containerProps, children, query }) => (
    <div
      {...containerProps}
      className={`fixed mr-8 z-50 overflow-scroll bg-[#252629] border border-[#68697a] rounded mt-2 p-0 ${
        (query.length == 0 || suggestions.length == 0) && "hidden"
      }`}
    >
      {children}
    </div>
  );

  const getHighlightedText = () => {
    setSelectedText(null);
    setIsWaitingForText(true);
    setPostMessage({ type: "getSelectedText" });
  };

  useEffect(() => {
    if (selectedText && isWaitingForText) {
      setIsWaitingForText(false);
      //TEXT RECEIVED
    }
  }, [selectedText]);

  const onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    if (suggestion.type == "endpoint") {
      var apiDepth = "../";
      if (activeFile.includes("frontend/src")) {
        const pathParts = activeFile.split("frontend/src")[1].split("/");
        const pathLength = pathParts.length - 3;
        console.log(pathLength);
        console.log(pathParts);
        for (let i = 0; i < pathLength; i++) {
          apiDepth += "../";
        }
      }

      const apiCall = `api.${suggestion.method.toLowerCase()}("${suggestion.fullPath}")`;
      var stateVariableName =
        suggestion.fullPath
          .replace(/\:/g, "")
          .split("/")
          .slice(1)
          .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
          .join("") + "Result";
      if (stateVariableName == "Result") {
        stateVariableName = "result";
      }

      const setStateVariableName = "set" + stateVariableName.charAt(0).toUpperCase() + stateVariableName.slice(1);
      const stateVariableDeclaration = `const [${stateVariableName}, ${setStateVariableName}] = useState(null);`;
      const useEffect = `useEffect(() => {
  ${apiCall}.then((result) => {
    ${setStateVariableName}(result.data)
  }).catch((error) => {
    console.error(error.message)
  })
}, [])`;

      if (selectedTab != Page.Hosting) {
        toast.error("Sorry, something got mixed up. Try refreshing the page.");
        return;
      }

      copyText(`${stateVariableDeclaration}\n\n${useEffect}`, false);

    } else if (suggestion.type == "doc") {
      const copyable = suggestion.description.split("text-ellipsis'>")[1].split("</span>")[0];
      copyText(copyable, true);
      if (suggestion.link) {
        toast((t) => (
          <span>
            Copied example
            <button
              onClick={() => window.open(suggestion.link, "_blank")}
              className="ml-2 p-1 cursor-pointer bg-[#85869833] hover:bg-[#85869855] rounded"
            >
              Open docs
            </button>
          </span>
        ));
      }
      const importsToAdd = [{ import: suggestion.import, from: "swizzle-js", named: true }];
      const file = "backend/user-dependencies/" + endpointToFilename(activeEndpoint);
      upsertImport(file, importsToAdd).then((code) => {
        if (code != null) {
          setPostMessage({ type: "replaceText", content: code });
        }
        setTimeout(() => {
          setPostMessage({ type: "saveFile" });
        }, 250);
      });
    } else if (suggestion.type == "externalDoc") {
      const copyable = suggestion.description.split("text-ellipsis'>")[1].split("</span>")[0];
      copyText(copyable, true);
      if (suggestion.link) {
        toast((t) => (
          <span>
            Copied example
            <button
              onClick={() => window.open(suggestion.link, "_blank")}
              className="ml-2 p-1 cursor-pointer bg-[#85869833] hover:bg-[#85869855] rounded"
            >
              Open Docs
            </button>
          </span>
        ));
      }

      var newImportStatement: any = `import { ${suggestion.import} } from '${suggestion.importFrom}';`;
      setPostMessage({
        type: "upsertImport",
        content: newImportStatement + "\n",
        importStatement: newImportStatement,
      });
    } else if (suggestion.type == "link") {
      window.open(suggestion.link, "_blank");
    } else if (suggestion.type == "action") {
      if (suggestion.title == "Save") {
        setPostMessage({ type: "saveFile" });
      } else if (suggestion.title == "Switch Auth") {
        var toImport = "";
        if (currentFileProperties.hasPassportAuth) {
          toImport = "optionalAuthentication";
        } else {
          toImport = "requiredAuthentication";
        }

        const importsToAdd = [{ import: toImport, from: "swizzle-js", named: true }];
        const file = "backend/user-dependencies/" + endpointToFilename(activeEndpoint);
        upsertImport(file, importsToAdd).then((code) => {
          var codeWithMiddlewareReplaced = "";
          if (code.includes("requiredAuthentication, async")) {
            codeWithMiddlewareReplaced = code.replace("requiredAuthentication, async", "optionalAuthentication, async");
          } else {
            codeWithMiddlewareReplaced = code.replace("optionalAuthentication, async", "requiredAuthentication, async");
          }

          if (code != null) {
            setPostMessage({ type: "replaceText", content: codeWithMiddlewareReplaced });
          }

          setTimeout(() => {
            setPostMessage({ type: "saveFile" });
          }, 500);

          setCurrentFileProperties({
            ...currentFileProperties,
            hasPassportAuth: !currentFileProperties.hasPassportAuth,
          });
        });
      } else {
        setSwizzleActionDispatch(suggestion.title);
      }
    }
    setPrompt("");
  };
  const onPromptChange = (event, { newValue }) => {
    setPrompt(newValue);
  };

  useEffect(() => {
    if (prompt == "") {
      setHighlighted(false);
    }
  }, [prompt]);

  const storeInputRef = (autosuggest) => {
    if (autosuggest !== null) {
      headerRef.current = autosuggest.input;
    }
  };

  useEffect(() => {
    const keyHandler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault(); // Prevent default browser behavior
        headerRef.current.focus();
      }
    };

    window.addEventListener("keydown", keyHandler);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, []);

  if (taskQueue.length > 0) {
    return <TaskCommandHeader />;
  }

  const toggleSearch = () => {
    const command = isSearching ? "closeSearchView" : "openSearchView";
    setPostMessage({ type: command });
    setIsSearching(!isSearching);
  };

  const toggleDebug = () => {
    const command = isDebugging ? "closeDebugger" : "openDebugger";
    setPostMessage({ type: command });
    setIsDebugging(!isDebugging);
  };

  const goBack = () => {
    setPostMessage({ type: "runCommand", command: "textEditor.commands.go.back" });
  };

  return (
    <>
      <div className="flex-col magic-bar">
        <div className="pt-3 ml-1 flex">
          {selectedTab != Page.Db && (
            <div className="w-6 flex align-middle mr-1 cursor-pointer">
              <FontAwesomeIcon className="w-4 h-4 m-auto opacity-70" icon={faArrowLeft} onClick={goBack} />
            </div>
          )}

          {selectedTab == Page.Hosting ? (
            <div className="flex align-middle pr-2 font-normal font-mono">
              <img src="/world.svg" className="inline-block w-3 h-3 mr-2 my-auto ml-0 opacity-100" />
              <div className="my-auto">{path == "frontend/src/AppContext.tsx" ? "Global App Context" : path}</div>
            </div>
          ) : selectedTab == Page.Apis ? (
            <div className="flex align-middle pr-2 font-normal font-mono">
              {path.startsWith("/cron") ? (
                <FontAwesomeIcon icon={faClock} className="w-3 h-3 my-auto mr-2" />
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={method == Method.TRIGGER ? faBoltLightning : method == Method.HELPER ? faPuzzlePiece : faGear}
                    className="w-3 h-3 my-auto mr-2"
                  />
                  <span className={`${methodToColor(method)} my-auto font-semibold mr-1 `}>
                    {method == Method.TRIGGER ? "" : method == Method.HELPER ? "" : method}
                  </span>
                </>
              )}
              <div className="my-auto">{path.startsWith("/cron/") ? path.replace("/cron/", "") : path}</div>
            </div>
          ) : (
            <></>
          )}
          {/* <Button
            text={problemButtonText}
            className={`${problemButtonText == "Fix problems" && "text-red-400"} mr-1 ml-auto text-sm px-2.5 py-1 mt-2.5 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border`}
            onClick={problemButtonHandler}
          /> */}
          {
            //Move close sidebar button here
            <></>
          }
        </div>
        <div
          className={`flex justify-between mb-2 text-lg font-bold pt-2 max-h-[52px] ${
            ideReady || (selectedTab != Page.Hosting && selectedTab != Page.Apis)
              ? ""
              : "opacity-50 pointer-events-none"
          }`}
        >
          {/* <div className={`w-[1px] h-[36px] bg-[#525363] mx-4 ${selectedTab == Page.Db ? "hidden" : ""}`}></div> */}
          {/* Undo shows only when isUndoVisible is true */}
          {/* {selectedTab != Page.Db && (
            <div className="w-10 mr-2">
              <IconTextButton
                textHidden={true}
                onClick={() => {
                  toggleSearch();
                }}
                icon={<FontAwesomeIcon className="w-3 h-3 m-auto py-0.5" icon={isSearching ? faXmark : faSearch} />}
                text=""
              />
            </div>
          )} */}
          {(selectedTab == Page.Apis || isDebugging) && (
            <div className="w-10 mr-0">
              <IconTextButton
                textHidden={true}
                onClick={() => {
                  toggleDebug();
                }}
                icon={<FontAwesomeIcon className="w-3 h-3 m-auto py-0.5" icon={isDebugging ? faXmark : faBug} />}
                text=""
              />
            </div>
          )}

          {isUndoVisible && (
            <Button
              className={`text-sm ml-2 mr-0 px-3 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border`}
              children={<FontAwesomeIcon icon={faUndo} />}
              onClick={() => {
                undoLastChange();
              }}
            />
          )}

          <div className={`grow ${selectedTab == Page.Db ? `mr-4 ml-4 ${!activeCollection && "hidden"}` : "mr-2 ml-2"}`}>
            <Autosuggest
              ref={storeInputRef}
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              renderSuggestionsContainer={renderSuggestionsContainer}
              onSuggestionSelected={onSuggestionSelected}
              shouldRenderSuggestions={() => {
                return true;
              }}
              highlightFirstSuggestion={false}
              onSuggestionHighlighted={({ suggestion }) => {
                setHighlighted(true);
              }}
              inputProps={{
                onKeyDown: (event) => {
                  if (event.key == "Enter") {
                    runQuery()
                    return;
                  }
                },
                placeholder: `${
                  selectedTab == Page.Apis
                    ? "Describe what you want"
                    : selectedTab == Page.Hosting
                    ? "Describe what you want"
                    : selectedTab == Page.Db
                    ? "Cmd + K: search and update your database"
                    : ""
                }`,
                value: prompt,
                onChange: onPromptChange,
                onFocus: () => {
                  setPostMessage({ type: "getSelectedText" });
                },
                className:
                  `grow mx-2 ml-0 mr-4 ${micOn ? "bg-[#3c2727] border-[#7a3531] " : "bg-[#252629] border-[#525363]"} border rounded font-sans text-sm font-normal outline-0 focus:bg-[#28273c] focus:border-[#4e52aa] p-1.5`,
                style: {
                  width: "100%",
                },
              }}
              style={{ width: "100%" }}
              className="ml-0 mr-4 grow"
            />
          </div>
          
          {(selectedTab == Page.Hosting && prompt == "") && (
            <>
            {!micOn && (
              <Button
                children={<FontAwesomeIcon icon={faImage} />}
                className="text-sm mr-1 px-3 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                onClick={() => {
                  uploadImage()
                }}
              /> 
            )}
            <Button
              children={<FontAwesomeIcon icon={micOn ? faMicrophoneSlash : faMicrophone} />}
              className={`text-sm mr-1 ml-1 px-3 py-1 font-medium rounded flex justify-center items-center cursor-pointer ${micOn ? "bg-[#3c2727] border-[#7a3531]" : "bg-[#85869833] border-[#525363]"} hover:bg-[#85869855] border`}
              onClick={() => {
                toggleMic()
              }}
            />
            </>
          )}
          
          {prompt != "" ? (
            <Button
              text="Edit File"
              className={`${isLoading.current == true && "opacity-70 pointer-events-none"} text-sm mr-1 px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border`}
              onClick={() => {
                runQuery();
              }}
            />
          ) : (
            selectedTab == Page.Db && (
              <Button
                className={`text-sm mr-1 px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border ${!activeCollection && "hidden"}`}
                text="+ Add Entry"
                onClick={() => {
                  setShouldCreateObject(true)
                }}
                style={{ paddingTop: "0.4rem", paddingBottom: "0.4rem" }}
              />
            )
          )}
        </div>
      </div>

      <FloatingModal
        content={response}
        closeModal={() => {
          setResponse(null);
        }}
      />
      <FloatingModal
        content={autocheckResponse}
        closeModal={() => {
          setAutocheckResponse(null);
        }}
      />
    </>
  );
}
