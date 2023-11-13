import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTour } from "@reactour/tour";
import { Card, DateRangePickerValue, LineChart } from "@tremor/react";
import { useContext, useEffect, useState } from "react";
import useMonitoringApi from "../../API/MonitoringAPI";
import Button from "../../Utilities/Button";
import { copyText } from "../../Utilities/Copyable";
import Dot from "../../Utilities/Dot";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function AnalyticsPage() {
  const api = useMonitoringApi();
  const { activeProject, environment, activeProjectName, testDomain, prodDomain, testDeployStatus, prodDeployStatus } =
    useContext(SwizzleContext);

  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const [isHintHidden, setIsHintHidden] = useState<boolean>(false)

  const [data, setData] = useState<any[]>([]);
  const fetchAndProcessData = async () => {
    try {
      const startDateStr = dateRange.from.toISOString();
      const endDateStr = dateRange.to.toISOString();
      const fetchedData = await api.getData(startDateStr, endDateStr);
      if (fetchedData == null) {
        return;
      }
      const processedData = fetchedData.map((entry) => ({
        date: entry._id,
        uniqueUsers: entry.uniqueUsers,
        totalRequests: entry.totalRequests,
      }));
      setData(processedData);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
    }
  };

  useEffect(() => {
    if (activeProject == null) {
      return;
    }
    fetchAndProcessData();
  }, [dateRange, activeProject, environment]);

  const closeHint = () => {
    setIsHintHidden(true)
    localStorage.setItem("hintHidden", "true")
  }

  const { setIsOpen, setCurrentStep } = useTour()

  useEffect(() => {
    setIsHintHidden(localStorage.getItem("hintHidden") == "true")
    if(!localStorage.getItem("didStartTour")){
      setIsOpen(true)
      localStorage.setItem("didStartTour", "true")
    }

  }, [])

  const processDataAndCreateGraph = (chartdata, title, categories) => {
    return (
      <Card className="dark-tremor h-90 !bg-[#32333b63] !rounded !mx-6">
        <div className="mb-2 text-[#cccccc] font-md">{title}</div>
        <LineChart className="dark-tremor" data={chartdata} index="date" categories={categories} yAxisWidth={40} colors={["indigo"]} />
      </Card>
    );
  };

  return (
    <div className="">
      <div className="flex flex-row items-center ml-10 mb-2 pt-2">
        {/* <div className="flex-col mr-4">
          <div className="font-bold text-[#cccccc] text-lg">{activeProjectName}</div>
        </div> */}
        {/* <div className="ml-auto mr-8 no-focus-ring">
          <DateRangePicker value={dateRange} onValueChange={setDateRange}></DateRangePicker>
        </div> */}

        {/* <Button
          className="ml-auto mr-10 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
          onClick={() => {}}
          text="Project Settings"
        /> */}
      </div>
      <div className="space-between mb-6 bg-[#32333b63] mx-10 rounded py-2 pb-4">
        <div className="mx-4 font-bold text-md mb-2">{activeProjectName} URLs</div>
        <div className="flex">
          <div className={`mx-4 space-y-1 ${environment == "test" ? "" : "opacity-70"}`}>
            <div className="flex">
              <Dot className="ml-0" color={testDeployStatus == "DEPLOYMENT_SUCCESS" ? "green" : "yellow"} />
              Test API
            </div>
            <div
              className="text-[#cccccc] font-mono cursor-pointer text-xs mt-0.5 mr-auto"
              onClick={() => {
                copyText(testDomain.replace("https://", "https://api."));
              }}
            >
              {testDomain ? testDomain.replace("https://", "https://api.") : "Provisioning..."}
            </div>
            <div className="h-1"></div>
            <div className="flex">
              <Dot className="ml-0" color={testDeployStatus == "DEPLOYMENT_SUCCESS" ? "green" : "yellow"} />
              Test Frontend
            </div>
            <div
              className="text-[#cccccc] font-mono cursor-pointer text-xs mt-0.5 mr-auto"
              onClick={() => {
                copyText(testDomain);
              }}
            >
              {testDomain ? testDomain : "Provisioning..."}
            </div>          
          </div>

          <div className={`ml-10 space-y-1 ${environment == "test" ? "opacity-70" : ""}`}>
            <div className="flex">
              <Dot className="ml-0" color={prodDeployStatus == "DEPLOYMENT_SUCCESS" ? "green" : "yellow"} />
              Production API
            </div>
            <div
              className="text-[#cccccc] font-mono cursor-pointer text-xs mt-0.5 mr-auto"
              onClick={() => {
                copyText(prodDomain.replace("https://", "https://api."));
              }}
            >
              {prodDomain ? prodDomain.replace("https://", "https://api.") : "Provisioning..."}
            </div>
            <div className="h-1"></div>
            <div className="flex">
              <Dot className="ml-0" color={prodDeployStatus == "DEPLOYMENT_SUCCESS" ? "green" : "yellow"} />
              Production Frontend
            </div>
            <div
              className="text-[#cccccc] font-mono cursor-pointer text-xs mt-0.5 mr-auto"
              onClick={() => {
                copyText(prodDomain);
              }}
            >
              {prodDomain ? prodDomain : "Provisioning..."}
            </div>          
          </div>
          <Button
            className="ml-auto mt-0 h-10 mr-4 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
            onClick={() => {
              window.open("https://docs.swizzle.co/custom-domains", "_blank");
            }}
            text="Custom Domain"
          />
        </div>

      </div>

      <div className={`space-between mb-6 bg-[#32333b63] mx-10 rounded py-2 pb-4 ${isHintHidden && "hidden"}`}>
        <div className="flex w-full">
          <div className="mx-4 font-bold text-md mb-2">
            Getting started
            <div className="m-auto ml-2 inline-flex items-center rounded-md bg-yellow-300 bg-opacity-30 px-2 mt-1 py-0.5 text-xs font-medium text-yellow-300 ring-1 ring-inset ring-yellow-300/20">
              Alpha
            </div>  
          </div>
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4 mt-0.5 ml-auto mr-2 cursor-pointer" onClick={closeHint} />
        </div>
        <div className="mx-4">
          <a href="#" onClick={() => { setCurrentStep(0); setIsOpen(true)}}>Start the guided tour</a>. You can help shape the future of Swizzle by <a href="https://discord.gg/CXCkzcqq" target="_blank" rel="nofollower">joining our Discord.</a>
        </div>
        <div className="mx-4 mt-2">
          Setup the accounts in
          <img src="/auth.svg" className="w-3 h-3 inline-block align-middle mb-0.5 mx-1" /> 
          <span className="font-bold mr-1">Users.</span>
        </div>
        <div className="mx-4 mt-2">
          Build the core logic in 
          <img src="/cloud.svg" className="w-3 h-3 inline-block align-middle mb-0.5 mx-1" /> 
          <span className="font-bold mr-1">Backend.</span>
        </div>
        <div className="mx-4 mt-2">
          Build the interface in 
          <img src="/world.svg" className="w-3 h-3 inline-block align-middle mb-0.5 mx-1" /> 
          <span className="font-bold mr-1">Frontend.</span>
        </div>
        <div className="mx-4 mt-2">
          Use the 
          <img src="/database.svg" className="w-3 h-3 inline-block align-middle mb-0.5 mx-1" /> 
          <span className="font-bold mr-1">Database</span>
          to save data quickly and 
          <img src="/files.svg" className="w-3 h-3 inline-block align-middle mb-0.5 mx-1" /> 
          <span className="font-bold mr-1">Storage</span>
          to save big files.
        </div>
        {/* <div className="mx-4 mt-2">
          Read <a href="https://docs.swizzle.co" target="_blank" rel="nofollow">the docs</a> to learn more.
        </div> */}
      </div>

      <div className="no-focus-ring pt-2">
        {data.length > 0 ? (
          <>
            <div className="p-4 pt-0 flex flex-row space-x-2">
              {processDataAndCreateGraph(data, "Unique Users", ["uniqueUsers"])}
              {processDataAndCreateGraph(data, "Total Requests", ["totalRequests"])}
            </div>
          </>
        ) : (
          <div className="">
            <div className="flex flex-col items-center justify-center mt-48 opacity-70">
              You'll see analytics here once you've deployed your API.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
