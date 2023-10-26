import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useTestApi from "../API/TestingAPI";
import { ParsedActiveEndpoint, enumeratePathParams } from "../Utilities/ActiveEndpointHelper";
import Button from "../Utilities/Button";
import Checkbox from "../Utilities/Checkbox";
import { methodToColor } from "../Utilities/Method";
import InputJsonForm from "./Sections/BodyInfo";
import UserIdInfo from "./Sections/UserIdInfo";
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
  const lastEditedRef = useRef(null);
  const [testName, setTestName] = useState(testDoc.testName);
  const [queryParams, setQueryParameters] = useState(
    Object.entries(testDoc.queryParams).map((param, index) => ({ id: index, key: param[0], value: param[1] })),
  );
  const [emptyRow, setEmptyRow] = useState({ key: "", value: "" });

  const [pathParams, setPathParameters] = useState(testDoc.pathParams);
  const [isUserIdChecked, setIsUserIdChecked] = useState(!!testDoc.userId);
  const [isBodyChecked, setIsBodyChecked] = useState(!!testDoc.body);

  const [userId, setUserId] = useState(testDoc.userId || "");
  const [bodyRaw, setBodyRaw] = useState(!!testDoc.body ? JSON.stringify(testDoc.body) : "");
  const activeCollection = "_swizzle_usertests";
  const myRef = useRef<HTMLDivElement>(null);
  const { createTest, updateTest } = useTestApi();

  const handleInputChange = (id: number, newKey: string, newValue: string) => {
    const updatedQueryParams = [...queryParams];
    const index = updatedQueryParams.findIndex((q) => q.id === id);

    if (index > -1) {
      updatedQueryParams[index] = { id, key: newKey, value: newValue };

      // Remove the row if both key and value are empty
      if (newKey === "" && newValue === "") {
        updatedQueryParams.splice(index, 1);
      }

      setQueryParameters(updatedQueryParams);
    }
  };

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

    const documentToCreate: TestType = {
      testName,
      pathParams,
      queryParams: transformedQueryParams,
      headers: {},
      userId: isUserIdChecked ? userId : undefined,
      body: isBodyChecked ? bodyObject : undefined,
      endpoint: testDoc.endpoint,
    };

    if (parsedActiveEndpoint.pathParams.length != pathParams.filter((p) => p !== undefined && p !== "").length) {
      toast.error("Please enter all path parameters");
      return;
    }

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

  const prevLength = useRef(queryParams.length);
  useEffect(() => {
    if (queryParams.length > prevLength.current && lastEditedRef.current) {
      lastEditedRef.current.focus();
    }
    prevLength.current = queryParams.length;
  }, [queryParams]);

  return (
    <div
      className={`z-50 absolute w-[500px] mr-[315px] bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2`}
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
          <div key="grouped-rows" className="w-full">
            {queryParams.map(({ id, key, value }) => (
              <div className="flex w-full" key={id}>
                <div className="p-1 mx-1 ml-0 my-1">{id == 0 ? "?" : "&"}</div>
                <input
                  placeholder="Key"
                  value={key}
                  onChange={(e) => handleInputChange(id, e.target.value, value)}
                  className="text-s p-1 flex-grow bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] my-1"
                />
                <div className="p-1 mx-1 my-1">=</div>
                <input
                  placeholder="Value"
                  value={value}
                  onChange={(e) => handleInputChange(id, key, e.target.value)}
                  className="text-s p-1 flex-grow bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] mr-2 my-1"
                  ref={id == queryParams.length - 1 ? lastEditedRef : null}
                />
              </div>
            ))}

            {/* Empty set of boxes */}
            <div className="flex w-full" key="empty-row">
              <div className="p-1 mx-1 ml-0 my-1">{queryParams.length == 0 ? "?" : "&"}</div>
              <input
                placeholder="New Key"
                value={emptyRow.key}
                onChange={(e) => setEmptyRow({ ...emptyRow, key: e.target.value })}
                onBlur={() => {
                  if (emptyRow.key == "") {
                    return;
                  }
                  setQueryParameters([
                    ...queryParams,
                    { id: queryParams.length, key: emptyRow.key, value: emptyRow.value },
                  ]);
                  setEmptyRow({ key: "", value: "" });
                }}
                onKeyDown={(e) => {
                  if (e.key == "Tab") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="text-s p-1 flex-grow bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] my-1"
              />
              <div className="p-1 mx-1 my-1">=</div>
              <input
                placeholder="New Value"
                value={emptyRow.value}
                disabled={true}
                className="text-s p-1 flex-grow bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] mr-2 my-1"
              />
            </div>
          </div>
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
