import { faFlask, faPencil, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getReasonPhrase } from "http-status-codes";
import { useContext, useEffect, useState } from "react";
import LoadingIcons from "react-loading-icons";
import useTestApi from "../API/TestingAPI";
import Button from "../Utilities/Button";
import Dot from "../Utilities/Dot";
import { SwizzleContext } from "../Utilities/GlobalContext";
import NewTestWindow from "./NewTestWindow";

export default function TestWindow({
  shouldShowTestWindow,
  setShouldShowNewTestWindow,
  setCurrentWindow,
}: {
  shouldShowTestWindow: any;
  setShouldShowNewTestWindow: any;
  setCurrentWindow: any;
}) {
  const handleNewRequestClick = () => {
    setShouldShowNewTestWindow(true);
    shouldShowTestWindow();
    setCurrentWindow("newTest");
  };

  const handleCancelClick = () => {
    setCurrentWindow(null);
    shouldShowTestWindow();
  };
  type TestType = {
    test_name: string;
    query_parameters: object;
    queryParametersString: string;
    user_id: string;
    body: object;
    bodyString: string;
    endpoint: string;
    _id: string;
  };


  function getParsedError(htmlString: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Find the <pre> tag containing the error message
    const pre = tempDiv.querySelector('pre');
    if (pre) {
        return pre.innerText.replace(/<br\s*\/?>/mg, "\n").trim();
    }

    return 'Unknown error';  // Default message if we can't find the <pre> tag
}

  const { domain, activeProject, activeEndpoint, environment } = useContext(SwizzleContext);
  const activeCollection = "_swizzle_usertests";
  const [tests, setTests] = useState<TestType[]>([]);
  const [testResults, setTestResults] = useState({});
  const [statusText, setStatusText] = useState({});
  const [testResponses, setTestResponses] = useState({});
  const [loadingTests, setLoadingTests] = useState([]);
  const [runningAllTests, setRunningAllTests] = useState(false);

  const api = useTestApi();

  const runSingleTest = async (testDoc) => {
    setLoadingTests((prevLoadingTests) => [...prevLoadingTests, testDoc._id]);

    try {
      const result = await api.runTest(testDoc);
      console.log(result)
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

      console.log(error)
            
      setTestResults((prevResults) => ({
        ...prevResults,
        [testDoc._id]: error.response.status,
      }));
      
      setTestResponses((prevResponses) => ({
        ...prevResponses,
        [testDoc._id]: error.response ? JSON.stringify(error.response.data, null, 2) : "Error",
      }));
   
      setStatusText((prevResponses) => ({
        ...prevResponses,
        [testDoc._id]: error.response ? (error.response.status +": " + getReasonPhrase(error.response.status)) : "Unknown error"
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

  function getColorByStatus(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return "green";
    if (statusCode >= 400 && statusCode < 500) return "yellow";
    if (statusCode >= 500) return "red";
    console.log(statusCode);
    return "gray";
  }

  useEffect(() => {
    api
      .getTests(activeCollection, -1, 20, "", "asc", activeEndpoint)
      .then((response) => {
        if (response && response.documents) {
          setTests(response.documents);
        }
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
      });
  }, [activeEndpoint]);

  const [showNewTestWindow, setShowNewTestWindow] = useState(false);
  const [testDoc, setTestDoc] = useState(null);

  if (showNewTestWindow) {
    return (
      <NewTestWindow
        id={testDoc._id}
        testTitle={testDoc.test_name}
        savedQueryParameters={testDoc.queryParametersString}
        savedUserId={testDoc.user_id}
        savedBody={testDoc.bodyString}
        shouldShowNewTestWindow={showNewTestWindow}
        hideNewTestWindow={() => setShowNewTestWindow(false)}
        savedTests={tests}
        setTests={setTests}
      />
    );
  }
  return (
    <div
      className={`scrollable-div z-50 absolute w-[500px] mr-[315px] bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        shouldShowTestWindow ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        marginTop: "-8px",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 pb-1">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faFlask} className="mr-2" />
            <div className="font-bold" style={{ fontSize: "18px" }}>
              Test
            </div>
          </div>
          <div className="text-sm text-gray-400 mt-1">Send mock requests to test</div>
        </div>
        <Button
          text="+ New Request"
          onClick={handleNewRequestClick}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] cursor-pointer text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        />
      </div>

      <div className="px-4 pb-2 text-sm">
        {tests?.map((testDoc, index) => (
          <div className="flex flex-col" key={index}>
            <div className="flex items-center justify-between mt-4 pb-2">
              <div className="flex items justify-left">
                <Button onClick={() => {if(!loadingTests.includes(testDoc._id)) { runSingleTest(testDoc)} }} 
                  className="py-2 px-3 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                  children={
                    loadingTests.includes(testDoc._id) ? (
                      <div>
                        <LoadingIcons.Circles style={{ width: "10px", height: "12px" }} />
                      </div>
                      ) : (
                        <FontAwesomeIcon icon={faPlay} style={{ color: "#41d373" }} />
                    )}
                text=""
                />
                <div className="font-medium m-auto ml-2">{testDoc.test_name}</div>
              </div>
              <div className="flex space-x-2">
                <Button
                    text=""
                    className="p-2 ml-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                    children={
                      <FontAwesomeIcon icon={faPencil} style={{ color: "#D9D9D9" }} />
                    }
                    onClick={() => {
                      setShowNewTestWindow(true);
                      setTestDoc(testDoc);
                    }}
                />
                <Button
                  text=""
                  className="p-2 ml-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                  children={
                    <FontAwesomeIcon
                      style={{ color: "#D9D9D9" }}
                      icon={faTrash}
                    />  
                  }
                  onClick={() => {
                    api
                      .deleteTest(activeCollection, testDoc._id)
                      .then(() => {
                        setTests((prevTests) => prevTests.filter((test) => test._id !== testDoc._id));
                      })
                      .catch((error) => {
                        console.error("Error deleting test:", error);
                      });
                  }}
                />
              </div>
            </div>
            <div className="px-2 text-sm font-bold">
              <div className="mb-2">
                <div className="flex items-center">
                  {testResults[testDoc._id] !== undefined && (
                    <>
                      <Dot className="ml-0" color={getColorByStatus(testResults[testDoc._id])} />
                      <span>{statusText[testDoc._id]}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {testResponses[testDoc._id] ? (        
              <pre className="font-mono text-xs ml-4 mb-2 whitespace-normal break-words">{testResponses[testDoc._id]}</pre>
            ) : (
                <div></div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center pb-4 mr-4 space-x-4">
        <Button
          text="Cancel"
          onClick={handleCancelClick}
          className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
        />
        <Button
          text="Run All"
          onClick={runAllTests}
          className={`${
            tests == null || tests.length == 0 ? "hidden" : "block"
          } mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#44464f] text-base font-medium text-white hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer`}
        />
      </div>
    </div>
  );
}
