import { faBug, faNewspaper, faSearch, faWandMagicSparkles, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useEffect, useState } from "react";
import Autosuggest from 'react-autosuggest';
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import Button from "../../Utilities/Button";
import { replaceCodeBlocks } from "../../Utilities/DataCaster";
import FloatingModal from "../../Utilities/FloatingModal";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method } from "../../Utilities/Method";

export default function EndpointHeader() {
  const { activeEndpoint, ideReady, setPostMessage } = useContext(SwizzleContext);
  const [method, setMethod] = useState<Method>(Method.GET);
  const [path, setPath] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [AICommand, setAICommand] = useState<string>("ask");
  const [response, setResponse] = useState<ReactNode | undefined>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);

  const { askQuestion } = useEndpointApi();

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

  const docOptions: {title: string, description: string, type: string, link?: string}[] = [
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/users/create-a-user",
      "title": "Create a user",
      "description": "Use <span class='font-mono text-xs'>user = await createUser(properties?, request?)</span> to create a new user",
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/users/get-a-user",
      "title": "Get a user",
      "description": "Use <span class='font-mono text-xs'>user = await getUser(userId)</span> to get a specific user details by id"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/users/edit-a-user",
      "title": "Edit a user",
      "description": "Use <span class='font-mono text-xs'>user = await editUser(userId, properties)</span> to edit a user's details by id"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/users/search-users",
      "title": "Search users",
      "description": "Search and find users based on their properties with <span class='font-mono text-xs'>userArray = await searchUsers(queryObject)</span>"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/users/get-access-tokens",
      "title": "Get access tokens",
      "description": "Use <span class='font-mono text-xs'>{ accessToken, refreshToken } = await signTokens(userId, hours?)</span> to create new access tokens for a user"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/users/refresh-access-tokens",
      "title": "Refresh access tokens",
      "description": "Use <span class='font-mono text-xs'>{ accessToken, refreshToken } = refreshTokens(refreshToken)</span> to create new access tokens for a user from a refresh token"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/storage/save-a-file",
      "title": "Save a file",
      "description": "Use <span class='font-mono text-xs'>unsignedUrl = await saveFile(fileName, fileData, isPrivate, allowedUserIds[])</span> to upload a file to storage"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/storage/get-a-file-url",
      "title": "Get a file URL",
      "description": "Use <span class='font-mono text-xs'>signedUrl = await getFileUrl(unsignedUrl)</span> to get a public URL for a private file"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/storage/delete-a-file",
      "title": "Delete a file",
      "description": "Use <span class='font-mono text-xs'>success = await deleteFile(unsignedUrl)</span> to delete a file from storage"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/storage/add-user-to-file",
      "title": "Add user to a file",
      "description": "Use <span class='font-mono text-xs'>success = await addUserToFile(unsignedUrl, uid)</span> to allow a user to access an unsigned URL with their accessToken"
    },
    {
      "type": "doc",
      "link": "https://docs.swizzle.co/storage/remove-user-from-file",
      "title": "Remove user from file",
      "description": "Use <span class='font-mono text-xs'>success = await removeUserFromFile(unsignedUrl, uid)</span> to remove a user's access to an unsigned URL"
    },
  ]

  const [suggestions, setSuggestions] = useState(docOptions);
  const onSuggestionsFetchRequested = ({ value }) => {
    const docs = docOptions.filter((doc) => doc.title.toLowerCase().includes(value.toLowerCase()) || doc.description.toLowerCase().includes(value.toLowerCase()))
    const ai = {
      "type": "ai",
      "title": `\"${value}\"`,
      "description": "Prompt the AI to generate a response using the entire codebase",
    }
    setSuggestions([ai, ...docs])
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions(docOptions)
  };

  const getSuggestionValue = suggestion => suggestion.title;

  const renderSuggestion = suggestion => {
    if(suggestion.type == "doc"){
      return(
        <div className="w-full p-2 hover:bg-[#85869877] rounded cursor-pointer">
          <div className="font-bold text-sm">
            <FontAwesomeIcon 
              icon={faNewspaper}
              className="mr-2 w-4 h-4"
            />
            {suggestion.title}
          </div>
          <div className="text-sm font-normal" dangerouslySetInnerHTML={{__html: suggestion.description}}>
          </div>
        </div>
      )
    } else if(suggestion.type == "ai"){
      return(
        <div className="w-full p-2 hover:bg-[#85869877] rounded cursor-pointer">
          <div className="font-bold text-sm">
            <FontAwesomeIcon 
              icon={faWandMagicSparkles}
              className="mr-2 w-4 h-4"
            />
            {suggestion.title}
          </div>
          <div className="text-sm font-normal">
            {suggestion.description}
          </div>
        </div>
      )
    }
  };

  const renderSuggestionsContainer = ({ containerProps, children, query }) => (
    <div {...containerProps} className={`fixed mr-8 z-50 overflow-scroll bg-[#2e2f39] rounded mt-2 p-2 ${(query.length < 2 || suggestions.length == 0) && "hidden"}`}>
      {children}
    </div>
  );
  const onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    console.log("selected", suggestion)
    if(suggestion.type == "ai"){
      runQuery(suggestion.title)
    } else{
      window.open(suggestion.link, "_blank")
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
              className={`text-sm ml-2 px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border`}
              children={<FontAwesomeIcon icon={isDebugging ? faXmark : faBug} />}
              onClick={() => {
                toggleDebug()
              }}
            />
            <div className="w-[1px] h-[36px] bg-[#525363] mx-4"></div>
            {/* <Dropdown
              className=""
              onSelect={setAICommand}
              children={aiOptions}
              direction="left"
              title={aiOptions.filter((n) => n.id == AICommand)[0].name}
            /> */}


{/* OLD INPUT */}
            {/* <input
              className="grow mx-2 ml-0 bg-transparent border-[#525363] border rounded-md font-sans text-sm font-normal outline-0 focus:border-[#68697a] p-2"
              placeholder={
                AICommand == "ask"
                  ? "Ask any question about your project..."
                  : AICommand == "edit"
                  ? "Change this code to..."
                  : "Create a new endpoint that..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(event) => {
                if (event.key == "Enter") {
                  runQuery();
                }
              }}
            /> */}

            <div className="grow">
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                renderSuggestionsContainer={renderSuggestionsContainer}
                onSuggestionSelected={onSuggestionSelected}
                shouldRenderSuggestions={() => { return prompt != "" }}
                inputProps={{
                  onKeyDown: (event) => {
                    if(event.key == "Enter"){
                      runQuery(prompt)
                      setPrompt("")
                      return
                    }
                  },
                  placeholder: "Type to search...",
                  value: prompt,
                  onChange: onPromptChange,
                  className: "grow mx-2 ml-0 mr-0 bg-transparent border-[#525363] border rounded-md font-sans text-sm font-normal outline-0 focus:border-[#68697a] p-2",
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
