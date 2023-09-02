import { useState, useEffect, useContext } from "react";
import { Card, Title, LineChart } from "@tremor/react";
import useApi from "../../API/MonitoringAPI";
import { DateRangePicker, DateRangePickerValue } from "@tremor/react";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function AnalyticsPage() {
  const api = useApi();
  const { activeProject } = useContext(SwizzleContext);

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
  }, [dateRange, activeProject]);

  const processDataAndCreateGraph = (chartdata, title, categories) => {
    return (
      <Card className="dark-tremor h-90">
        <Title className="mb-2">{title}</Title>
        <LineChart
          className="dark-tremor"
          data={chartdata}
          index="date"
          categories={categories}
          yAxisWidth={40}
        />
      </Card>
    );
  };

  return (
    <div className="no-focus-ring">
      <div className="ml-10">
        <DateRangePicker
          value={dateRange}
          onValueChange={setDateRange}
        ></DateRangePicker>
      </div>
      <div className="p-5 pt-2 flex flex-row space-x-2">
        {processDataAndCreateGraph(data, "Unique Users", ["uniqueUsers"])}
        {processDataAndCreateGraph(data, "Total Requests", ["totalRequests"])}
      </div>
    </div>
  );
}
