import { useEffect, useRef, useState } from "react";
import useDeploymentApi from "../API/DeploymentAPI";

type DeployInfoProps = {
  shouldShowDeployInfo: boolean;
  setShouldShowDeployInfo: (value: boolean) => void;
  setShouldCancelHide: (value: boolean) => void;
};

type DeploymentLog = {
  buildNumber: number;
  status: string;
  startedAtDate: string;
  startedAtTime: string;
  endedAtDate: string;
  endedAtTime: string;
};

export default function DeployInfo({
  shouldShowDeployInfo,
  setShouldShowDeployInfo,
  setShouldCancelHide,
}: DeployInfoProps) {
  const api = useDeploymentApi();
  const myRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);

  const fetchBuildData = async () => {
    const response = await api.listProjectBuilds(0, 20);
    if (response && Array.isArray(response.builds)) {
      const deploymentLogs: DeploymentLog[] = response.builds.map((build) => {
        const startDateObj = new Date(build.started_at);
        const endDateObj = new Date(build.ended_at);
        return {
          buildNumber: build.build_number,
          status: build.status,
          startedAtDate: `${startDateObj.getMonth() + 1}/${startDateObj.getDate()}/${startDateObj.getFullYear()}`,
          startedAtTime: `${startDateObj.getHours()}:${String(startDateObj.getMinutes()).padStart(2, "0")}`,
          endedAtDate: `${endDateObj.getMonth() + 1}/${endDateObj.getDate()}/${endDateObj.getFullYear()}`,
          endedAtTime: `${endDateObj.getHours()}:${String(endDateObj.getMinutes()).padStart(2, "0")}`,
        };
      });
      setLogs(deploymentLogs);
    } else {
      console.error("Unexpected response format:", response);
    }
  };

  useEffect(() => {
    if (shouldShowDeployInfo) {
      fetchBuildData();
    }
  }, [shouldShowDeployInfo]);

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (myRef.current && !myRef.current.contains(event.target)) {
  //       setShouldShowDeployInfo(false);
  //     }
  //   }
  //   window.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     window.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <div
      className={`z-50 w-[370px] text-sm bg-[#252629] border border-gray-700 rounded-lg shadow-lg pt-2 pb-2 ${
        shouldShowDeployInfo ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ transition: "opacity 0.2s", marginTop: "0px" }}
      ref={myRef}
      onMouseEnter={() => {
        setShouldCancelHide(true);
      }}
      onMouseLeave={() => {
        setShouldCancelHide(false);
      }}
    >
      {logs.length === 0 ? (
        <div className="text-center p-4 text-sm">No deployments yet</div>
      ) : (
        logs.map((log, index) => {
          let statusText;
          let color;

          switch (log.status) {
            case "BUILD_SUCCESS":
              statusText = "Success";
              color = "#00df17";
              break;
            case "BUILD_FAILURE":
              statusText = "Failed";
              color = "#e50201";
              break;
            default:
              statusText = "In Progress";
              color = "yellow";
          }

          return (
            <div
              key={index}
              className="flex justify-between items-center"
              style={{
                padding: "10px 0",
                marginLeft: "12px",
              }}
            >
              <div className="flex flex-col">
                <div className="font-bold">Deployment {log.buildNumber}</div>
                <div style={{ color: color }}>
                  {statusText}
                  <div className="text-[#a4acbc] inline-block ml-2">
                    {log.startedAtDate} at {log.startedAtTime}
                  </div>
                </div>
              </div>

              {/* <div className="flex">
                <button className="border border-[#a4acbc] hover:bg-[#2f2f36] w-9 py-1.5 rounded mr-4">
                  <img src="eye.png" alt="eye" className="w-4 h-4 flex-center  inline-block" />
                </button>
                <button className="border border-orange-400 hover:bg-[#2f2f36] w-9 py-1.5 rounded mr-4">
                  <img src="turnback.png" alt="turnback" className="w-4 h-4 flex-center inline-block" />
                </button>
              </div> */}
            </div>
          );
        })
      )}
    </div>
  );
}
