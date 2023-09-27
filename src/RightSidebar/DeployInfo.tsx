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

export default function DeployInfo ({ setShouldShowDeployInfo} : DeployInfoProps) {
    const api = useApi();
    const myRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.getDeploymentStatus();
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
    ])

    return (
        
        <div
      className={`  w-[350px]  bg-[#191A23] border border-[#f07434] rounded-lg shadow-lg pt-2 `}
      style={{
        transition: "opacity 0.1s",
        marginTop: "0px",
      }}
      ref={myRef}
    >
        {logs.map((log, index) => (
                    <div key={index} 
                    className = 'flex flex-col'
                    style={{ 
                        padding: '10px 0',
                        marginLeft: '12px',
                        borderBottom: index !== logs.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                        <div className="font-bold">Deployment {log.number} </div>
                        <div style={{ color: 
                        log.status === 'BUILD_SUCCESS' ? '#00df17':
                        log.status === 'BUILD_FAILURE' ? '#e50201' : 
                        'yellow'}}>
                            {log.status}
                        </div>
                    </div>
                ))}
            
        </div>
        
    );  
} 