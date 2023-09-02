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
      <div className={`flex justify-between ml-8 mb-2 text-lg font-bold font-mono`}>
        <div className="flex">
          <span className={`${methodToColor(method)} mr-2`}>{method}</span>{" "}
          {path}
        </div>
        <div>
          <Dropdown
            className="text-xs font-sans"
            children={[{id: "swift", name: "Swift"}, {id: "js", name: "JavaScript"}]}
            title="Code Snippet"
            onSelect={(option) => {
              const snippet = getSnippetForLanguage(option);
              copyText(snippet)
            }}
          />
        </div>
      </div>
    }
    </>
  );
}
