import { ReactNode, useContext, useEffect, useState } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method } from "../../Utilities/Method";
import Button from "../../Utilities/Button";
import Dropdown from "../../Utilities/Dropdown";
import { copyText } from "../../Utilities/Copyable";
import useEndpointApi from "../../API/EndpointAPI";
import toast from "react-hot-toast";
import FloatingModal from "../../Utilities/FloatingModal";
import { replaceCodeBlocks } from "../../Utilities/DataCaster";

export default function EndpointHeader() {
  const { activeEndpoint, ideReady } = useContext(SwizzleContext);
  const [method, setMethod] = useState<Method>(Method.GET);
  const [path, setPath] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [AICommand, setAICommand] = useState<string>("edit");
  const [response, setResponse] = useState<ReactNode | undefined>(null);

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
    { id: "edit", name: "Edit" },
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
        }
        return "Done";
      },
      error: "Error generating code",
    });
  };

  return (
    <>
      {activeEndpoint && (
        <div className="flex-col">
          <div
            className={`flex justify-between mb-2 text-lg font-bold pt-4 max-h-[52px] ${
              ideReady ? "" : "opacity-50 pointer-events-none"
            }`}
          >
            <Dropdown
              className="ml-4 "
              onSelect={setAICommand}
              children={aiOptions}
              direction="left"
              title={aiOptions.filter((n) => n.id == AICommand)[0].name}
            />

            <input
              className="grow mx-4 bg-transparent border-[#525363] border rounded-md font-sans text-sm font-normal outline-0 focus:border-[#68697a] p-2"
              placeholder={
                AICommand == "ask"
                  ? "Ask any question..."
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
          </div>
        </div>
      )}

      <FloatingModal
        content={response}
        closeModal={() => {
          setResponse(null);
        }}
      />
    </>
  );
}
