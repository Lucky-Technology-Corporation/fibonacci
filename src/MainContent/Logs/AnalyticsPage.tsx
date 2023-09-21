import { useState, useEffect, useContext } from "react";
import { Card, Title, LineChart } from "@tremor/react";
import useApi from "../../API/MonitoringAPI";
import { DateRangePicker, DateRangePickerValue } from "@tremor/react";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import Dot from "../../Utilities/Dot";
import { copyText } from "../../Utilities/Copyable";
import Button from "../../Utilities/Button";

export default function AnalyticsPage() {
  const api = useApi();
  const { activeProject, environment, activeProjectName, testDomain, prodDomain, testDeployStatus, prodDeployStatus } = useContext(SwizzleContext);

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
    console.log("fetching...");
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

      <div className="flex flex-row items-center ml-10 mb-8 pt-2">
        <div> 
          <Title className="font-bold text-[#cccccc]">{activeProjectName}</Title>
          <span>Last deployment 2 hours ago</span>
        </div>
        <div className="flex flex-col items-start ml-6 space-y-0.5">
          <div className="flex justify-between w-full"><div className="flex w-32"><Dot className="ml-0" color={testDeployStatus == "live" ? "green" : "yellow"} />Test API</div><div className="text-[#cccccc] font-mono cursor-pointer text-xs mt-0.5 mr-auto" onClick={() => { copyText(testDomain)}}>{testDomain}</div></div>
          <div className="flex justify-between w-full"><div className="flex w-32"><Dot className="ml-0" color={prodDeployStatus == "live" ? "green" : "yellow"} />Production API</div><div className="text-[#cccccc] font-mono cursor-pointer text-xs mt-0.5 mr-auto" onClick={() => {copyText(prodDomain)}}>{prodDomain}</div></div>
        </div>
        <Button
          className="ml-auto mr-10 px-5 py-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
          onClick={() => { }}
          text="Project Settings"
        />
      </div>

      <div className="no-focus-ring pt-2">
        {/* <Title className="ml-10 mb-4 text-[#cccccc]">Analytics</Title> */}
        <div className="ml-10">
          <DateRangePicker value={dateRange} onValueChange={setDateRange}></DateRangePicker>
        </div>
        <div className="p-4 pt-0 flex flex-row space-x-2">
          {processDataAndCreateGraph(data, "Unique Users", ["uniqueUsers"])}
          {processDataAndCreateGraph(data, "Total Requests", ["totalRequests"])}
        </div>
      </div>
    </div>
  );
}
