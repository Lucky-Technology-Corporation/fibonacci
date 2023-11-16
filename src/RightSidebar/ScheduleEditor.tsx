import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
// import { Cron } from 'react-js-cron';
// import 'react-js-cron/dist/styles.css';
import Button from "../Utilities/Button";
import { SwizzleContext } from "../Utilities/GlobalContext";

export default function ScheduleEditor({isVisible, setIsVisible, setIsScheduleChecked}: {isVisible: boolean, setIsVisible: any, setIsScheduleChecked: any}) {

  const { activeEndpoint } = useContext(SwizzleContext);
  const [value, setValue] = useState('30 5 * * 1,6')

  const handleSave = () => {
    //Setup cron for activeEndpoint

    if(value == ""){
      setIsScheduleChecked(false)
    } else{
      setIsScheduleChecked(true)
    }
    setIsVisible(false)
  }

  return (
    <div
      className={`scrollable-div z-50 absolute w-[500px] mr-[350px] bg-[#252629] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        marginTop: "-8px",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 pb-1">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            <div className="font-bold" style={{ fontSize: "18px" }}>
              Schedule
            </div>
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Set up your recurring function (Cron: <span className="font-mono text-xs">{value == "" ? "off" : value}</span>)
          </div>
        </div>
        <div className="flex ml-auto mr-0">
          <Button
            text="Save"
            onClick={handleSave}
            className="mt-2 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
          />
        </div>
      </div>

      <div className="px-4 pb-2 text-sm mt-2">
        {/* <Cron 
          value={value} 
          setValue={setValue} 
          clearButtonAction={"empty"}
        /> */}
      </div>
    </div>
  );
}
