import React, { useEffect, useState } from 'react';
import useApi from '../API/MonitoringAPI';
import { Card, Title, LineChart } from "@tremor/react";
import Button from '../Utilities/Button';
import HoverableObject from './Editor/HoverableObject';
//import { Card as TremorCard, Title, LineChart } from "@tremor/react";

const MonitoringPage: React.FC = () => {
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
        );
      };
      

      const createEndpointStatusTable = () => {
        return (
          <table className="w-full h-full">
            <thead className="bg-[#85869822]">
                <tr className="border-b border-[#4C4F6B]">
                    <th className="text-left py-1 pl-4 w-10"></th>
                    <th className="text-left py-1 pl-4">Endpoint</th>
                    <th className="text-left py-1 pl-4">Error Rate (24 hrs)</th>
                    <th className="text-left py-1 pl-4">Response Time (24 hrs)</th>
                    <th className="text-left py-1 pl-4">Last Requested</th>
                    <th className="text-left py-1 pl-4 rounded-tr-md"></th>
                </tr>
            </thead>
            <tbody className="overflow-y-scroll">
              <tr className="border-b border-[#4C4F6B] h-[40px] hover:bg-[#85869855]">
                    <td className="text-left pl-4">🔴</td>
                    <td className="text-left pl-4 font-mono">
                       <span className='text-green-300 font-bold'>GET</span> /users/:userId
                    </td>
                    <td className="text-left pl-4 font-bold text-red-500">25%</td>
                    <td className="text-left pl-4">5ms</td>
                    <td className="text-left pl-4">12 mins ago</td>
                    <td className="w-24 pr-2">
                        <Button text="Logs" onClick={() => {}} />
                    </td>
                </tr>
              <tr className="border-b border-[#4C4F6B] h-[40px] hover:bg-[#85869855]">
                    <td className="text-left pl-4">🟡</td>
                    <td className="text-left pl-4 font-mono">
                    <span className='text-blue-300 font-bold'>POST</span> /users/admin
                    </td>
                    <td className="text-left pl-4">0.12%</td>
                    <td className="text-left pl-4 font-bold text-yellow-400">1200ms</td>
                    <td className="text-left pl-4">1 min ago</td>
                    <td className="w-24 pr-2">
                        <Button text="Logs" onClick={() => {}} />
                    </td>
                </tr>
                <tr className="border-b border-[#4C4F6B] h-[40px] hover:bg-[#85869855]">
                    <td className="text-left pl-4">🟢</td>
                    <td className="text-left pl-4 font-mono">
                      <span className='text-blue-300 font-bold'>POST</span> /users
                    </td>
                    <td className="text-left pl-4">0.2%</td>
                    <td className="text-left pl-4">25ms</td>
                    <td className="text-left pl-4">5 mins ago</td>
                    <td className="w-24 pr-2">
                        <Button text="Logs" onClick={() => {}} />
                    </td>
                </tr>
                <tr className="border-b border-[#4C4F6B] h-[40px] hover:bg-[#85869855]">
                    <td className="text-left pl-4">🟢</td>
                    <td className="text-left pl-4 font-mono">
                      <span className='text-green-300 font-bold'>GET</span> /posts
                    </td>
                    <td className="text-left pl-4">0.05%</td>
                    <td className="text-left pl-4">21ms</td>
                    <td className="text-left pl-4">2 mins ago</td>
                    <td className="w-24 pr-2">
                        <Button text="Logs" onClick={() => {}} />
                    </td>
                </tr>
                <tr>
                </tr>
            </tbody>
          </table>
        )
      }

  

  return (
    <div>
        <div className="p-5 flex flex-row space-x-2">
          {processDataAndCreateGraph(uniqueusersdata, "Unique Users", ["uniqueUsers"])}
          {processDataAndCreateGraph(totalrequestsdata, "Total Requests", ["totalRequests"])}
        </div>
        <div className='p-5 flex'>
          {createEndpointStatusTable()}
        </div>
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

export default MonitoringPage;


//<InsertTestDataButton onClick={handleInsertTestData}/>
