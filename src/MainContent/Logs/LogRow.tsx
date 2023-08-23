import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import Dot from "../../Utilities/Dot";
import IconButton from "../../Utilities/IconButton";
import { useState } from "react";

export default function LogRow() {
   const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
            <td className="text-left pl-4">Aug 17 5:05:23pm</td>
            <td className="text-left pl-4">GET /users/:userId</td>
            <td className="text-left pl-4 font-bold">
               <div className="flex">
                  <Dot color={"green"} className="ml-0 mr-2" />
                  <div>200</div>
               </div>
            </td>
            <td className="text-left pl-4 font-bold underline">Jfu283hy20</td>
            <td className="text-left pl-4 font-bold underline">Request</td>
            <td className="text-left pl-4 font-bold underline">Response</td>
            <td className="text-left pl-4">242ms</td>
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
                  {`[12:05:27] Fetching user data for userId: 12345

[12:05:28] User data retrieved: { "id": 12345, "name": "John Doe" }

[12:05:29] Rendering main dashboard...`}
               </pre>
            </td>
         </tr>
      </>
   );
}
