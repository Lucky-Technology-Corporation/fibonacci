import { Card, DateRangePicker, DateRangePickerValue, LineChart } from "@tremor/react";
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

  const processDataAndCreateGraph = (chartdata, title, categories) => {
    return (
      <Card className="dark-tremor h-90">
        <div className="mb-2 text-[#cccccc] font-md">{title}</div>
        <LineChart className="dark-tremor" data={chartdata} index="date" categories={categories} yAxisWidth={40} />
      </Card>
    );
  };

  return (
    <div className="">
      <div className="flex flex-row items-center ml-10 mb-2 pt-2">
        <div className="flex-col mr-4">
          <div className="font-bold text-[#cccccc] text-lg">{activeProjectName}</div>
        </div>
       
        <Button
          className="ml-auto mr-10 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
          onClick={() => {}}
          text="Project Settings"
        />
      </div>
      <div className="flex space-between mb-6">
        <div className="ml-10 space-y-1">
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
            <Dot className="ml-0" color={prodDeployStatus == "DEPLOYMENT_SUCCESS" ? "green" : "yellow"} />
            Test App
          </div>
          <div
            className="text-[#cccccc] font-mono cursor-pointer text-xs mt-0.5 mr-auto"
            onClick={() => {
              copyText(testDomain);
            }}
          >
            {testDomain}
          </div>          
        </div>


        <div className="mr-10 ml-auto space-y-1">
          <div className="flex">
            <Dot className="ml-0" color={testDeployStatus == "DEPLOYMENT_SUCCESS" ? "green" : "yellow"} />
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
            Production App
          </div>
          <div
            className="text-[#cccccc] font-mono cursor-pointer text-xs mt-0.5 mr-auto"
            onClick={() => {
              copyText(prodDomain);
            }}
          >
            {prodDomain}
          </div>          
        </div>
      </div>

      <div className="no-focus-ring pt-2">
        {data.length > 0 ? (
          <>
            <div className="ml-10">
              <DateRangePicker value={dateRange} onValueChange={setDateRange}></DateRangePicker>
            </div>
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
