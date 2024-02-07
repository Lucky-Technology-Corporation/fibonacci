import {
  faChevronRight,
  faMaximize,
  faMinimize,
  faPencil,
  faPlay,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getReasonPhrase } from "http-status-codes";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useTestApi from "../../API/TestingAPI";
import Button from "../../Utilities/Button";
import Dot from "../../Utilities/Dot";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import NewTestWindow from "./NewTestWindow";

export type QueryParams = {
  [param: string]: string;
};

export type Headers = {
  [header: string]: string;
};

export type TestType = {
  _id?: string;
  testName: string;
  queryParams: QueryParams;
  headers: Headers;
  pathParams: string[];
  userId?: string;
  body?: object;
  endpoint: string;
};

export default function TestWindow({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: any;
}) {
  const handleNewRequestClick = () => {
    setTestDoc({
      testName: "",
      queryParams: {},
      headers: {},
      pathParams: [],
      endpoint: activeEndpoint,
    });
    setShowNewTestWindow(true);
  };

  const { domain, activeProject, activeEndpoint, activeHelper, environment } = useContext(SwizzleContext);
  const activeCollection = "_swizzle_usertests";
  const [tests, setTests] = useState<TestType[]>([]);
  const [testResults, setTestResults] = useState({});
  const [statusText, setStatusText] = useState({});
  const [testResponses, setTestResponses] = useState({});
  const [loadingTests, setLoadingTests] = useState([]);
  const [runningAllTests, setRunningAllTests] = useState(false);
  const [hideTestResults, setHideTestResults] = useState({});

  const api = useTestApi();

  const runSingleTest = async (testDoc: TestType) => {
    setLoadingTests((prevLoadingTests) => [...prevLoadingTests, testDoc._id]);

    try {
      const result = await api.runTest(testDoc);
      setTestResults((prevResults) => ({
        ...prevResults,
        [testDoc._id]: result.status,
      }));

      setTestResponses((prevResponses) => ({
        ...prevResponses,
        [testDoc._id]: JSON.stringify(result.data, null, 2),
      }));

      setStatusText((prevResponses) => ({
        ...prevResponses,
        [testDoc._id]: result.status + ": " + getReasonPhrase(result.status),
      }));

      setLoadingTests((prevLoadingTests) => prevLoadingTests.filter((id) => id !== testDoc._id));
    } catch (error) {
      setTestResults((prevResults) => ({
        ...prevResults,
        [testDoc._id]: error.response ? error.response.status : 500,
      }));

      setTestResponses((prevResponses) => ({
        ...prevResponses,
        [testDoc._id]: error.response ? JSON.stringify(error.response.data, null, 2) : "Error",
      }));

      setStatusText((prevResponses) => ({
        ...prevResponses,
        [testDoc._id]: error.response
          ? error.response.status + ": " + getReasonPhrase(error.response.status)
          : "Unknown error (server might be restarting)",
      }));

      setLoadingTests((prevLoadingTests) => prevLoadingTests.filter((id) => id !== testDoc._id));
    }
  };

  const runAllTests = async () => {
    setRunningAllTests(true);
    for (let testDoc of tests) {
      await runSingleTest(testDoc);
    }
    setRunningAllTests(false);
    setHideTestResults({});
  };

  function getColorByStatus(statusCode: number) {
    if (statusCode >= 200 && statusCode < 300) return "green";
    if (statusCode >= 400 && statusCode < 500) return "yellow";
    if (statusCode >= 500) return "red";
    return "gray";
  }

  useEffect(() => {
    api
      .getTests(activeCollection, -1, 20, "", "asc", activeEndpoint)
      .then((response) => {
        if (response && response.documents) {
          setTests(response.documents);
        } else {
          setTests([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
      });
  }, [activeEndpoint]);

  const [showNewTestWindow, setShowNewTestWindow] = useState(false);
  const [testDoc, setTestDoc] = useState<TestType>(null);

  if (showNewTestWindow) {
    return (
      <NewTestWindow testDoc={testDoc} setTests={setTests} hideNewTestWindow={() => setShowNewTestWindow(false)} />
    );
  }
  return (
    <div className={`mt-4 overflow-scroll z-[100] w-full max-h-[100vh]`}>
      <div className="flex items-center justify-between px-4 pl-2 py-2 pb-1">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            {isSidebarOpen && (
              // <FontAwesomeIcon
              //   icon={faXmark}
              //   className="w-4 h-4 mr-1 cursor-pointer"
              //   onClick={() => {
              //     setIsSidebarOpen(false);
              //   }}
              // />
              <Button
                className="ml-auto mr-2 text-sm px-2.5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                children={<FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 cursor-pointer" />}
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            {/* <FontAwesomeIcon icon={faFlask} className="mr-2" /> */}
            <div className="font-bold text-base">Tests</div>
          </div>
          {/* <div className="text-sm text-gray-400 mt-1">
            Mock requests in your{" "}
            <span className={environment == "prod" ? "" : "text-[#f39c12]"}>
              {environment == "prod" ? "production" : "test"}
            </span>{" "}
            environment
          </div> */}
        </div>
        <div className="flex ml-auto mr-0">
          <Button
            text="Run All"
            onClick={runAllTests}
            className={`${
              tests == null || tests.length == 0 ? "hidden" : "block"
            } ml-auto inline-flex justify-center rounded border border-gray-600 shadow-sm px-2 py-1 bg-[#32333b] font-medium hover:bg-[#525363] text-[#D9D9D9] mt-0 ml-auto mr-1 w-auto text-sm cursor-pointer`}
          />
          <Button
            text="+ New"
            onClick={handleNewRequestClick}
            className="inline-flex justify-center rounded border border-gray-600 shadow-sm px-2 py-1 bg-[#32333b] cursor-pointer font-medium text-[#D9D9D9] hover:bg-[#525363] mt-0 ml-3 w-auto text-sm"
          />
        </div>
      </div>

      <div className="flex space-between mt-2 ml-2 border-b border-gray-600"></div>

      <div className="pr-4 pl-2 pb-2 text-sm">
        {tests?.map((testDoc, index) => (
          <div className="flex flex-col" key={index}>
            <div className="flex items-center justify-between mt-4 pb-2">
              <div className="flex items justify-left">
                <Button
                  onClick={() => {
                    if (!loadingTests.includes(testDoc._id)) {
                      runSingleTest(testDoc);
                    }
                  }}
                  className="p-2 font-medium rounded flex justify-center items-center cursor-pointer opacity-70 hover:opacity-100"
                  children={
                    loadingTests.includes(testDoc._id) ? (
                      <div>
                        <FontAwesomeIcon icon={faSpinner} />
                      </div>
                    ) : (
                      <FontAwesomeIcon icon={faPlay} />
                    )
                  }
                  text=""
                />
                <div className="font-medium m-auto ml-2">{testDoc.testName}</div>
              </div>
              <div className="flex space-x-2">
                <Button
                  text=""
                  className="p-2 ml-2 font-medium rounded flex justify-center items-center cursor-pointer opacity-70 hover:opacity-100"
                  children={<FontAwesomeIcon icon={faPencil} style={{ color: "#D9D9D9" }} />}
                  onClick={() => {
                    setTestDoc(testDoc);
                    setShowNewTestWindow(true);
                  }}
                />
                <Button
                  text=""
                  className="p-2 ml-2 font-medium rounded flex justify-center items-center cursor-pointer opacity-70 hover:opacity-100"
                  children={<FontAwesomeIcon style={{ color: "#D9D9D9" }} icon={faTrash} />}
                  onClick={() => {
                    setTests((prevTests) => prevTests.filter((test) => test._id !== testDoc._id));
                    api
                      .deleteTest(activeCollection, testDoc._id)
                      .then(() => {})
                      .catch((error) => {
                        toast.error("Error deleting test");
                        console.error("Error deleting test:", error);
                      });
                  }}
                />
              </div>
            </div>
            {testResponses[testDoc._id] && (
              <div className="bg-[#272727] p-1 mb-3 rounded">
                <div className="px-1 text-sm font-semibold">
                  <div className="mb-1">
                    <div className="flex items-center">
                      <Dot className="ml-0" color={getColorByStatus(testResults[testDoc._id])} />
                      <span>{statusText[testDoc._id]}</span>

                      <FontAwesomeIcon
                        icon={hideTestResults[testDoc._id] ? faMaximize : faMinimize}
                        className="mr-1 ml-auto w-3 h-3 cursor-pointer opacity-70 hover:opacity-100"
                        onClick={() => {
                          // setTestResponses((prevResponses) => ({
                          //   ...prevResponses,
                          //   [testDoc._id]: null,
                          // }));
                          const newShowState = hideTestResults[testDoc._id] ? false : true;
                          setHideTestResults((prevResponses) => ({
                            ...prevResponses,
                            [testDoc._id]: newShowState,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
                {hideTestResults[testDoc._id] ? (
                  <></>
                ) : (
                  <pre className="font-mono text-xs ml-2 mb-3 mt-2 whitespace-normal break-words">
                    {testResponses[testDoc._id]}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
