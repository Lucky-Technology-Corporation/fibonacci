import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import Dot from "../../Utilities/Dot";
import IconButton from "../../Utilities/IconButton";
import { useEffect, useState } from "react";
import InfoItem from "../../Utilities/Toast/InfoItem";
import useApi from "../../API/MonitoringAPI";

export default function LogRow({message}: {message: any}) {
   const [isExpanded, setIsExpanded] = useState<boolean>(false);
   const [logDetails, setLogDetails] = useState<[] | null>(null);
   const {getLogDetails} = useApi();

   useEffect(() => {
      if(isExpanded && logDetails == null){
         getLogDetails(message.traceId).then((data) => {
            if(data.logs == null){ setLogDetails([]); return; }
            setLogDetails(data.logs)
         })
      }
   }, [isExpanded])

   const formatDate = (inputDateStr: string) => {
      const date = new Date(inputDateStr);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      const hour = date.getHours() % 12 || 12; // Convert to 12-hour format and make it 12 instead of 0
      const minute = date.getMinutes().toString().padStart(2, '0'); // Add leading zero to single-digit minute
      const second = date.getSeconds().toString().padStart(2, '0'); // Add leading zero to single-digit second
      const ampm = date.getHours() >= 12 ? 'pm' : 'am';
      
      const formattedDate = `${month} ${day} ${hour}:${minute}:${second} ${ampm}`;
      return formattedDate;
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
                  icon={
                     <FontAwesomeIcon icon={faRotateRight} className="py-1" />
                  }
                  onClick={() => {}}
               />
            </td>
            <td className="text-left pl-4">{formatDate(message.createdAt)}</td>
            <td className="text-left pl-4">{message.method} {message.url}</td>
            <td className="text-left pl-4 font-bold">
               <div className="flex">
                  <Dot color={message.responseCode > 202 ? "yellow" : "green"} className="ml-0 mr-2" />
                  <div>{message.responseCode}</div>
               </div>
            </td>
            <td className={`text-left pl-4 ${message.userId == null ? "" : "font-bold underline decoration-dotted"}`}>{message.userId || "None"}</td>
            <td className="text-left pl-4">
               <InfoItem
                  content={
                     <div className="text-xs font-mono underline decoration-dotted">
                        Request
                     </div>
                  }
                  toast={{
                     title: "",
                     content: (
                        <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap">
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
                  content={
                     <div className="text-xs font-mono underline decoration-dotted">
                        Response
                     </div>
                  }
                  toast={{
                     title: "",
                     content: (
                        <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap">
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
                  className={`w-6 h-6 ml-auto mr-2 ${
                     isExpanded ? "rotate-90" : "rotate-0"
                  }`}
                  style={{
                     transition: "transform .2s",
                  }}
               />
            </td>
         </tr>
         <tr
            className={`${
               isExpanded ? "" : "hidden"
            } border-b border-[#4C4F6B]`}
         >
            <td colSpan={9} className="text-left pl-16 text-xs py-3">
               <pre>
                  {logDetails == null ? "Loading..." : (logDetails.length == 0 ? "No logs" : logDetails.map((log: any, index) => (
                     <div key={index}>{log.text}</div>
                  )))}
               </pre>
            </td>
         </tr>
      </>
   );
}
