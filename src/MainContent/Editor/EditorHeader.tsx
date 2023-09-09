import { useContext, useEffect, useState } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method } from "../../Utilities/Method";
import Button from "../../Utilities/Button";
import Dropdown from "../../Utilities/Dropdown";
import { copyText } from "../../Utilities/Copyable";

export default function EndpointHeader() {
  const methodToColor = (method: Method) => {
    switch (method) {
      case Method.GET:
        return "text-green-400";
      case Method.POST:
        return "text-blue-400";
      case Method.PUT:
        return "text-yellow-400";
      case Method.DELETE:
        return "text-red-400";
      case Method.PATCH:
        return "text-purple-400";
    }
  };

  const {activeEndpoint} = useContext(SwizzleContext);
  const [method, setMethod] = useState<Method>(Method.GET);
  const [path, setPath] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    if(activeEndpoint == undefined) return;
    const splitEndpoint = activeEndpoint.split("/");
    setMethod(splitEndpoint[0].toUpperCase() as Method);
    setPath("/" + splitEndpoint[1] || "");
  }, [activeEndpoint]);

  const getSnippetForLanguage = (language: string) => {
    if(language == "swift") {
      return `let result = await Swizzle.shared.${method.toLowerCase()}("${path}", parameters: [:])`
    } else if(language == "js") {
      return `const result = await Swizzle.${method.toLowerCase()}("${path}")`
    }
  }

  return (
    <>
    {activeEndpoint &&
      <div className={`flex justify-between ml-4 mb-2 text-lg font-bold font-mono pt-4 max-h-[52px]`}>
          <input
            className="grow mr-4 bg-transparent border-[#525363] border rounded-md font-sans text-sm font-normal outline-0 focus:border-[#68697a] p-2"
            placeholder="Ask for anything related to this code"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            className="px-5 py-1 font-medium rounded font-sans text-sm flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
            text="Ask to edit code"
            onClick={() => {
              console.log("send");
            }}
          />

          <Button
            className="ml-4 px-5 py-1 font-medium rounded font-sans text-sm flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
            text="Ask for a response"
            onClick={() => {
              console.log("send");
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
    }
    </>
  );
}
