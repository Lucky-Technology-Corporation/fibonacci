import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useTestApi from "../../API/TestingAPI";
import { ParsedActiveEndpoint, enumeratePathParams } from "../../Utilities/ActiveEndpointHelper";
import Button from "../../Utilities/Button";
import Checkbox from "../../Utilities/Checkbox";
import { methodToColor } from "../../Utilities/Method";
import InputJsonForm from "../Sections/BodyInfo";
import UserIdInfo from "../Sections/UserIdInfo";
import GroupedInput from "./GroupedInput";
import { TestType } from "./TestWindow";

export default function NewTestWindow({
  testDoc,
  setTests,
  hideNewTestWindow,
}: {
  testDoc?: TestType;
  setTests?: (newTests: any) => void;
  hideNewTestWindow: () => void;
}) {
  const [testName, setTestName] = useState(testDoc.testName);
  const [queryParams, setQueryParameters] = useState(
    Object.entries(testDoc.queryParams).map((param, index) => ({ id: index, key: param[0], value: param[1] })),
  );
  const [headerList, setHeaderList] = useState(
    Object.entries(testDoc.headers).map((param, index) => ({ id: index, key: param[0], value: param[1] })),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [pathParams, setPathParameters] = useState(testDoc.pathParams);
  const [isUserIdChecked, setIsUserIdChecked] = useState(!!testDoc.userId);

  const [userId, setUserId] = useState(testDoc.userId || "");
  const [bodyRaw, setBodyRaw] = useState(!!testDoc.body ? JSON.stringify(testDoc.body) : "{}");
  const activeCollection = "_swizzle_usertests";
  const myRef = useRef<HTMLDivElement>(null);
  const { createTest, updateTest } = useTestApi();

  const parsedActiveEndpoint = new ParsedActiveEndpoint(testDoc.endpoint);

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

  useEffect(() => {
    setIsSaving(false); 
  }, [testDoc])

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

    const transformedQueryParams = {};
    queryParams
      .filter(({ key, value }) => key !== "")
      .forEach(({ key, value }) => (transformedQueryParams[key] = value));

    const transformedHeaders = {};
    headerList
      .filter(({ key, value }) => key !== "")
      .forEach(({ key, value }) => (transformedHeaders[key] = value));

        
    const documentToCreate: TestType = {
      testName,
      pathParams,
      queryParams: transformedQueryParams,
      headers: transformedHeaders,
      userId: isUserIdChecked ? userId : undefined,
      body: bodyObject ? bodyObject : undefined,
      endpoint: testDoc.endpoint,
    };

    if (parsedActiveEndpoint.pathParams.length != pathParams.filter((p) => p !== undefined && p !== "").length) {
      toast.error("Please enter all path parameters");
      return;
    }
    setIsSaving(true);
    try {
      if (testDoc._id) {
        await updateTest(activeCollection, testDoc._id, documentToCreate);
        if (setTests) {
          setTests((prevTests) => {
            return prevTests.map((test) => {
              if (test._id === testDoc._id) {
                return {
                  ...documentToCreate,
                  _id: testDoc._id,
                };
              }
              return test;
            });
          });
        }
      } else {
        const resp = await createTest(activeCollection, documentToCreate);
        documentToCreate._id = resp.documentIds[0];
        if (setTests) {
          setTests((prevTests) => [...prevTests, documentToCreate]);
        }
      }
    } catch (error) {
      console.error("Error saving test:", error);
    }

    hideNewTestWindow();
    setIsSaving(false); 
  };


  return (
    <div
      className={`z-50 absolute w-[500px] mr-[350px] bg-[#252629] border border-[#525363] rounded-lg shadow-lg pt-2`}
      style={{
        transition: "opacity 0.1s",
        marginTop: "-8px",
      }}
      ref={myRef}
    >
      <div className="flex flex-col justify-between px-4 py-2 pb-4">
        <div className="flex items-center pb-2">
          <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
          <input
            type="text"
            className="text-sm font-semibold w-full p-1 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] mr-2"
            placeholder={"Test Name"}
            value={testName}
            onChange={(e) => {
              setTestName(e.target.value);
            }}
          />
        </div>

        <div className="font-bold my-2">Request URL</div>

        <div className="flex w-full mb-2">
          <div
            className={`text-s py-1 pr-2 bg-transparent rounded outline-0 focus:border-[#68697a] font-bold ${methodToColor(
              undefined,
              parsedActiveEndpoint.method,
            )}`}
          >
            {parsedActiveEndpoint.method}
          </div>
          {enumeratePathParams(parsedActiveEndpoint.toParts()).map((part, index) => {
            if (typeof part === "object") {
              return (
                <input
                  type="text"
                  className="text-s p-1 shrink bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] mr-2"
                  placeholder={part[0]}
                  value={pathParams[part[1]] ?? ""}
                  onChange={(e) => {
                    setPathParameters((prevParams) => {
                      const newParams = [...prevParams];
                      newParams[part[1]] = e.target.value;
                      return newParams;
                    });
                  }}
                  style={{ width: "inherit" }}
                  key={index}
                />
              );
            } else {
              return (
                <div
                  key={index}
                  className="text-s py-1 bg-transparent rounded outline-0 focus:border-[#68697a] mr-2 opacity-70"
                >
                  {part}
                </div>
              );
            }
          })}
        </div>
        <div className={`text-s py-1 pr-2 bg-transparent rounded outline-0 focus:border-[#68697a] font-bold`}>
          Query String
        </div>
        <div className="flex w-full mb-2">
          <GroupedInput valueList={queryParams} setValueList={setQueryParameters} isQuery={true} />
        </div>
        
        <div className={`text-s py-1 pr-2 bg-transparent rounded outline-0 focus:border-[#68697a] font-bold`}>
          Authentication
        </div>
        <div className="mt-1 mb-2">
          <Checkbox id="userid" label="Simulate user" isChecked={isUserIdChecked} setIsChecked={setIsUserIdChecked} />
          <UserIdInfo
            show={isUserIdChecked}
            className="text-s flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
            placeholder={"userId (e.g. 507f1f77bcf86cd799439011)"}
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
            }}
          />
        </div>

        <div className={`text-s py-1 pr-2 bg-transparent rounded outline-0 focus:border-[#68697a] font-bold`}>
          Headers
        </div>
        <div className="mt-1 mb-2">
            <GroupedInput valueList={headerList} setValueList={setHeaderList} isQuery={false} />
        </div>

        <div className={`text-s py-1 pr-2 bg-transparent rounded outline-0 focus:border-[#68697a] font-bold ${parsedActiveEndpoint.method != "GET" ? "" : "hidden"}`}>
          Body
        </div>
        <div className={`mb-2 ${parsedActiveEndpoint.method != "GET" ? "" : "hidden"}`}>
          <InputJsonForm
            className="text-s flex-grow bg-transparent"
            placeholder="{ }"
            value={bodyRaw}
            onChange={(e) => {
              setBodyRaw(e.target.value);
            }}
            show={true}
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
          onClick={() => { if(!isSaving){ saveTest() } }}
          className={`${isSaving ? "opacity-50" : ""} mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#44464f] text-base font-medium text-white hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer`}
        />
      </div>
    </div>
  );
}
