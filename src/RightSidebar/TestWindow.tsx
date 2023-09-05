import Button from "../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function TestWindow({
  shouldShowTestWindow,
  setShouldShowNewTestWindow,
  //hideTestWindow,
  setCurrentWindow,
  savedTests,
}: {
  shouldShowTestWindow: any;
    setShouldShowNewTestWindow: any;
  //hideTestWindow: any;
  setCurrentWindow: any;
  savedTests?: string[];
}) {
    const handleNewRequestClick = () => {
        setShouldShowNewTestWindow(true);
        shouldShowTestWindow();
        setCurrentWindow("newTest");
    }

    const handleCancelClick = () => {
        setCurrentWindow(null);
        shouldShowTestWindow();
    }
    
  return (
    <div
      className={`z-50 absolute w-[500px] mr-[315px] bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        shouldShowTestWindow ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        marginTop: "-8px"
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
        <Button text="+ New Request" onClick={handleNewRequestClick} className = "mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"/>
      </div>
      <div className="px-4 pb-2 text-sm">
        {savedTests?.map((test, index) => (
          <div key={index} className="flex items-center justify-between mt-3 pb-2">
            <div className="flex itmes justify-left mx-2">
            <img
          src="playbutton.svg"
          alt="playbutton"
          className="w-4 h-4 mr-2 mt-2"
        />
            <Button text={test} onClick={() => {}} className = "mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"/>
            </div>
            <FontAwesomeIcon
              className="mr-2"
              icon={faTrash}
              onClick={() => {
                /* Handle deletion here */
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center pb-4 mr-4 space-x-4">
        <Button text="Cancel" onClick={handleCancelClick} className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
        <Button text="Run All" onClick={() => {}} className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#44464f] text-base font-medium text-white hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
        </div>
    </div>
  );
}
