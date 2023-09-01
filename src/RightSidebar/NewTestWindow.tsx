import Button from "../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function NewTestWindow({
  shouldShowTestWindow,
  hideTestWindow,
  savedTests,
  isLarge = false,
  position,
}: {
  shouldShowTestWindow: boolean;
  hideTestWindow: () => void;
  savedTests?: string[];
  isLarge?: boolean;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
}) {
  const getMargin = () => {
    var pixels = isLarge ? 608 : 358;
    switch (position) {
      case "top-left":
        return `-${pixels}px`;
      case "top-right":
        return `${0}px`;
      case "bottom-left":
        return `-${pixels}px`;
      case "bottom-right":
        return `${0}px`;
      case "bottom-center":
        return `-${pixels / 2}px`;
      default:
        return `-${pixels}px`;
    }
  };

  const getTopMargin = () => {
    switch (position) {
      case "top-left":
        return "-28px";
      case "top-right":
        return "-28px";
      case "bottom-left":
        return "2px";
      case "bottom-right":
        return "2px";
      case "bottom-center":
        return "2px";
      default:
        return "-28px";
    }
  };

  const [testName, setTestName] = useState("");
  const [queryParameters, setQueryParameters] = useState("");
  const [userId, setUserId] = useState("");
  const [body, setBody] = useState("");


    const saveTest = () => {
    };

  return (
    <div
      className={`z-50 absolute ${
        isLarge ? "w-[450px]" : "w-[450px]"
      } bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        shouldShowTestWindow ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        marginLeft: getMargin(),
        marginTop: getTopMargin(),
      }}
      onMouseLeave={hideTestWindow}
    >

        <div className="flex flex-col justify-between px-4 py-2 pb-4">
        <div className="font-bold mb-2 text-md">Test Name</div>

        <div className={`flex h-8 w-full mb-2`}>
      <input
          type="text"
          className="text-s flex-grow p-2 bg-transparent mr-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]"
         
          placeholder={""}
          value={testName}
          onChange={(e) => {
            setTestName(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              saveTest();
            }
          }}
        />
        <Button text="Run" onClick={hideTestWindow} />
      </div>
  <div className="font-bold mb-2 mt-4 text-md">Query Parameters</div>
    <div className="flex w-full mb-2">
      <input
        type="text"
        className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
        placeholder=""
        value={queryParameters}
        onChange={(e) => {
          setQueryParameters(e.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            saveTest();
          }
        }}
      />
    </div>
    <div className="font-bold mb-2 mt-4">User ID (optional)</div>

    <div className="flex w-full mb-2">
        
      <input
        type="text"
        className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
        placeholder=""
        value={userId}
        onChange={(e) => {
          setUserId(e.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            saveTest();
          }
        }}
      />
    </div>
    <div className="font-bold mb-2 mt-4 text-md">Body</div>

    <div className="flex w-full mb-2 h-32">
      <input
        type="text"
        className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
        placeholder="{ }"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            saveTest();
          }
        }}
      />
    </div>
  </div>
</div>

  );
}
