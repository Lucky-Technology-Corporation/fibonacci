import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useEffect, useState } from "react";

const BodyInfo = ({ className, placeholder, value, onChange, show }) => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      JSON.parse(value);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
    }
  }, [value]);
  return (
    <div className={`mt-2 flex flex-col ${className} ${show ? "opacity-100 h-32" : "opacity-0 h-0"}`}>
      <CodeEditor
        className={className}
        placeholder="{ }"
        value={value}
        onChange={onChange}
        data-color-mode="dark"
        style={{
          fontSize: 12,
          fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          borderRadius: 4,
          border: "1px solid #525363",
          maxHeight: "50vh",
          overflow: "scroll",
        }}
        language="json"
      />
      <div className="my-auto mt-2">
        {isValid ? (
          <div className="flex">
            <CheckIcon className="w-6 h-6 mr-1 text-green-400" />
            <div className="text-base text-green-400">Valid JSON</div>
          </div>
        ) : (
          <div className="flex">
            <XMarkIcon className="w-6 h-6 mr-1 text-red-400" />
            <div className="text-base text-red-400">Invalid JSON</div>
          </div>
        )}
      </div>
    </div>
  );
};
export default BodyInfo;
