import { faBug, faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import { 
  Button,
  Dropdown,
  FloatingModal,
} from '@Components';
import { replaceCodeBlocks } from '@Utilities'
import { SwizzleContext } from '@Store'
import { Method } from '@Types';

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

  const getSnippetForLanguage = (language: string) => {
    if (language == "swift") {
      return `let result = await Swizzle.shared.${method.toLowerCase()}("${path}", parameters: [:])`;
    } else if (language == "js") {
      return `const result = await Swizzle.${method.toLowerCase()}("${path}")`;
    }
  };

  const aiOptions = [
    // { id: "edit", name: "Edit" },
    { id: "ask", name: "Answer" },
    // { id: "create", name: "Create" },
  ];

  const runQuery = async () => {
    return toast.promise(askQuestion(prompt, AICommand), {
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
            <Dropdown
              className=""
              onSelect={setAICommand}
              children={aiOptions}
              direction="left"
              title={aiOptions.filter((n) => n.id == AICommand)[0].name}
            />

            <input
              className="grow mx-2 bg-transparent border-[#525363] border rounded-md font-sans text-sm font-normal outline-0 focus:border-[#68697a] p-2"
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
            />
            <Button
              text="Go"
              className="text-sm px-5 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
              onClick={() => {
                runQuery();
              }}
            />
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
