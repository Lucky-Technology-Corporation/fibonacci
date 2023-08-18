import { Card, Title, LineChart } from "@tremor/react";
import { useState, useEffect } from "react";
import useApi from "../../API/MonitoringAPI";
import { DateRangePicker, DateRangePickerProps} from "@tremor/react";

export default function AnalyticsPage(){
    const api = useApi();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [data, setData] = useState<any[]>([]); 

    const handleDateRangeChange = (start: Date | null, end: Date | null) => {
      setStartDate(start);
      setEndDate(end);
    };
    
    useEffect(() => {
        const fetchAndProcessData = async () => {
          try {
            const startDateStr = startDate?.toISOString() || "";
            const endDateStr = endDate?.toISOString() || "";
            const fetchedData = await api.getData(startDateStr, endDateStr);
            setData(fetchedData);
          } catch (error) {
            console.error('Error fetching monitoring data:', error);
          }
        };
    
        fetchAndProcessData();
      }, [api, startDate, endDate]);

     
    const processDataAndCreateGraph = (chartdata, title, categories) => {
      return (
          <Card className="dark-tremor h-90">
              <Title>{title}</Title>
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
            />
            <div className="p-5 flex flex-row space-x-2">
                {processDataAndCreateGraph(data, "Unique Users", ["uniqueUsers"])}
                {processDataAndCreateGraph(data, "Total Requests", ["totalRequests"])}
            </div>
        </div>

      );    
}