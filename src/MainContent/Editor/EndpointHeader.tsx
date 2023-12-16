import { faBug, faSearch, faUndo, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useEffect, useState } from "react";
import Autosuggest from 'react-autosuggest';
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import { ParsedActiveEndpoint } from "../../Utilities/ActiveEndpointHelper";
import Button from "../../Utilities/Button";
import { copyText } from "../../Utilities/Copyable";
import { replaceCodeBlocks } from "../../Utilities/DataCaster";
import { modifySwizzleImport } from "../../Utilities/EndpointParser";
import FloatingModal from "../../Utilities/FloatingModal";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method, methodToColor } from "../../Utilities/Method";
import { Page } from "../../Utilities/Page";
import AIResponseWithChat from "./AIResponseWithChat";

export default function EndpointHeader({selectedTab, currentFileProperties, setCurrentFileProperties, headerRef, activeCollection}: {selectedTab: Page, currentFileProperties: any, setCurrentFileProperties: any, headerRef: any, activeCollection?: string}) {
  const { activeEndpoint, ideReady, setPostMessage, fullEndpointList, selectedText, setSelectedText, setCurrentDbQuery, setSwizzleActionDispatch } = useContext(SwizzleContext);
  const [method, setMethod] = useState<Method>(Method.GET);
  const [path, setPath] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [AICommand, setAICommand] = useState<string>("ask");
  const [response, setResponse] = useState<ReactNode | undefined>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);
  const [isUndoVisible, setIsUndoVisible] = useState<boolean>(false);
  const [isWaitingForText, setIsWaitingForText] = useState<boolean>(false);
  const [oldCode, setOldCode] = useState<string>("");
  const [pendingRequest, setPendingRequest] = useState<string>("");
  const [highlighted, setHighlighted] = useState<boolean>(false);

  const { promptAiEditor, checkIfAllEndpointsExist, promptDbHelper } = useEndpointApi();

  useEffect(() => {
    if (activeEndpoint == undefined) return;
    const splitEndpoint = activeEndpoint.split("/");
    setMethod(splitEndpoint[0].toUpperCase() as Method);
    setPath("/" + splitEndpoint[1] || "");
  }, [activeEndpoint]);


  const runQuery = async (promptQuery: string, queryType: string, selectedText?: string) => {
    console.log("info", promptQuery, queryType)
    const currentFile = currentFileProperties.fileUri.split("/").pop()
    console.log("currentFile", currentFile)
    if(queryType == "db"){
      if(promptQuery == ""){
        console.log("resetting db query")
        setCurrentDbQuery("_reset")
        return
      }
      return toast.promise(promptDbHelper(promptQuery, activeCollection), {
        loading: "Thinking...",
        success: (data) => {
          console.log(data)
          setResponse(
            <AIResponseWithChat 
              descriptionIn={data.pending_operation_description}
              operationIn={data.pending_operation} 
              setResponse={setResponse} 
              setCurrentDbQuery={setCurrentDbQuery} 
              historyIn={[{role: "user", content: promptQuery}, {role: "assistant", content: data.pending_operation}]}
              activeCollection={activeCollection}
            />)
          return "Done";
        },
        error: "Failed",
      });
    } else {
      return toast.promise(promptAiEditor(promptQuery, queryType, selectedText), {
        loading: "Thinking...",
        success: (data) => {
          if(queryType == "edit"){
            //Replace the text
            setPostMessage({
              type: "replaceText",
              content: data.new_code,
            })
        
            //TODO: Update currentFileProperties here
            //Update auth-required and imports

            //Add undo button
            setupUndo(data.old_code)

            setTimeout(() => {
              setPostMessage({
                type: "saveFile"
              })
            }, 100)

            //TODO: finish this function later to add backend endpoints if needed
            if(selectedTab == Page.Hosting){
              checkIfAllEndpointsExist(data.new_code)
            }

          } else if(queryType == "snippet"){
            setResponse(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(data.new_code) }} />)
          } else if(queryType == "selection"){
            //open window and confirm
            setResponse(
              <AIResponseWithChat 
                descriptionIn={"The selected code will be replaced with the following"}
                operationIn={data.new_code} 
                setResponse={setResponse} 
                historyIn={[{role: "user", content: promptQuery}, {role: "assistant", content: data.new_code}]}
                selectedText={selectedText}
              />)
          }

          return "Done";
        },
        error: "Failed",
      });
    }
  };


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

  const docOptions: {title: string, description: string, type: string, image: string, import?: string, link?: string}[] = [
    {
      "type": "link",
      "image": "popout",
      "link": "https://docs.swizzle.co",
      "title": "Documentation",
      "description": "Open the docs in a new tab",
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/create-a-user",
      "title": "Create a user",
      "import": "createUser",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let user = await createUser(optionalProperties, optionalRequestObject)</span><span class='hidden'>to create a new user santa</span>",
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/get-a-user",
      "title": "Get a user",
      "import": "getUser",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let user = await getUser(userId)</span><span class='hidden'>to get a specific user details by id</span>"
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/edit-a-user",
      "title": "Edit a user",
      "import": "editUser",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let user = await editUser(userId, properties)</span><span class='hidden'>to add properties and metadata to a user</span>"
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/search-users",
      "title": "Search users",
      "import": "searchUsers",
      "description": "<span class='hidden'>Search, find, or get all users based on their properties or metadata with</span><span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let userArray = await searchUsers(queryObject)</span>"
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/get-access-tokens",
      "title": "Get access tokens",
      "import": "signTokens",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let { accessToken, refreshToken } = await signTokens(userId, hoursToExpire)</span><span class='hidden'>to create new access tokens for a user</span>"
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/refresh-access-tokens",
      "title": "Refresh access tokens",
      "import": "refreshTokens",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let { accessToken, refreshToken } = refreshTokens(refreshToken)</span><span class='hidden'>to create new access tokens for a user from a refresh token<span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/save-a-file",
      "title": "Save a file",
      "import": "saveFile",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let unsignedUrl = await saveFile(fileName, fileData, isPrivate, allowedUserIds[])</span><span class='hidden'>to upload a file to storage</span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/get-a-file-url",
      "title": "Get a file URL",
      "import": "getFileUrl",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let signedUrl = await getFileUrl(unsignedUrl)</span><span class='hidden'>to get a public URL for a private file in storage</span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/delete-a-file",
      "title": "Delete a file",
      "import": "deleteFile",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let success = await deleteFile(unsignedUrl)</span><span class='hidden'>to delete a file from storage</span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/add-user-to-file",
      "title": "Add user to a file",
      "import": "addUserToFile",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let success = await addUserToFile(unsignedUrl, uid)</span><span class='hidden'>to allow a user to access an unsigned URL in storage with their accessToken</span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/remove-user-from-file",
      "title": "Remove user from file",
      "import": "removeUserFromFile",
      "description": "Use <span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let success = await removeUserFromFile(unsignedUrl, uid)</span><span class='hidden'>to remove a user's access to an unsigned URL in storage</span>"
    },
    {
      "type": "doc",
      "image": "database",
      "link": "https://docs.swizzle.co/database",
      "title": "Search the database",
      "import": "db",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let results = await db.collection('myCollectionName').find({ myKey: 'myValue' }).toArray();</span><span class='hidden'>to search find documents a document item in a collection database</span>"
    },
    {
      "type": "doc",
      "image": "database",
      "link": "https://docs.swizzle.co/database",
      "title": "Update the database",
      "import": "db",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let result = await db.collection('myCollectionName').updateOne({ myKeyToSearch: 'myValueToSearch' }, { $set: { myKeyToUpdate: 'myNewValue' } });</span><span class='hidden'>to updated change upsert modify values documents items in the database</span>"
    },
    {
      "type": "doc",
      "image": "database",
      "link": "https://docs.swizzle.co/database",
      "title": "Add to database",
      "import": "db",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let result = await db.collection('myCollectionName').insertOne(jsonDocument);</span><span class='hidden'>to add insert items documents into database</span>"
    },
    {
      "type": "doc",
      "image": "database",
      "link": "https://docs.swizzle.co/database",
      "title": "Count in database",
      "import": "db",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let result = await db.collection('myCollectionName').countDocuments({ myKeyToSearch: 'myValueToSearch' })</span><span class='hidden'>to count number of items documents in database</span>"
    },
    {
      "type": "doc",
      "image": "database",
      "link": "https://docs.swizzle.co/database",
      "title": "Delete from database",
      "import": "db",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let result = await db.collection('myCollectionName').deleteOne({ myKeyToSearch: 'myValueToSearch' })</span><span class='hidden'>to delete remove item from the database</span>"
    },
  ]

  const frontendDocOptions = [
    {
      "type": "link",
      "image": "popout",
      "link": "https://docs.swizzle.co",
      "title": "Documentation",
      "description": "Open the documentation in a new tab",
    },
    {
      "type": "externalDoc",
      "image": "auth",
      "link": "https://docs.swizzle.co/frontend/users/sign-in",
      "title": "Sign In",
      "import": "useSignIn",
      "importFrom": "react-auth-kit",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>const signIn = useSignIn()</span><span class='hidden'>to authenticate login signin sign in a user</span>"
    },
    {
      "type": "externalDoc",
      "image": "auth",
      "link": "https://docs.swizzle.co/frontend/users/sign-out",
      "title": "Sign Out",
      "import": "useSignOut",
      "importFrom": "react-auth-kit",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>const signOut = useSignOut()</span><span class='hidden'>to logout signout log out sign out a user</span>"
    },
    {
      "type": "externalDoc",
      "image": "auth",
      "link": "https://docs.swizzle.co/frontend/users/check-auth-status",
      "title": "Check Auth Status",
      "import": "useIsAuthenticated",
      "importFrom": "react-auth-kit",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>const isAuthenticated = useIsAuthenticated()</span><span class='hidden'>to check if a user is logged in signed in authenticated</span>"
    },
    {
      "type": "externalDoc",
      "image": "auth",
      "link": "https://docs.swizzle.co/frontend/users/get-user-data",
      "title": "Get User Data",
      "import": "useAuthUser",
      "importFrom": "react-auth-kit",
      "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>const auth = useAuthUser()</span><span class='hidden'>to get a uid userId id user data info</span>"
    },
  ]

  const swizzleActionOptions = [
    {
      "type": "action",
      "image": "save",      
      "title": "Save",
      "description": "Save changes to this file",
      "filter": ""
    },
    {
      "type": "action",
      "image": "preview",
      "title": "Preview",
      "description": "Open a preview this page",
      "filter": "frontend"
    },
    {
      "type": "action",
      "image": "wand",
      "title": "Autocheck",
      "description": "Automatically check for errors",
      "filter": ""
    },
    {
      "type": "action",
      "image": "packages",
      "title": "Packages",
      "description": "Install an NPM package",
      "filter": ""
    },
    {
      "type": "action",
      "image": "restart",
      "title": "Restart",
      "description": "Restart the server",
      "filter": ""
    },
    {
      "type": "action",
      "image": "beaker",
      "title": "Test",
      "description": "Test this endpoint",
      "filter": "backend"
    },
    {
      "type": "action",
      "image": "lock",
      "title": "Secrets",
      "description": "Manage secret environment variables",
      "filter": "backend"
    },
  ]

  const [suggestions, setSuggestions] = useState(docOptions);
  const onSuggestionsFetchRequested = ({ value }) => {
    const ai_options = [
      {
        "type": "ai",
        "image": "ai_selection",
        "title": value,
        "description": "Ask AI to update selected code",
        "ai_type": -1
      },
      {
        "type": "ai",
        "image": "wand",
        "title": value,
        "description": "Ask AI",
        "ai_type": 0
      },
    ]

    const db_ai_options = [
      {
        "type": "ai",
        "image": "ai_snippet",
        "title": value,
        "description": "Ask AI",
        "ai_type": 2,
      },
    ]

    if(selectedTab == Page.Apis){
      const actions = swizzleActionOptions.filter((action) => (action.title.toLowerCase().includes(value.toLowerCase()) || action.description.toLowerCase().includes(value.toLowerCase())) && (action.filter == "" || action.filter == "backend") ).slice(0, 1)
      const docs = docOptions.filter((doc) => doc.title.toLowerCase().includes(value.toLowerCase()) || doc.description.toLowerCase().includes(value.toLowerCase())).slice(0, 1)
      setSuggestions([...ai_options, ...actions, ...docs])
    } else if(selectedTab == Page.Hosting){
      const actions = swizzleActionOptions.filter((action) => (action.title.toLowerCase().includes(value.toLowerCase()) || action.description.toLowerCase().includes(value.toLowerCase())) && (action.filter == "" || action.filter == "frontend") ).slice(0, 1)
      const docs = frontendDocOptions.filter((doc) => doc.title.toLowerCase().includes(value.toLowerCase()) || doc.description.toLowerCase().includes(value.toLowerCase())).slice(0, 1)
      const filteredList = fullEndpointList.filter(endpoint => endpoint.includes(value)).map((endpoint) => {
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
        {(suggestions.some(s => s.type == "action") && suggestion.ai_type == 0) &&
          <div className="">
            <div style={{height: "1px"}} className="w-full mt-0 bg-gray-500" />
            <div className="mt-2 pl-3 pr-3 pb-1 text-sm opacity-70">Swizzle Actions</div>
          </div>
        }
         {(suggestions.some(s => s.type == "doc" || s.type == "externalDoc"  || s.type == "link") && !suggestions.some(s => s.type == "action")) &&
          <div className="">
            <div style={{height: "1px"}} className="w-full mt-0 bg-gray-500" />
            <div className="mt-2 pl-3 pr-3 pb-1 text-sm opacity-70">Documentation</div>
          </div>
        }
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
        {(suggestions.some(s => s.type == "doc" || s.type == "externalDoc"  || s.type == "link")) &&
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
    console.log("selectedText", selectedText, isWaitingForText)
    if(selectedText && isWaitingForText){
      setIsWaitingForText(false)
      console.log("selectedText", selectedText)
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
      } else if(suggestion.ai_type == 1){
        // runQuery(suggestion.title, "edit")
      } else if(suggestion.ai_type == 2){
        runQuery(suggestion.title, "db")
      }
    } else{
      if(suggestion.type == "endpoint"){
        setPostMessage({type: "upsertImport", content: 'import api from "../Api";\n', importStatement: 'import api from "../Api";'})
        copyText(`const result = await api.${suggestion.method.toLowerCase()}("${suggestion.fullPath}")`)
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
        var newImportStatement = currentFileProperties.importStatement;
        newImportStatement = modifySwizzleImport(newImportStatement, suggestion.import, 'add');
        const message = {
          findText: currentFileProperties.importStatement,
          replaceText: newImportStatement,
          type: "findAndReplace",
        };
        setPostMessage(message);
        setCurrentFileProperties({...currentFileProperties, importStatement: newImportStatement})
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

  return (
    <>
        <div className="flex-col magic-bar">
          <div
            className={`flex justify-between mb-2 text-lg font-bold pt-4 max-h-[52px] ${
              (ideReady || (selectedTab != Page.Hosting && selectedTab != Page.Apis)) ? "" : "opacity-50 pointer-events-none"
            }`}
          >
            <div className="ml-4"></div>

            {/* Search shows on frontend and backend tabs */}
            <Button
              className={`text-sm px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border ${selectedTab == Page.Apis || selectedTab == Page.Hosting ? "" : "hidden"}`}
              children={<FontAwesomeIcon icon={isSearching ? faXmark : faSearch} />}
              onClick={() => {
                toggleSearch()
              }}
            />
            {/* Debug shows on backend tab */}
            <Button
              className={`text-sm ml-3 px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border ${selectedTab == Page.Apis ? "" : "hidden"}`}
              children={<FontAwesomeIcon icon={isDebugging ? faXmark : faBug} />}
              onClick={() => {
                toggleDebug()
              }}
            />
            <div className={`w-[1px] h-[36px] bg-[#525363] mx-4 ${selectedTab == Page.Db ? "hidden" : ""}`}></div>
            {/* Undo shows only when isUndoVisible is true */}
            {isUndoVisible && (
              <Button
                className={`text-sm mr-3 px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border`}
                children={<FontAwesomeIcon icon={faUndo} />}
                onClick={() => {
                  undoLastChange()
                }}
              />
            )}

            <div className={`grow ${selectedTab == Page.Db ? "mr-32" : ""}`}>
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
                      console.log("highlighted", highlighted)
                      if(!highlighted){
                        runQuery(prompt, "edit")
                      }
                      setPrompt("")
                      return
                    }
                  },
                  placeholder: `${selectedTab == Page.Apis || selectedTab == Page.Hosting ? "Update code with AI" : selectedTab == Page.Db ? "Cmd + K: search and update your database" : ""}`,
                  value: prompt,
                  onChange: onPromptChange,
                  onFocus: () => { setPostMessage({type: "getSelectedText"}) },
                  className: "grow mx-2 ml-0 mr-0 bg-[#252629] border-[#525363] border rounded font-sans text-sm font-normal outline-0 focus:bg-[#28273c] focus:border-[#4e52aa] p-2",
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
    </>
  );
}
