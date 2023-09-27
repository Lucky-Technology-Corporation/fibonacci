import { faRotateRight, faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import Dot from "../../Utilities/Dot";
import IconButton from "../../Utilities/IconButton";
import { useContext, useEffect, useState } from "react";
import InfoItem from "../../Utilities/Toast/InfoItem";
import useApi from "../../API/MonitoringAPI";
import toast from "react-hot-toast";
import axios from "axios";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function LogRow({ message, freshLogs, setModalText }: { message: any, freshLogs: () => {}, setModalText: (text: string) => void }) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [logDetails, setLogDetails] = useState<[] | null>(null);
  const { getLogDetails, analyzeError } = useApi();
  const { domain } = useContext(SwizzleContext);

  useEffect(() => {
    if (isExpanded && logDetails == null) {
      getLogDetails(message.traceId).then((data) => {
        if (data == null || data.logs == null) {
          setLogDetails([]);
          return;
        }
        setLogDetails(data.logs);
      });
    }
  }, [isExpanded]);

  useEffect(() => {
    setIsExpanded(false);
    setLogDetails(null);
  }, [message]);

  const formatDate = (inputDateStr: string) => {
    const date = new Date(inputDateStr);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const hour = date.getHours() % 12 || 12; // Convert to 12-hour format and make it 12 instead of 0
    const minute = date.getMinutes().toString().padStart(2, "0"); // Add leading zero to single-digit minute
    const second = date.getSeconds().toString().padStart(2, "0"); // Add leading zero to single-digit second
    const ampm = date.getHours() >= 12 ? "pm" : "am";

    const formattedDate = `${month} ${day} ${hour}:${minute}:${second} ${ampm}`;
    return formattedDate;
  };

  const retryRequest = async () => {
    if(message.method == "GET"){
      await axios.get(domain + message.url, { headers: message.headers })
    } else if(message.method == "POST"){
      await axios.post(domain + message.url, message.request, { headers: message.headers })
    }
    return freshLogs()
  }

  const fixRequest = async () => {
    setModalText("heheh")
    // const response = await analyzeError(message)
    // setModalText(response)    
  }

  return (
    <>
      <tr
        className={`${
          isExpanded ? "border-none" : "border-b"
        } border-[#4C4F6B] h-[48px] hover:bg-[#85869855] cursor-pointer`}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <td className="text-left pl-4">
          <IconButton icon={<FontAwesomeIcon icon={faRotateRight} className="py-1" />} onClick={() => {

            toast.promise(retryRequest(), {
              loading: "Retrying request...",
              success: "Returned successfully",
              error: "Returned with an error",
            });
            
          }} />
        </td>
        <td className="text-left pl-4">
          <IconButton icon={<FontAwesomeIcon icon={faWrench} className="py-1" />} onClick={() => {

            toast.promise(fixRequest(), {
              loading: "Looking at your code...",
              success: "Found an answer",
              error: "Couldn't find an answer",
            });
            
          }} />
        </td>

        <td className="text-left pl-4">{formatDate(message.createdAt)}</td>
        <td className="text-left pl-4">
          {message.method} {message.url.split("?")[0]}
        </td>
        <td className="text-left pl-4 font-bold">
          <div className="flex">
            <Dot color={message.responseCode > 202 ? "yellow" : "green"} className="ml-0 mr-2" />
            <div>{message.responseCode}</div>
          </div>
        </td>
        <td className={`text-left pl-4 ${message.userId == null ? "" : ""}`}>
          {message.userId || "None"}
        </td>
        <td className="text-left pl-4">
          <InfoItem
            content={<div className="text-xs font-mono underline decoration-dotted">Request</div>}
            toast={{
              title: "",
              content: (
                <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap word-break break-all">
                  {JSON.stringify(message.request, null, 2)}
                </div>
              ),
              isLarge: false,
            }}
            position="bottom-center"
          />
        </td>
        <td className="text-left pl-4">
          <InfoItem
            content={<div className="text-xs font-mono underline decoration-dotted">Response</div>}
            toast={{
              title: "",
              content: (
                <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap word-break break-all">
                  {JSON.stringify(message.response, null, 2)}
                </div>
              ),
              isLarge: false,
            }}
            position="bottom-center"
          />
        </td>
        <td className="text-left pl-4">{message.timeTaken || "?? "}ms</td>
        <td className="text-right pl-4">
          <ArrowRightIcon
            className={`w-6 h-6 ml-auto mr-2 ${isExpanded ? "rotate-90" : "rotate-0"}`}
            style={{
              transition: "transform .2s",
            }}
          />
        </td>
      </tr>
      <tr className={`${isExpanded ? "" : "hidden"} border-b border-[#4C4F6B]`}>
        <td colSpan={9} className="text-left pl-20 text-xs py-3 word-wrap max-w-full font-mono">
          {logDetails == null
            ? "Loading..."
            : logDetails.length == 0
            ? "No logs"
            : logDetails.map((log: any, index) => (
                <div className="font-mono" key={index}>
                  {log.text}
                </div>
              ))}
        </td>
      </tr>
    </>
  );
}
