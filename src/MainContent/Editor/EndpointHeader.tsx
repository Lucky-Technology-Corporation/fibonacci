import { faBug, faSearch, faWandMagicSparkles, faXmark } from "@fortawesome/free-solid-svg-icons";
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

export default function EndpointHeader({selectedTab, currentFileProperties, setCurrentFileProperties}: {selectedTab: Page, currentFileProperties: any, setCurrentFileProperties: any}) {
  const { activeEndpoint, ideReady, setPostMessage, fullEndpointList } = useContext(SwizzleContext);
  const [method, setMethod] = useState<Method>(Method.GET);
  const [path, setPath] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [AICommand, setAICommand] = useState<string>("ask");
  const [response, setResponse] = useState<ReactNode | undefined>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);


  const { askQuestion } = useEndpointApi();

  useEffect(() => {
    console.log(selectedTab)
  }, [])

  useEffect(() => {
    if (activeEndpoint == undefined) return;
    const splitEndpoint = activeEndpoint.split("/");
    setMethod(splitEndpoint[0].toUpperCase() as Method);
    setPath("/" + splitEndpoint[1] || "");
  }, [activeEndpoint]);


  const runQuery = async (promptQuery: string) => {
    return toast.promise(askQuestion(promptQuery, AICommand), {
      loading: "Looking through your project...",
      success: (data) => {
        if (data == null) {
          return "Something went wrong";
        }
        if (data.recommendation_text != undefined && data.recommendation_text != "") {
          setResponse(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(data.recommendation_text) }} />);
        }
        if (data.recommendation_code != undefined && data.recommendation_code != "") {
          setPostMessage({ type: "replaceText", code: data.recommendation_code });
        }
        return "Done";
      },
      error: "Error generating code",
    });
  };

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
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/create-a-user",
      "title": "Create a user",
      "import": "createUser",
      "description": "<span class='font-mono cursor-pointer text-xs'>let user = await createUser(optionalProperties, optionalRequestObject)</span><span class='hidden'>to create a new user santa</span>",
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/get-a-user",
      "title": "Get a user",
      "import": "getUser",
      "description": "<span class='font-mono cursor-pointer text-xs'>let user = await getUser(userId)</span><span class='hidden'>to get a specific user details by id</span>"
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/edit-a-user",
      "title": "Edit a user",
      "import": "editUser",
      "description": "<span class='font-mono cursor-pointer text-xs'>let user = await editUser(userId, properties)</span><span class='hidden'>to add properties and metadata to a user</span>"
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/search-users",
      "title": "Search users",
      "import": "searchUsers",
      "description": "<span class='hidden'>Search, find, or get all users based on their properties or metadata with</span><span class='font-mono cursor-pointer text-xs'>let userArray = await searchUsers(queryObject)</span>"
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/get-access-tokens",
      "title": "Get access tokens",
      "import": "signTokens",
      "description": "<span class='font-mono cursor-pointer text-xs'>let { accessToken, refreshToken } = await signTokens(userId, hoursToExpire)</span><span class='hidden'>to create new access tokens for a user</span>"
    },
    {
      "type": "doc",
      "image": "auth",
      "link": "https://docs.swizzle.co/users/refresh-access-tokens",
      "title": "Refresh access tokens",
      "import": "refreshTokens",
      "description": "<span class='font-mono cursor-pointer text-xs'>let { accessToken, refreshToken } = refreshTokens(refreshToken)</span><span class='hidden'>to create new access tokens for a user from a refresh token<span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/save-a-file",
      "title": "Save a file",
      "import": "saveFile",
      "description": "<span class='font-mono cursor-pointer text-xs'>let unsignedUrl = await saveFile(fileName, fileData, isPrivate, allowedUserIds[])</span><span class='hidden'>to upload a file to storage</span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/get-a-file-url",
      "title": "Get a file URL",
      "import": "getFileUrl",
      "description": "<span class='font-mono cursor-pointer text-xs'>let signedUrl = await getFileUrl(unsignedUrl)</span><span class='hidden'>to get a public URL for a private file in storage</span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/delete-a-file",
      "title": "Delete a file",
      "import": "deleteFile",
      "description": "<span class='font-mono cursor-pointer text-xs'>let success = await deleteFile(unsignedUrl)</span><span class='hidden'>to delete a file from storage</span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/add-user-to-file",
      "title": "Add user to a file",
      "import": "addUserToFile",
      "description": "<span class='font-mono cursor-pointer text-xs'>let success = await addUserToFile(unsignedUrl, uid)</span><span class='hidden'>to allow a user to access an unsigned URL in storage with their accessToken</span>"
    },
    {
      "type": "doc",
      "image": "files",
      "link": "https://docs.swizzle.co/storage/remove-user-from-file",
      "title": "Remove user from file",
      "import": "removeUserFromFile",
      "description": "Use <span class='font-mono cursor-pointer text-xs'>let success = await removeUserFromFile(unsignedUrl, uid)</span><span class='hidden'>to remove a user's access to an unsigned URL in storage</span>"
    },
  ]

  const [suggestions, setSuggestions] = useState(docOptions);
  const onSuggestionsFetchRequested = ({ value }) => {
    const ai = {
      "type": "ai",
      "image": "wand",
      "title": `Prompt AI: \"${value}\"`,
      "description": "Ask GPT (full project access)",
    }

    if(selectedTab == Page.Apis){
      const docs = docOptions.filter((doc) => doc.title.toLowerCase().includes(value.toLowerCase()) || doc.description.toLowerCase().includes(value.toLowerCase()))
      setSuggestions([ai, ...docs])
    } else if(selectedTab == Page.Hosting){
      const filteredList = fullEndpointList.filter(endpoint => endpoint.includes(value)).map((endpoint) => {
        const parsedEndpoint = new ParsedActiveEndpoint(endpoint)
        return {type: "endpoint", ...parsedEndpoint}
      })
      setSuggestions([ai, ...filteredList])
    }
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions(docOptions)
  };

  const getSuggestionValue = suggestion => suggestion.title;

  const renderSuggestion = (suggestion, { query, isHighlighted }) => {
    console.log("render", suggestion)
    if(suggestion.type == "doc"){
      return(
        <div className={`w-full p-2 pl-3 hover:bg-[#393939] ${isHighlighted && "bg-[#393939]" } cursor-pointer`}>
          <div className="font-bold text-sm flex">
          <img 
              src={`/${suggestion.image}.svg`}
              className="mr-1 w-4 h-4 my-auto"
            />
            <div>{suggestion.title}</div>
          </div>
          <div className="text-sm font-normal mt-0.5" dangerouslySetInnerHTML={{__html: suggestion.description}}>
          </div>
        </div>
      )
    } else if(suggestion.type == "ai"){
      return(
        <div className={`w-full p-2 pl-3 hover:bg-[#393939] ${isHighlighted && "bg-[#393939]" } cursor-pointer`}>
          <div className="font-normal text-sm">
            <FontAwesomeIcon 
              icon={faWandMagicSparkles}
              className="mr-1 w-4 h-4"
            />
            {suggestion.title}
          </div>
          {/* <div className="text-xs font-normal mt-0.5">
            {suggestion.description}
          </div> */}
        </div>
      )
    } else if(suggestion.type == "endpoint"){
      return(
        <div className={`w-full p-2 pl-3 hover:bg-[#393939] ${isHighlighted && "bg-[#393939]" } cursor-pointer`}>
          <div className="font-mono text-xs flex">
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
    }
  };

  const renderSuggestionsContainer = ({ containerProps, children, query }) => (
    <div {...containerProps} className={`fixed mr-8 z-50 overflow-scroll bg-[#252629] border border-[#68697a] rounded mt-2 p-0 ${(query.length == 0 || suggestions.length == 0) && "hidden"}`}>
      {children}
    </div>
  );
  const onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    console.log("selected", suggestion)
    if(suggestion.type == "ai"){
      runQuery(suggestion.title)
    } else{
      if(suggestion.type == "endpoint"){
        setPostMessage({type: "upsertImport", content: 'import api from "../Api";\n'})
        copyText(`const result = await api.${suggestion.method.toLowerCase()}("${suggestion.fullPath}")`)
      } else if(suggestion.type == "doc"){
        const copyable = suggestion.description.split("text-xs'>")[1].split("</span>")[0]
        copyText(copyable)

        var newImportStatement = currentFileProperties.importStatement;
        newImportStatement = modifySwizzleImport(newImportStatement, suggestion.import, 'add');
        const message = {
          findText: currentFileProperties.importStatement,
          replaceText: newImportStatement,
          type: "findAndReplace",
        };
        setPostMessage(message);
        setCurrentFileProperties({...currentFileProperties, importStatement: newImportStatement})
      }
    }
    setPrompt("")
  }
  const onPromptChange = (event, { newValue }) => {
    setPrompt(newValue);
  }

  return (
    <>

        <div className="flex-col">
          <div
            className={`flex justify-between mb-2 text-lg font-bold pt-4 max-h-[52px] ${
              ideReady ? "" : "opacity-50 pointer-events-none"
            }`}
          >
            <div className="ml-4"></div>
            <Button
              className={`text-sm px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border`}
              children={<FontAwesomeIcon icon={isSearching ? faXmark : faSearch} />}
              onClick={() => {
                toggleSearch()
              }}
            />
            <Button
              className={`text-sm ml-3 px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border ${selectedTab == Page.Apis ? "" : "hidden"}`}
              children={<FontAwesomeIcon icon={isDebugging ? faXmark : faBug} />}
              onClick={() => {
                toggleDebug()
              }}
            />
            <div className="w-[1px] h-[36px] bg-[#525363] mx-4"></div>

            <div className="grow">
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                renderSuggestionsContainer={renderSuggestionsContainer}
                onSuggestionSelected={onSuggestionSelected}
                shouldRenderSuggestions={() => { return true }}
                highlightFirstSuggestion={true}
                inputProps={{
                  onKeyDown: (event) => {
                    if(event.key == "Enter"){
                      setPrompt("")
                      return
                    }
                  },
                  placeholder: `${selectedTab == Page.Apis ? "Connect users, files, and more" : "Connect endpoints, components, and more"}...`,
                  value: prompt,
                  onChange: onPromptChange,
                  className: "grow mx-2 ml-0 mr-0 bg-[#252629] border-[#525363] border rounded-md font-sans text-sm font-normal outline-0 focus:border-[#68697a] p-2",
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
