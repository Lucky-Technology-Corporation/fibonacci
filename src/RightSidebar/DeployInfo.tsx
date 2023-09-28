import { useState, useEffect, useRef } from 'react';
import useApi from '../API/DeploymentAPI';

type DeployInfoProps = {
    setShouldShowDeployInfo: (value: boolean) => void;
}

type DeploymentLog = {
    number: number;
    status: string;
    date: string; 
    time: string;
}

export default function DeployInfo ({ setShouldShowDeployInfo } : DeployInfoProps) {
    const api = useApi();
    const myRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.listProjectBuilds(1, 20);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (myRef.current && !myRef.current.contains(event.target)) {
                setShouldShowDeployInfo(false);
            }
        }
        window.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const [logs, setLogs] = useState<DeploymentLog[]>([
        { number: 1, status: 'BUILD_SUCCESS', date: 'Sept 26', time: '10:58am' },
        { number: 2, status: 'BUILD_FAILURE', date: 'Sept 25', time: '10:58am'},
        { number: 3, status: 'BUILD_IN_PROGRESS', date: 'Sept 24', time: '10:58am' }
    ]);

    return (
        <div
            className={`w-[370px] bg-[#191A23] border border-[#f07434] rounded-lg shadow-lg pt-2 pb-2`}
            style={{ transition: "opacity 0.1s", marginTop: "0px" }}
            ref={myRef}
        >
            {logs.map((log, index) => {
                let statusText;
                let color;
        
                switch(log.status) {
                    case 'BUILD_SUCCESS':
                        statusText = 'Success';
                        color = '#00df17';
                        break;
                    case 'BUILD_FAILURE':
                        statusText = 'Failed';
                        color = '#e50201';
                        break;
                    default:
                        statusText = 'In Progress';
                        color = 'yellow';
                }

                return (
                    <div key={index}
        className='flex justify-between items-center' 
        style={{
            padding: '10px 0',
            marginLeft: '12px',
        }}
    >
        <div className="flex flex-col"> 
            <div className="font-bold">Deployment {log.number}</div>
            <div style={{ color: color }}>
                {statusText} 
                <div className="text-[#a4acbc] inline-block ml-2"> 
                {log.date} at {log.time}
                </div>
            </div>
           
        </div>

        <div className="flex">
        <button 
            className="border border-[#a4acbc] hover:bg-[#2f2f36] w-9 py-1.5 rounded mr-4"> 
            <img src="eye.png" alt="eye" className="w-4 h-4 flex-center  inline-block" />
        </button>
        <button 
            className="border border-orange-400 hover:bg-[#2f2f36] w-9 py-1.5 rounded mr-4"> 
            <img src="turnback.png" alt="turnback" className="w-4 h-4 flex-center inline-block" />
        </button>
    </div>
    </div>

                );
            })}
        </div>
    );  
}
