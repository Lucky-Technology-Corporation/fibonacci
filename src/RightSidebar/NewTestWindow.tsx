import Button from "../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState } from "react";
import InputWithPrefix from "../Utilities/InputWithPrefix";
import { SwizzleContext } from "../Utilities/GlobalContext";

export default function NewTestWindow({
  shouldShowTestWindow,
  hideTestWindow,
  savedTests,
}: {
  shouldShowTestWindow: boolean;
  hideTestWindow: () => void;
  savedTests?: string[];
}) {

  
  const [testName, setTestName] = useState("");
  const [queryParameters, setQueryParameters] = useState("");
  const [userId, setUserId] = useState("");
  const [body, setBody] = useState("");
  const {activeEndpoint} = useContext(SwizzleContext);
  const myRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      console.log("click outside")
      if (myRef.current && !myRef.current.contains(event.target)) {
        hideTestWindow()
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const saveTest = () => {
  };

  return (
    <div
      className={`z-50 absolute w-[500px] mr-[315px] bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        shouldShowTestWindow ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        marginTop: "-8px"
      }}
      ref={myRef}
    > 

    <div className="flex flex-col justify-between px-4 py-2 pb-4 mt-2">

      <div className="absolute top-0 right-0 m-2">
        <FontAwesomeIcon
          icon={faXmark}
          className="h-6 w-6 text-[#525363] cursor-pointer hover:text-[#D9D9D9]"
          onClick={hideTestWindow}
        />
      </div>


      <div className="flex w-full mb-2 mt-4">
        <input
            type="text"
            className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] mr-2"          
            placeholder={"Test Name"}
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
          <Button text="Save" onClick={hideTestWindow} />
      </div>
  <div className="font-bold my-2 text-md">Query Parameters</div>
    <div className="flex w-full mb-2">
      <InputWithPrefix
        prefix={"/" + (activeEndpoint.split("/")[1] || "") + "?"}
        className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
        placeholder="key=value&key2=value2"
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
    <div className="font-bold my-2">User ID (optional)</div>
    <div className="flex w-full mb-2">
      <input
        type="text"
        className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
        placeholder="507f1f77bcf86cd799439011"
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
    <div className="font-bold my-2 text-md">Body</div>
    <div className="flex w-full mb-2 h-32">
      <textarea
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

    {/* <Button text="Save" onClick={hideTestWindow} /> */}
  </div>
</div>

  );
}
