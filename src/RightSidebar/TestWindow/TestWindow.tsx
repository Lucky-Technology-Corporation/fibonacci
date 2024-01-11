import { faBroom, faFlask, faPencil, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getReasonPhrase } from "http-status-codes";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingIcons from "react-loading-icons";
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

export default function TestWindow({isSidebarOpen, setIsSidebarOpen}: {isSidebarOpen: boolean, setIsSidebarOpen: any}) {
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
    <div className={`mt-4`}>
      <div className="flex items-center justify-between px-4 py-2 pb-1">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faFlask} className="mr-2" />
            <div className="font-bold" style={{ fontSize: "18px" }}>
              Tests
            </div>
          </div>
          {isSidebarOpen && (
            <a className="cursor-pointer mt-1" onClick={() => {setIsSidebarOpen(false)}}>(close)</a>
          )}
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
            } ml-auto mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-1 bg-[#32333b] text-base font-medium text-white hover:bg-[#525363]  sm:mt-0 sm:ml-auto sm:mr-1 sm:w-auto sm:text-sm cursor-pointer`}
          />
          <Button
            text="+ New Test"
            onClick={handleNewRequestClick}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-1 bg-[#32333b] cursor-pointer text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          />
        </div>
      </div>
      <div className="flex space-between mt-2 border-b border-gray-600">
        
      </div>

      <div className="px-4 pb-2 text-sm">
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
                  className="py-1 px-1 font-medium rounded flex justify-center items-center cursor-pointer"
                  children={
                    loadingTests.includes(testDoc._id) ? (
                      <div>
                        <LoadingIcons.Circles style={{ width: "10px", height: "12px" }} />
                      </div>
                    ) : (
                      <FontAwesomeIcon icon={faPlay} style={{ color: "#41d373" }} />
                    )
                  }
                  text=""
                />
                <div className="font-medium m-auto ml-2">{testDoc.testName}</div>
              </div>
              <div className="flex space-x-2">
                <Button
                  text=""
                  className="p-2 ml-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                  children={<FontAwesomeIcon icon={faPencil} style={{ color: "#D9D9D9" }} />}
                  onClick={() => {
                    setTestDoc(testDoc);
                    setShowNewTestWindow(true);
                  }}
                />
                <Button
                  text=""
                  className="p-2 ml-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                  children={<FontAwesomeIcon style={{ color: "#D9D9D9" }} icon={faTrash} />}
                  onClick={() => {
                    setTests((prevTests) => prevTests.filter((test) => test._id !== testDoc._id));
                    api
                      .deleteTest(activeCollection, testDoc._id)
                      .then(() => { })
                      .catch((error) => {
                        toast.error("Error deleting test")
                        console.error("Error deleting test:", error);
                      });
                  }}
                />
              </div>
            </div>
            {testResponses[testDoc._id] && (
              <div className="bg-[#272727] p-1 rounded">
                <div className="px-1 text-sm font-semibold">
                  <div className="mb-1">
                    <div className="flex items-center">
                      <Dot className="ml-0" color={getColorByStatus(testResults[testDoc._id])} />
                      <span>{statusText[testDoc._id]}</span>
                      
                      <FontAwesomeIcon icon={faBroom} className="mr-1 ml-auto w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" onClick={() => {
                        setTestResponses((prevResponses) => ({
                          ...prevResponses,
                          [testDoc._id]: null,
                        }));
                      }}/>

                    </div>
                  </div>
                </div>
                <pre className="font-mono text-xs ml-2 mb-1 mt-2 whitespace-normal break-words">
                  {testResponses[testDoc._id]}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
