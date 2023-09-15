import Button from "../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask, faTrash, faPlay } from "@fortawesome/free-solid-svg-icons";
import useTestApi from "../API/TestingAPI";
import { useEffect, useState, useContext } from "react";
import NewTestWindow from "./NewTestWindow";
import Dot from "../Utilities/Dot";
import { SwizzleContext } from "../Utilities/GlobalContext";

export default function TestWindow({
  shouldShowTestWindow,
  setShouldShowNewTestWindow,
  setCurrentWindow,
} 
: {
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

  const { domain, activeProject, activeEndpoint, environment } = useContext(SwizzleContext);
  const activeCollection = "_swizzle_usertests";
  const [tests, setTests] = useState([]);
  const [testResults, setTestResults] = useState({});
  const api = useTestApi();
  
  const runSingleTest = async (testDoc) => {
    try {
      const result = await api.runTest(testDoc);
      const status = result.status;
      setTestResults((prevResults) => ({
        ...prevResults,
        [testDoc._id]: status,
      }));
    } catch (error) {
      console.error("Error running test:", error);
      setTestResults((prevResults) => ({
        ...prevResults,
        [testDoc._id]: "Error occurred.",
      }));
    }
  };

  const runAllTests = async () => {
    let newResults = {};
    for (let testDoc of tests) {
      try {
        const result = await api.runTest(testDoc);
        const status = result.status;
        newResults[testDoc._id] = status;
      } catch (error) {
        console.error("Error running test:", error);
        newResults[testDoc._id] = "Error occurred.";
      }
    }
    setTestResults(newResults);
  };

  function getColorByStatus(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return "green";
    if (statusCode >= 400 && statusCode < 500) return "yellow";
    if (statusCode >= 500) return "red";
    return "gray";
  }

  useEffect(() => {
    api
      .getTests(activeCollection, -1, 20, "", "asc", activeEndpoint)
      .then((response) => {
        console.log("API Response:", response.documents);
        setTests(response.documents);
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
      });
  }, []);

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
      />
    );
  }
  return (
    <div
      className={`z-50 absolute w-[500px] mr-[315px] bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        shouldShowTestWindow ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        marginTop: "-8px",
      }}
      //ref={myRef}
    >
      <div className="flex items-center justify-between px-4 py-2 pb-1">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faFlask} className="mr-2" />
            <div className="font-bold" style={{ fontSize: "18px" }}>
              Test
            </div>
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Send requests in test mode
          </div>
        </div>
        <Button
          text="+ New Request"
          onClick={handleNewRequestClick}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        />
      </div>
      <div className="px-4 pb-2 text-sm">
        {tests?.map((testDoc, index) => (
          <div
            key={index}
            className="flex items-center justify-between mt-3 pb-2"
          >
            <div className="flex itmes justify-left mx-2">
              <button onClick={() => runSingleTest(testDoc)}>
              <FontAwesomeIcon icon={faPlay} size="lg" style={{color: "#41d373",}} />              </button>

              <Button
                text={testDoc.test_name}
                onClick={() => {
                  setShowNewTestWindow(true);
                  setTestDoc(testDoc);
                }}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              />
              <div className="px-4 py-2 text-sm font-bold">
                <div className="mt-2">
                  <div className="flex items-center">
                    {testResults[testDoc._id] !== undefined && (
                      <>
                        <span>Result: {testResults[testDoc._id]}</span>
                        <Dot
                          className="ml-2"
                          color={getColorByStatus(testResults[testDoc._id])}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <FontAwesomeIcon
              className="mr-2 p-3 hover:p-3 hover:bg-[#525363] rounded transition-all"
              icon={faTrash}
              onClick={() => {
                api.deleteTest(activeCollection, testDoc._id)
                  .then(() => {
                    setTests(prevTests => prevTests.filter(test => test._id !== testDoc._id));
                  })
                  .catch((error) => {
                    console.error("Error deleting test:", error);
                  });
              }}
              
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center pb-4 mr-4 space-x-4">
        <Button
          text="Cancel"
          onClick={handleCancelClick}
          className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        />
        <Button
          text="Run All"
          onClick={runAllTests}
          className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#44464f] text-base font-medium text-white hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        />
      </div>
    </div>
  );
}
