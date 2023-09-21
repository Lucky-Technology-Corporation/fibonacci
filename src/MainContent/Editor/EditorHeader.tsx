import { useContext, useEffect, useState } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method } from "../../Utilities/Method";
import Button from "../../Utilities/Button";
import Dropdown from "../../Utilities/Dropdown";
import { copyText } from "../../Utilities/Copyable";
import useApi from "../../API/EndpointAPI";
import toast from "react-hot-toast";

export default function EndpointHeader() {
  const { activeEndpoint, ideReady } = useContext(SwizzleContext);
  const [method, setMethod] = useState<Method>(Method.GET);
  const [path, setPath] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [AICommand, setAICommand] = useState<string>("ask");

  const { askQuestion } = useApi();

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

  const runQuery = async () => {
    return toast.promise(askQuestion(prompt, AICommand), {
      loading: "Generating code...",
      success: (data) => {
        console.log(data);
        return "Done";
      },
      error: "Error generating code",
    });
  };

  return (
    <>
      {activeEndpoint && (
        <div
          className={`flex justify-between mb-2 text-lg font-bold pt-4 max-h-[52px] ${
            ideReady ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          <Dropdown
            className="ml-4 "
            onSelect={setAICommand}
            children={[
              { id: "ask", name: "Ask" },
              { id: "create", name: "Create" },
              { id: "edit", name: "Edit" },
            ]}
            direction="right"
            title={AICommand.charAt(0).toUpperCase() + AICommand.slice(1)}
          />

          <input
            className="grow mx-4 bg-transparent border-[#525363] border rounded-md font-sans text-sm font-normal outline-0 focus:border-[#68697a] p-2"
            placeholder={AICommand == "ask" ? "Ask any question..." : "Change this code to..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <Button
            className="px-5 py-1 font-medium rounded font-sans text-sm flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
            text="Go"
            onClick={() => {
              runQuery();
            }}
          />

          <div>
            {/* <Dropdown
            className="text-xs font-sans"
            children={[{id: "swift", name: "Swift"}, {id: "js", name: "JavaScript"}]}
            title="Frontend Code"
            onSelect={(option) => {
              const snippet = getSnippetForLanguage(option);
              copyText(snippet)
            }}
          /> */}
          </div>
        </div>
      )}
    </>
  );
}
