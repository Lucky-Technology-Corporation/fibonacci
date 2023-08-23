import { useState, useEffect } from "react";
import { Card, Title, LineChart } from "@tremor/react";
import useApi from "../../API/MonitoringAPI";
import { DateRangePicker, DateRangePickerValue } from "@tremor/react";

export default function AnalyticsPage() {
   const api = useApi();

   const [dateRange, setDateRange] = useState<DateRangePickerValue>({
      from: new Date(),
      to: new Date(),
   });

   const [data, setData] = useState<any[]>([]);

   useEffect(() => {
      const fetchAndProcessData = async () => {
         try {
            const startDateStr = dateRange.from.toISOString();
            console.log(startDateStr);
            const endDateStr = dateRange.to.toISOString();
            const fetchedData = await api.getData(startDateStr, endDateStr);
            setData(fetchedData);
         } catch (error) {
            console.error("Error fetching monitoring data:", error);
         }
      };

      fetchAndProcessData();
   }, [dateRange]);

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
      <div>
         <DateRangePicker
            value={dateRange} // Pass the dateRange state
            onValueChange={setDateRange} // Pass the setDateRange function
            className="ml-5" //TODO: remove the focus ring from this
         ></DateRangePicker>
         <div className="p-5 flex flex-row space-x-2">
            {processDataAndCreateGraph(data, "Unique Users", ["uniqueUsers"])}
            {processDataAndCreateGraph(data, "Total Requests", [
               "totalRequests",
            ])}
         </div>
      </div>
   );
}
