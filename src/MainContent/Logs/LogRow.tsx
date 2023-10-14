import { faRotateRight, faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useMonitoringApi from "../../API/MonitoringAPI";
import { copyText } from "../../Utilities/Copyable";
import { replaceCodeBlocks } from "../../Utilities/DataCaster";
import Dot from "../../Utilities/Dot";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import IconButton from "../../Utilities/IconButton";
import InfoItem from "../../Utilities/Toast/InfoItem";

export default function LogRow({
  message,
  freshLogs,
  setModalText,
}: {
  message: any;
  freshLogs: () => {};
  setModalText: (text: ReactNode) => void;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { getLogDetails, analyzeError } = useMonitoringApi();
  const { domain } = useContext(SwizzleContext);

  useEffect(() => {
    setIsExpanded(false);
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

  const forbiddenHeaders = [
    "Accept-Charset", "Accept-Encoding", "Access-Control-Request-Headers",
    "Access-Control-Request-Method", "Connection", "Content-Length",
    "Cookie", "Cookie2", "Date", "DNT", "Expect", "Host",
    "Keep-Alive", "Origin", "Proxy-", "Sec-", "Referer",
    "TE", "Trailer", "Transfer-Encoding", "Upgrade", "Via", "User-Agent"
  ].map(h => h.toLowerCase());

  function filterHeaders(headers) {
    const filteredHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      const keyLower = key.toLowerCase();
      if (!forbiddenHeaders.some(forbidden => forbidden.toLowerCase() === keyLower) && !keyLower.startsWith('proxy-') && !keyLower.startsWith('sec-')) {
        filteredHeaders[key] = value;
      }
    }
    return filteredHeaders;
  }
  const retryRequest = async () => {
    try{
      if (message.method == "GET") {
        await axios.get(domain.replace("https://", "https://api.") + message.url, { headers: filterHeaders(message.headers) });
      } else if (message.method == "POST") {
        await axios.post(domain.replace("https://", "https://api.") + message.url, message.request, { headers: filterHeaders(message.headers) });
      }
      return freshLogs();
    } catch(e){
      return freshLogs();
    }
  };

  const fixRequest = async () => {
    const response = await analyzeError(message);
    if (response == null) {
      return "Something went wrong";
    }
    setModalText(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(response.recommendation_text) }} />);
  };

  const getIconForLevel = (level: string) => {
    if(level == "error"){
      return <img src="/error.svg" className="w-4 h-4" />
    }
    else if(level == "warn"){
      return <img src="/warn.svg" className="w-4 h-4" />
    }
    else{
      return <img src="/log.svg" className="w-4 h-4" />
    }
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
          <IconButton
            icon={<FontAwesomeIcon icon={faRotateRight} className="py-1" />}
            onClick={(e) => {
              e.stopPropagation()
              toast.promise(retryRequest(), {
                loading: "Retrying request...",
                success: () => {
                  return "Retried successfully";
                },
                error: () => {
                  return "Retried and got an error"
                }
              });
            }}
          />
        </td>
        <td className={`text-left pl-4 ${message.responseCode < 300 ? "opacity-50 pointer-events-none" : ""}`}>
          <IconButton
            icon={<FontAwesomeIcon icon={faWrench} className="py-1" />}
            onClick={(e) => {
              e.stopPropagation()
              if(message.responseCode < 400){
                toast("This request didn't return an error.")
              } else if(message.responseCode < 500 && message.responseCode >= 400){
                //get an INFO response
              } else{
                toast.promise(fixRequest(), {
                  loading: "Looking at your code...",
                  success: "Found an answer",
                  error: "Couldn't find an answer",
                });
              }
            }}
          />
        </td>

        <td className="text-left pl-4">{formatDate(message.createdAt)}</td>
        <td className="text-left pl-4">
          {message.method} {message.url.split("?")[0]}
        </td>
        <td className="text-left pl-4 font-bold">
          <div className="flex">
            <Dot color={message.responseCode >= 500 ? "red" : (message.responseCode >= 400 ? "yellow" : "green")} className="ml-0 mr-2" />
            <div>{message.responseCode}</div>
          </div>
        </td>
        <td className={`text-left pl-4 ${message.userId == null ? "" : ""}`}>{message.userId || "None"}</td>
        <td className="text-left pl-4">
          <InfoItem
            content={<div className="text-xs font-mono underline decoration-dotted">Request</div>}
            toast={{
              title: "Click to copy",
              content: (
                <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap word-break break-all">
                  {JSON.stringify(message.request, null, 2)}
                </div>
              ),
              isExpandable: true,
            }}
            onClick={() => {
              copyText(message.response);
            }}
            position="bottom-center"
          />
        </td>
        <td className="text-left pl-4">
          <InfoItem
            content={<div className="text-xs font-mono underline decoration-dotted">Response</div>}
            toast={{
              title: "Click to copy",
              content: (
                <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap word-break break-all">
                  {JSON.stringify(message.response, null, 2)}
                </div>
              ),
              isExpandable: true,
            }}
            onClick={() => {
              copyText(message.response);
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
        <td colSpan={9} className="text-left pl-6 text-xs py-3 word-wrap max-w-full font-mono">
          <div className="font-mono">{(message.logs || []).map(logString => {
            var log = JSON.parse(logString);
            return (
              <div className={`mb-1 flex`}>
                <div className="mr-2">{new Date(log.timestamp).toLocaleTimeString()}</div>
                <div className="mr-2">{getIconForLevel(log.level)}</div>
                <div className={log.level == "error" ? "text-red-400" : log.level == "warn" ? "text-yellow-400" : "text-[#d2d3e0]"}>{log.text}</div>
              </div>
            )
          })}</div>
        </td>
      </tr>
    </>
  );
}
