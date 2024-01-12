import { faArrowLeft, faBug, faClock, faCloud, faSearch, faUndo, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useEffect, useState } from "react";
import Autosuggest from 'react-autosuggest';
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import useFilesystemApi from "../../API/FilesystemAPI";
import { ParsedActiveEndpoint } from "../../Utilities/ActiveEndpointHelper";
import Button from "../../Utilities/Button";
import { copyText } from "../../Utilities/Copyable";
import { replaceCodeBlocks } from "../../Utilities/DataCaster";
import { endpointToFilename } from "../../Utilities/EndpointParser";
import FloatingModal from "../../Utilities/FloatingModal";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import IconTextButton from "../../Utilities/IconTextButton";
import { Method, methodToColor } from "../../Utilities/Method";
import { Page } from "../../Utilities/Page";
import AIResponseWithChat from "./AIResponseWithChat";
import { docOptions, frontendDocOptions, swizzleActionOptions } from "./HeaderDocOptions";
import TaskCommandHeader from "./TaskCommandHeader";

export default function EndpointHeader({selectedTab, currentFileProperties, setCurrentFileProperties, headerRef, activeCollection, isDebugging, setIsDebugging}: {selectedTab: Page, currentFileProperties: any, setCurrentFileProperties: any, headerRef: any, activeCollection?: string, isDebugging: boolean, setIsDebugging: any}) {
  const { taskQueue, setFileErrors, activeEndpoint, activeFile, ideReady, setPostMessage, fullEndpointList, selectedText, setSelectedText, setCurrentDbQuery, fileErrors, setSwizzleActionDispatch, activePage } = useContext(SwizzleContext);
  const [method, setMethod] = useState<Method>(Method.GET);
  const [path, setPath] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [AICommand, setAICommand] = useState<string>("ask");
  const [response, setResponse] = useState<ReactNode | undefined>(null);
  const [isUndoVisible, setIsUndoVisible] = useState<boolean>(false);
  const [isWaitingForText, setIsWaitingForText] = useState<boolean>(false);
  const [oldCode, setOldCode] = useState<string>("");
  const [pendingRequest, setPendingRequest] = useState<string>("");
  const [highlighted, setHighlighted] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [autocheckResponse, setAutocheckResponse] = useState<ReactNode | undefined>();
  const [didRunAutocheck, setDidRunAutocheck] = useState(false);


  //save query info for re-render when we get fileErrors 
  const [ promptQuery, setPromptQuery ] = useState<string>("");
  const [ queryType, setQueryType ] = useState<string>("");
  const [isWaitingForErrors, setIsWaitingForErrors] = useState<boolean>(false);

  const { promptAiEditor, getAutocheckResponse, promptDbHelper } = useEndpointApi();
  const { upsertImport } = useFilesystemApi()

  useEffect(() => {
    if(activeEndpoint && selectedTab == Page.Apis){
      if(activeEndpoint.includes("!helper!")){
        setMethod(Method.HELPER)
        setPath(activeEndpoint.replace("!helper!", ""))
      } else{
        const splitEndpoint = activeEndpoint.split("/");
        setMethod(splitEndpoint[0].toUpperCase() as Method);
        setPath("/" + splitEndpoint.slice(1).join("/") || "");
      }
    }
    if(activeFile && selectedTab == Page.Hosting){
      if(activeFile.includes("/src/pages")){
        setPath(activePage)
      } else{
        setPath(activeFile.replace("frontend/src/components/", ""));
      }
    }
  }, [activeEndpoint, activeFile, activePage, selectedTab]);


  const runQuery = async (promptQuery: string, queryType: string, selectedText?: string) => {
    if(queryType == "db"){
      if(promptQuery == ""){
        setCurrentDbQuery("_reset")
        return
      }
      return toast.promise(promptDbHelper(promptQuery, activeCollection), {
        loading: "Thinking...",
        success: (data) => {
          setResponse(
            <AIResponseWithChat 
              descriptionIn={data.pending_operation_description}
              operationIn={data.pending_operation} 
              historyIn={[{role: "user", content: promptQuery}, {role: "assistant", content: data.pending_operation}]}
              activeCollection={activeCollection}
              onApprove={() => {
                setResponse(null);
                setCurrentDbQuery(data.pending_operation)
              }}
            />)
          return "Done";
        },
        error: "Failed",
      });
    } else {
      //find file errors if they exist
      setPromptQuery(promptQuery)
      setQueryType(queryType)
      setSelectedText(selectedText)
      setFileErrors("")
      setIsWaitingForErrors(true)
      setPostMessage({
        type: "getFileErrors"
      })
      // toast("Scanning for build errors...")
    }
  };

  useEffect(() => {
    if(!isWaitingForErrors) return
    setIsWaitingForErrors(false)
    runQueryFromState()
  }, [fileErrors])

  const runQueryFromState = () => {
    toast.promise(promptAiEditor(promptQuery, queryType, selectedText, undefined, undefined, fileErrors), {
      loading: "Thinking...",
      success: (data) => {
        if(queryType == "edit"){

          setResponse(
            <AIResponseWithChat 
              descriptionIn={"The selected code will be replaced with the following"}
              operationIn={data.new_code} 
              historyIn={[{role: "user", content: promptQuery}, {role: "assistant", content: data.new_code}]}
              selectedText={selectedText}
              onApprove={() => {
                setResponse(null);
                setPostMessage({
                  type: "replaceText",
                  content: data.new_code,
                })
                setupUndo(data.old_code)
                setTimeout(() => {
                  setPostMessage({
                    type: "saveFile"
                  })
                }, 100)
              }}
          />)
        } else if(queryType == "snippet"){
          setResponse(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(data.new_code) }} />)
        } else if(queryType == "selection"){
          //open window and confirm
          setResponse(
            <AIResponseWithChat 
              descriptionIn={"The selected code will be replaced with the following"}
              operationIn={data.new_code} 
              historyIn={[{role: "user", content: promptQuery}, {role: "assistant", content: data.new_code}]}
              selectedText={selectedText}
              onApprove={() => {
                setResponse(null);
                setPostMessage({
                    type: "replaceSelectedText",
                    content: data.new_code,
                })
              }}
            />)
        }
        return "Done";
      },
      error: "Failed",
    });
  }

  const setupUndo = (oldCode: string) => {
    setIsUndoVisible(true)
    setOldCode(oldCode)
  }

  const undoLastChange = () => {
    setPostMessage({
      type: "replaceText",
      content: oldCode,
    })
    setIsUndoVisible(false)
  }

  useEffect(() => {
    setOldCode("")
    setIsUndoVisible(false)
  }, [currentFileProperties])


  const [suggestions, setSuggestions] = useState(docOptions);
  const onSuggestionsFetchRequested = ({ value }) => {
    const ai_options = [
      {
        "type": "ai",
        "image": "ai_selection",
        "title": "Update selected code",
        "description": value,
        "ai_type": -1
      },
      {
        "type": "ai",
        "image": "wand",
        "title": "Ask AI",
        "description": value,
        "ai_type": 0
      },
    ]

    const db_ai_options = [
      {
        "type": "ai",
        "image": "ai_snippet",
        "title": "Ask AI",
        "description": value,
        "ai_type": 2,
      },
    ]

    if(selectedTab == Page.Apis){
      const actions = swizzleActionOptions.filter((action) => (action.title.toLowerCase().includes(value.toLowerCase()) || action.description.toLowerCase().includes(value.toLowerCase())) && (action.filter == "" || action.filter == "backend") )
      const docs = docOptions.filter((doc) => doc.title.toLowerCase().includes(value.toLowerCase()) || doc.description.toLowerCase().includes(value.toLowerCase()))
      setSuggestions([...ai_options, ...actions, ...docs])
    } else if(selectedTab == Page.Hosting){
      const actions = swizzleActionOptions.filter((action) => (action.title.toLowerCase().includes(value.toLowerCase()) || action.description.toLowerCase().includes(value.toLowerCase())) && (action.filter == "" || action.filter == "frontend") )
      const docs = frontendDocOptions.filter((doc) => doc.title.toLowerCase().includes(value.toLowerCase()) || doc.description.toLowerCase().includes(value.toLowerCase()))
      const filteredList = fullEndpointList.filter(endpoint => endpoint.includes(value) && !endpoint.startsWith("get/cron")).map((endpoint) => {
        const parsedEndpoint = new ParsedActiveEndpoint(endpoint)
        return {type: "endpoint", ...parsedEndpoint}
      })
      setSuggestions([...ai_options, ...actions, ...docs, ...filteredList])
    } else if(selectedTab == Page.Db){
      setSuggestions([...db_ai_options])
    }
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions(docOptions)
  };

  const getSuggestionValue = suggestion => suggestion.title;

  const renderSuggestion = (suggestion, { query, isHighlighted }) => {
    if(suggestion == undefined) return
    if(suggestion.type == "doc" || suggestion.type == "externalDoc" || suggestion.type == "link"){
      return(
        <div className={`w-full p-2 pl-3 hover:bg-[#30264f] ${isHighlighted && "bg-[#30264f]" } cursor-pointer`}>
          <div className="font-bold text-sm flex">
            <img 
              src={`/${suggestion.image}.svg`}
              className="mr-2 w-4 h-4 my-auto"
            />
            <div>{suggestion.title}</div>
          </div>
          <div className="text-sm font-normal mt-0.5" dangerouslySetInnerHTML={{__html: suggestion.description}}>
          </div>
        </div>
      )
    } else if(suggestion.type == "ai"){
      if(suggestion.ai_type == -1 && (selectedText == null || selectedText == "")){ return } 
      return(
        <>
        <div className={`w-full p-2 pl-3 hover:bg-[#30264f] ${isHighlighted && "bg-[#30264f]" } cursor-pointer`}>
          <div className="font-semibold text-sm flex">
            <img 
              src={`/${suggestion.image}.svg`}
              className="mr-2 w-4 h-4 my-auto"
            />
            {suggestion.title}
          </div>
          <div className="text-xs font-normal mt-1">
            {suggestion.description}
          </div>
        </div>
        {/* This is a little confusing UI wise, come back later maybe */}
        {/* {(suggestions.some(s => s.type == "action") && suggestion.ai_type == 0) &&
          <div className="">
            <div style={{height: "1px"}} className="w-full mt-0 bg-gray-500" />
            <div className="mt-2 pl-3 pr-3 pb-1 text-xs opacity-70">Swizzle Actions</div>
          </div>
        }
         {(suggestions.some(s => s.type == "doc" || s.type == "externalDoc"  || s.type == "link") && !suggestions.some(s => s.type == "action")) &&
          <div className="">
            <div style={{height: "1px"}} className="w-full mt-0 bg-gray-500" />
            <div className="mt-2 pl-3 pr-3 pb-1 text-xs opacity-70">Code Templates</div>
          </div>
        } */}
        </>
      )
    } else if(suggestion.type == "endpoint"){
      return(
        <div className={`w-full p-2 pl-3 hover:bg-[#30264f] ${isHighlighted && "bg-[#30264f]" } cursor-pointer`}>
          <div className="font-mono text-sm flex">
            <img 
              src={"/cloud.svg"}
              className="mr-2 w-4 h-4 my-auto"
            />
            <span className={`${methodToColor(suggestion.method)} font-semibold mr-1`}>{suggestion.method}</span> {suggestion.fullPath}
          </div>
          <div className="text-xs mt-0.5 font-mono font-normal">
            {`const result = await api.${suggestion.method.toLowerCase()}("${suggestion.fullPath}")`}
          </div>
        </div>
      )
    } else if(suggestion.type == "action"){
      return(
        <>
        <div className={`w-full p-2 pl-3 hover:bg-[#30264f] ${isHighlighted && "bg-[#30264f]" } cursor-pointer`}>
          <div className="font-bold text-sm flex">
            <img 
              src={`/${suggestion.image}.svg`}
              className="mr-2 w-4 h-4 my-auto"
            />
            <div>{suggestion.title}</div>
          </div>
          <div className="text-sm font-normal mt-0.5" dangerouslySetInnerHTML={{__html: suggestion.description}}>
          </div>
        </div>
        {(suggestions.some(s => s.type == "doc" || s.type == "externalDoc"  || s.type == "link") && !suggestions.some(s => s.type == "action") && !suggestions.some(s => s.type == "endpoint")) &&
          <div className="">
            <div style={{height: "1px"}} className="w-full mt-0 bg-gray-500" />
            <div className="mt-2 pl-3 pr-3 pb-1 text-sm opacity-70">Documentation</div>
          </div>
        }
        </>
      )
    }
  };

  const renderSuggestionsContainer = ({ containerProps, children, query }) => (
    <div {...containerProps} className={`fixed mr-8 z-50 overflow-scroll bg-[#252629] border border-[#68697a] rounded mt-2 p-0 ${(query.length == 0 || suggestions.length == 0) && "hidden"}`}>
      {children}
    </div>
  );

  const getHighlightedText = () => {
    setSelectedText(null)
    setIsWaitingForText(true)
    setPostMessage({type: "getSelectedText"})
  }

  useEffect(() => {
    if(selectedText && isWaitingForText){
      setIsWaitingForText(false)
      runQuery(pendingRequest, "selection", selectedText)
    }
  }, [selectedText])

  const onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    if(suggestion.type == "ai"){
      if(suggestion.ai_type == -1){
        setPendingRequest(suggestion.title)
        getHighlightedText()
      } else if(suggestion.ai_type == 0){
        runQuery(suggestion.title, "edit")
      } else if(suggestion.ai_type == 2){
        runQuery(suggestion.title, "db")
      }
    } else{
      if(suggestion.type == "endpoint"){
        var apiDepth = "../"
        if(activeFile.includes("frontend/src")){
          const pathParts = (activeFile.split("frontend/src")[1]).split("/")
          const pathLength = pathParts.length - 3
          console.log(pathLength)
          console.log(pathParts)
          for (let i = 0; i < pathLength; i++) {
            apiDepth += "../"
          }
        }

        const importsToAdd = [
          { import: "useState", from: "react", named: true },
          { import: "useEffect", from: "react", named: true },
          { import: "api", from: apiDepth+"Api", named: false },
        ];

        const apiCall = `api.${suggestion.method.toLowerCase()}("${suggestion.fullPath}")`
        var stateVariableName = suggestion.fullPath.split("/")
          .slice(1)
          .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
          .join("") + "Result";
        if(stateVariableName == "Result"){
          stateVariableName = "result"
        }

        const setStateVariableName = "set" + stateVariableName.charAt(0).toUpperCase() + stateVariableName.slice(1);
        const stateVariableDeclaration = `const [${stateVariableName}, ${setStateVariableName}] = useState(null);`
        const useEffect = `useEffect(() => {
  ${apiCall}.then((result) => {
    ${setStateVariableName}(result.data)
  }).catch((error) => {
    console.error(error.message)
  })
}, [])`

        var file = activeFile
        if(selectedTab != Page.Hosting){
          toast.error("Sorry, something got mixed up. Try refreshing the page.")
          return
        }

        toast.promise(upsertImport(file, importsToAdd).then((code) => {
          if(code != null){
            copyText(`${stateVariableDeclaration}\n\n${useEffect}`, true)
            setPostMessage({type: "replaceText", content: code})
          }

          setTimeout(() => {
            setPostMessage({type: "saveFile"})
          }, 250)

        }), 
        {
          loading: "Thinking...",
          success: "Copied code to clipboard",
          error: (e) => {
            console.log(e);
            return "Failed. Make sure there are no syntax errors in your code before adding API calls."
          },
        });
    
      } else if(suggestion.type == "doc"){
        const copyable = suggestion.description.split("text-ellipsis'>")[1].split("</span>")[0]
        copyText(copyable, true)
        if(suggestion.link){
          toast((t) => (
            <span>
              Copied example
              <button onClick={() => window.open(suggestion.link, "_blank")} className="ml-2 p-1 cursor-pointer bg-[#85869833] hover:bg-[#85869855] rounded">
                Open docs
              </button>
            </span>
          ));          
        }
        const importsToAdd = [ { import: suggestion.import, from: "swizzle-js", named: true } ];
        const file = "backend/user-dependencies/" + endpointToFilename(activeEndpoint)
        upsertImport(file, importsToAdd).then((code) => {
          if(code != null){
            setPostMessage({type: "replaceText", content: code})
          }
          setTimeout(() => {
            setPostMessage({type: "saveFile"})
          }, 250)
        })
      } else if(suggestion.type == "externalDoc"){
        const copyable = suggestion.description.split("text-ellipsis'>")[1].split("</span>")[0]
        copyText(copyable, true)
        if(suggestion.link){
          toast((t) => (
            <span>
              Copied example
              <button onClick={() => window.open(suggestion.link, "_blank")} className="ml-2 p-1 cursor-pointer bg-[#85869833] hover:bg-[#85869855] rounded">
                Open Docs
              </button>
            </span>
          ));          
        }

        var newImportStatement: any = `import { ${suggestion.import} } from '${suggestion.importFrom}';`;
        setPostMessage({type: "upsertImport", content: newImportStatement + "\n", importStatement: newImportStatement})
      } else if(suggestion.type == "link"){
        window.open(suggestion.link, '_blank');
      } else if(suggestion.type == "action"){
        if(suggestion.title == "Save"){
          setPostMessage({type: "saveFile"})
        } else if(suggestion.title == "Autocheck"){
          runAutocheck()
        } else if(suggestion.title == "Switch Auth"){
          var toImport = ""
          if(currentFileProperties.hasPassportAuth){
            toImport = "optionalAuthentication"
          } else {
            toImport = "requiredAuthentication"
          }
     
          const importsToAdd = [ { import: toImport, from: "swizzle-js", named: true } ];
          const file = "backend/user-dependencies/" + endpointToFilename(activeEndpoint)
          upsertImport(file, importsToAdd).then((code) => {
            var codeWithMiddlewareReplaced = ""
            if(code.includes("requiredAuthentication, async")){
              codeWithMiddlewareReplaced = code.replace("requiredAuthentication, async", "optionalAuthentication, async")
            } else{
              codeWithMiddlewareReplaced = code.replace("optionalAuthentication, async", "requiredAuthentication, async")
            }

            if(code != null){
              setPostMessage({type: "replaceText", content: codeWithMiddlewareReplaced})
            }
            
            setTimeout(() => {
              setPostMessage({type: "saveFile"})
            }, 500)

            setCurrentFileProperties({...currentFileProperties, hasPassportAuth: !currentFileProperties.hasPassportAuth})
          })
        } else{
          setSwizzleActionDispatch(suggestion.title)
        }
      }
    }
    setPrompt("")
  }
  const onPromptChange = (event, { newValue }) => {
    setPrompt(newValue);
  }

  useEffect(() => {
    if(prompt == ""){
      setHighlighted(false)
    }
  }, [prompt])

  const storeInputRef = (autosuggest) => {
    if (autosuggest !== null) {
      headerRef.current = autosuggest.input;
    }
  }

  useEffect(() => {
    const keyHandler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault(); // Prevent default browser behavior
        headerRef.current.focus();
      }
    };

    window.addEventListener('keydown', keyHandler);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  const runAutocheck = () => {
    setDidRunAutocheck(true)
    setPostMessage({
      type: "getFileErrors"
    })
  }

  useEffect(() => {
    if(!didRunAutocheck) { 
      return
    }
    if(fileErrors != ""){
      toast.promise(getAutocheckResponse(fileErrors), {
        loading: "Running autocheck...",
        success: (data) => {
          if (data == "") {
            toast.error("Error running autocheck");
            return;
          }
          setAutocheckResponse(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(data.recommendation_text) }} />);
          return "Done";
        },
        error: "Error running autocheck",
      });
    } else{
      toast.promise(getAutocheckResponse(), {
        loading: "Running autocheck...",
        success: (data) => {
          if (data == "") {
            toast.error("Error running autocheck");
            return;
          }
          setAutocheckResponse(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(data.recommendation_text) }} />);
          return "Done";
        },
        error: "Error running autocheck",
      });
    }
    setDidRunAutocheck(false)
  }, [fileErrors])


  if(taskQueue.length > 0){
    return (
      <TaskCommandHeader />
    )
  }


  const toggleSearch = () => {
    const command = isSearching ? "closeSearchView" : "openSearchView";
    setPostMessage({ type: command });
    setIsSearching(!isSearching);
  }

  const toggleDebug = () => {
    const command = isDebugging ? "closeDebugger" : "openDebugger";
    setPostMessage({ type: command });
    setIsDebugging(!isDebugging);
  }

  const goBack = () => {
    setPostMessage({type: "runCommand", command: "textEditor.commands.go.back"})
  }

  return (
    <>
        <div className="flex-col magic-bar">
          <div className="pt-3 ml-1 flex">
            {selectedTab != Page.Db && (
              <div className="w-6 mx-1 cursor-pointer mt-1">
                <FontAwesomeIcon className="w-4 h-4 m-auto py-0.5 opacity-70" icon={faArrowLeft} onClick={goBack} />
              </div>
            )}

            {selectedTab == Page.Hosting ? (
              <div className="flex align-middle pr-2 font-normal font-mono w-full">
                <img src="/world.svg" className="inline-block w-3 h-3 mr-2 my-auto ml-0 opacity-100" />
                <div className="my-auto">{path}</div>
              </div>
            ) : (selectedTab == Page.Apis ? (
              <div className="flex align-middle pr-2 font-normal font-mono">
                {path.startsWith("/cron") ? (
                  <FontAwesomeIcon icon={faClock} className="w-3 h-3 my-auto mr-2" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCloud} className="w-3 h-3 my-auto mr-2" />
                    <span className={`${methodToColor(method)} my-auto font-semibold mr-1 `}>{method}</span> 
                  </>
                )}
                <div className="my-auto">{path.startsWith("/cron/") ? path.replace("/cron/", "") : path}</div>
              </div>
            ) : (<></>))}
          </div>
          <div
            className={`flex justify-between mb-2 text-lg font-bold pt-2 max-h-[52px] ${
              (ideReady || (selectedTab != Page.Hosting && selectedTab != Page.Apis)) ? "" : "opacity-50 pointer-events-none"
            }`}
          >

            {/* <div className={`w-[1px] h-[36px] bg-[#525363] mx-4 ${selectedTab == Page.Db ? "hidden" : ""}`}></div> */}
            {/* Undo shows only when isUndoVisible is true */}
            {selectedTab != Page.Db && (
              <div className="w-10 mr-2">
                <IconTextButton
                  textHidden={true}
                  onClick={() => {
                    toggleSearch()
                  }}
                  icon={<FontAwesomeIcon className="w-3 h-3 m-auto py-0.5" icon={isSearching ? faXmark : faSearch} />}
                  text=""
                />
              </div>
            )}
            {(selectedTab == Page.Apis || isDebugging) && (
              <div className="w-10 mr-2">
                <IconTextButton
                  textHidden={true}
                  onClick={() => {
                    toggleDebug()
                  }}
                  icon={<FontAwesomeIcon className="w-3 h-3 m-auto py-0.5" icon={isDebugging ? faXmark : faBug} />}
                  text=""
                />
              </div>
            )}

            {isUndoVisible && (
              <Button
                className={`text-sm mr-3 px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border`}
                children={<FontAwesomeIcon icon={faUndo} />}
                onClick={() => {
                  undoLastChange()
                }}
              />
            )}

            <div className={`grow ${selectedTab == Page.Db ? `mr-32 ml-4 ${!activeCollection && "hidden"}` : ""}`}>
              <Autosuggest
                ref={storeInputRef}
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                renderSuggestionsContainer={renderSuggestionsContainer}
                onSuggestionSelected={onSuggestionSelected}
                shouldRenderSuggestions={() => { return true }}
                highlightFirstSuggestion={false}
                onSuggestionHighlighted={({ suggestion }) => {
                  setHighlighted(true)
                }}
                inputProps={{
                  onKeyDown: (event) => {
                    if(event.key == "Enter"){
                      if(selectedTab == Page.Db){
                        runQuery(prompt, "db")
                        return
                      }
                      if(!highlighted){
                        if(selectedText != null && selectedText != ""){
                          runQuery(prompt, "selection", selectedText)
                        }
                        else {
                          runQuery(prompt, "edit")
                        }
                      }
                      setPrompt("")
                      return
                    }
                  },
                  placeholder: `${selectedTab == Page.Apis ? "Update code with AI" : selectedTab == Page.Hosting ? "Connect endpoints and update code" : selectedTab == Page.Db ? "Cmd + K: search and update your database" : ""}`,
                  value: prompt,
                  onChange: onPromptChange,
                  onFocus: () => { setPostMessage({type: "getSelectedText"}) },
                  className: "grow mx-2 ml-0 mr-0 bg-[#252629] border-[#525363] border rounded font-sans text-sm font-normal outline-0 focus:bg-[#28273c] focus:border-[#4e52aa] p-1.5",
                  style: {
                    width: "calc(100% - 1rem)",
                  }
                }}
                className="ml-0 mr-0 grow"
              />
            </div>

            {/* <Button
              text="Go"
              className="text-sm px-5 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
              onClick={() => {
                runQuery();
              }}
            /> */}
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
