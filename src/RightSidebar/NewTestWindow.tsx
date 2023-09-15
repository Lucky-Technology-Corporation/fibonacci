import Button from "../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState } from "react";
import InputWithPrefix from "../Utilities/InputWithPrefix";
import { SwizzleContext } from "../Utilities/GlobalContext";
import useTestApi from "../API/TestingAPI";
import e from "express";

export default function NewTestWindow({
  id,
  testTitle,
  savedQueryParameters,
  savedUserId,
  savedBody,
  shouldShowNewTestWindow,
  hideNewTestWindow,
  savedTests,
}: {
  id?: string;
  testTitle?: string;
  savedQueryParameters?: string;
  savedUserId?: string;
  savedBody?: string;
  shouldShowNewTestWindow: boolean;
  hideNewTestWindow: any;
  savedTests?: string[];
}) {
  const [testName, setTestName] = useState(testTitle || "");
  const [queryParameters, setQueryParameters] = useState(
    savedQueryParameters || "",
  );
  const [userId, setUserId] = useState(savedUserId || "");
  const [body, setBody] = useState(savedBody || "");
  const { activeEndpoint } = useContext(SwizzleContext);
  const activeCollection = "_swizzle_usertests";
  const myRef = useRef<HTMLDivElement>(null);
  const { createTest, updateTest } = useTestApi();

  useEffect(() => {
    function handleClickOutside(event) {
      console.log("click outside");
      if (myRef.current && !myRef.current.contains(event.target)) {
        hideNewTestWindow();
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const saveTest = async () => {
    let queryParamsObject = {};
    if (queryParameters) {
      const pairs = queryParameters.split("&");
      for (let pair of pairs) {
        const [key, value] = pair.split("=");
        queryParamsObject[key] = value;
      }
    }

    let bodyObject;
    if (body) {
      try {
        bodyObject = JSON.parse(body);
      } catch (err) {
        console.error("Failed to parse body:", err);
        return;
      }
    }

    const documentToCreate = {
      test_name: testName,
      query_parameters: queryParamsObject,
      queryParametersString: queryParameters,
      user_id: userId,
      body: bodyObject,
      bodyString: body,
      endpoint: activeEndpoint
    };

    try {
      if (id) {
        await updateTest(activeCollection, id, documentToCreate);
      } else {
        await createTest(activeCollection, documentToCreate);
      }
    } catch (error) {
      console.error("Error saving test:", error);
    }

    hideNewTestWindow();
  };

  return (
    <div
      className={`z-50 absolute w-[500px] mr-[315px] bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        shouldShowNewTestWindow
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        marginTop: "-8px",
      }}
      ref={myRef}
    >
      <div className="flex flex-col justify-between px-4 py-2 pb-4">
        <div className="flex items-center pb-2">
          <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
          <div className="font-bold" style={{ fontSize: "18px" }}>
            {testTitle ? testTitle : "New Request"}
          </div>
        </div>

        <div className="font-bold my-2">Test Name</div>

        <div className="flex w-full mb-2">
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
        </div>
        <div className="font-bold my-2 text-md">Query Parameters</div>
        <div className="flex w-full mb-2">
          <InputWithPrefix
            prefix={"/" + (activeEndpoint.split("/")[1] || "") + "?"}
            className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
            placeholder={"key=value&key2=value2"}
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
            placeholder={"507f1f77bcf86cd799439011"}
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
            placeholder={"{ }"}
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
      <div className="flex justify-end items-center pb-4 mr-4 space-x-4">
        <Button
          text="Cancel"
          onClick={hideNewTestWindow}
          className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        />
        <Button
          text="Save"
          onClick={saveTest}
          className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#44464f] text-base font-medium text-white hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        />
      </div>
    </div>
  );
}
