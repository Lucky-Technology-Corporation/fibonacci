import React, { useEffect, useState } from 'react';
import useApi from '../API/MonitoringAPI';
import { Card, Title, LineChart } from "@tremor/react";
//import { Card as TremorCard, Title, LineChart } from "@tremor/react";

const MonitoringPageOld: React.FC = () => {
    const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
    const api = useApi();
    const [isTestDataInserted, setIsTestDataInserted] = useState(false); // State to track if test data is inserted

    useEffect(() => {
        const fetchAndProcessData = async () => {
          try {
            const data = await api.getMonitoring();
            setMonitoringData(data);

            console.log(data)
            if (data && data.length > 0) {
              processDataAndCreateGraph(data);
            }
          } catch (error) {
            console.error('Error fetching monitoring data:', error);
          }
        };
    
        fetchAndProcessData();
      }, []);

      const handleInsertTestData = () => {
        setIsTestDataInserted(true);
      }

      const uniqueusersdata: UniqueUserData[] = [
        {
          date: 2020,
          uniqueUsers: 1000,
        },
        {
          date: 2021,
          uniqueUsers: 1200,
        },
        {
          date: 2022,
          uniqueUsers: 900,
        },
        {
          date: 2023,
          uniqueUsers: 800,
        },
        {
          date: 2024,
          uniqueUsers: 1100,
        },
        {
          date: 2025,
          uniqueUsers: 1300,
        },
        {
          date: 2026,
          uniqueUsers: 950,
        },
        {
          date: 2027,
          uniqueUsers: 1050,
        },
        {
          date: 2028,
          uniqueUsers: 750,
        },
        {
          date: 2029,
          uniqueUsers: 800,
        },
      ];

      const totalrequestsdata: TotalRequestsData[] = [
        {
          date: 2020,
          totalRequests: 100,
        },
        {
          date: 2021,
          totalRequests: 2000,
        },
        {
          date: 2022,
          totalRequests: 200,
        },
        {
          date: 2023,
          totalRequests: 800,
        },
        {
          date: 2024,
          totalRequests: 1100,
        },
        {
          date: 2025,
          totalRequests: 1300,
        },
        {
          date: 2026,
          totalRequests: 950,
        },
        {
          date: 2027,
          totalRequests: 200,
        },
        {
          date: 2028,
          totalRequests: 750,
        },
        {
          date: 2029,
          totalRequests: 800,
        },
      ];
      

      //const dataFormatter = (number: number) => `${Intl.NumberFormat("us").format(number).toString()}`;

      const processDataAndCreateGraph = (chartdata, title, categories) => {
        return (
          <div className="p-5 flex flex-row">
          <Card className="dark-tremor h-90">
            <Title>{title}</Title>
            <LineChart
              className="dark-tremor"
              data={chartdata}
              index="date"
              categories={categories}
              yAxisWidth={40}
              theme="dark-tremor"
            />
          </Card>
          </div>
        );
      };
      

  

  return (
    <div>
              {processDataAndCreateGraph(uniqueusersdata, "Unique Users", ["uniqueUsers"])}
              {processDataAndCreateGraph(totalrequestsdata, "Total Requests", ["totalRequests"])}

    </div>
  );
};

// Define the shape of your monitoring data
interface UniqueUserData {
  date: number;
  uniqueUsers: number;
}
interface TotalRequestsData {
  date: number;
  totalRequests: number;
}

export default MonitoringPageOld;


//<InsertTestDataButton onClick={handleInsertTestData}/>
