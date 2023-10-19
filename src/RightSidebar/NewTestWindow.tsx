import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useTestApi from "../API/TestingAPI";
import Button from "../Utilities/Button";
import Checkbox from "../Utilities/Checkbox";
import { SwizzleContext } from "../Utilities/GlobalContext";
import InputJsonForm from "./Sections/BodyInfo";
import UserIdInfo from "./Sections/UserIdInfo";
import { TestType } from "./TestWindow";
import { ParsedActiveEndpoint } from "../Utilities/ActiveEndpointHelper";

export default function NewTestWindow({
  id,
  testTitle,
  savedPathParameters,
  savedQueryParameters,
  savedUserId,
  savedBody,
  shouldShowNewTestWindow,
  hideNewTestWindow,
  setTests,
}: {
  id?: string;
  testTitle?: string;
  savedPathParameters?: string[];
  savedQueryParameters?: Map<string, string>;
  savedUserId?: string;
  savedBody?: object;
  shouldShowNewTestWindow: boolean;
  hideNewTestWindow: any;
  setTests?: (newTests: any) => void;
}) {
  const [testName, setTestName] = useState(testTitle || "");
  const [queryParams, setQueryParameters] = useState(savedQueryParameters || new Map<string, string>());
  const [pathParams, setPathParameters] = useState(savedPathParameters || []);
  const [isUserIdChecked, setIsUserIdChecked] = useState(!!savedUserId);
  const [isBodyChecked, setIsBodyChecked] = useState(!!savedBody);

  const [userId, setUserId] = useState(savedUserId || "");
  const [body, setBody] = useState(savedBody);
  const [bodyRaw, setBodyRaw] = useState(!!body ? JSON.stringify(body) : "");
  const { activeEndpoint } = useContext(SwizzleContext);
  const activeCollection = "_swizzle_usertests";
  const myRef = useRef<HTMLDivElement>(null);
  const { createTest, updateTest } = useTestApi();

  const parsedActiveEndpoint = new ParsedActiveEndpoint(activeEndpoint);

  useEffect(() => {
    function handleClickOutside(event) {
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
    if (testName == "") {
      toast.error("Please enter a test name");
      return;
    }

    let bodyObject;
    if (bodyRaw) {
      try {
        bodyObject = JSON.parse(bodyRaw);
      } catch (err) {
        console.error("Failed to parse body:", err);
        return;
      }
    }

    const documentToCreate: TestType = {
      testName,
      pathParams,
      queryParams,
      headers: new Map<string, string>(),
      userId,
      body: bodyObject,
      endpoint: activeEndpoint,
    };

    try {
      if (id) {
        await updateTest(activeCollection, id, documentToCreate);
        if (setTests) {
          setTests((prevTests) => {
            return prevTests.map((test) => {
              if (test._id === id) {
                return {
                  ...documentToCreate,
                  _id: id,
                };
              }
              return test;
            });
          });
        }
      } else {
        await createTest(activeCollection, documentToCreate);
        if (setTests) {
          setTests((prevTests) => [...prevTests, documentToCreate]);
        }
      }
    } catch (error) {
      console.error("Error saving test:", error);
    }

    hideNewTestWindow();
  };

  return (
    <div
      className={`z-50 absolute w-[500px] mr-[315px] bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        shouldShowNewTestWindow ? "opacity-100" : "opacity-0 pointer-events-none"
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
          />
        </div>
        <div className="flex w-full mb-2">
          {parsedActiveEndpoint.pathParams.map((param) => (
            <input
              type="text"
              className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] mr-2"
              placeholder={param}
              value={testName}
              onChange={(e) => {
                setTestName(e.target.value);
              }}
            />
          ))}
        </div>
        <div className="mb-2">
          <Checkbox id="userid" label="User ID" isChecked={isUserIdChecked} setIsChecked={setIsUserIdChecked} />
          <UserIdInfo
            show={isUserIdChecked}
            className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
            placeholder={"507f1f77bcf86cd799439011"}
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
            }}
          />
        </div>

        <div className={`mb-2 ${parsedActiveEndpoint.method != "GET" ? "" : "hidden"}`}>
          <Checkbox id="body" label="Body" isChecked={isBodyChecked} setIsChecked={setIsBodyChecked} />
          <InputJsonForm
            className="text-s flex-grow bg-transparent"
            placeholder="{ }"
            value={bodyRaw}
            onChange={(e) => {
              setBodyRaw(e.target.value);
            }}
            show={isBodyChecked}
          />
        </div>

        {/* <Button text="Save" onClick={hideTestWindow} /> */}
      </div>
      <div className="flex justify-end items-center pb-4 mr-4 space-x-4">
        <Button
          text="Cancel"
          onClick={hideNewTestWindow}
          className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
        />
        <Button
          text="Save"
          onClick={saveTest}
          className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#44464f] text-base font-medium text-white hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
        />
      </div>
    </div>
  );
}
