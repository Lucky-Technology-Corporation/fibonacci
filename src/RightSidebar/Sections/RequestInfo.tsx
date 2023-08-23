import React, { useEffect, useRef, useState } from "react";
import ToastWindow from "../ToastWindow";
import InfoItem from "../InfoItem";
import { copyText } from "../../Utilities/Copyable";
import { getTableHelper } from "../../Utilities/TableHelper";

export default function RequestInfo({ show }: { show: boolean }) {
   return (
      <>
         <div
            className={`flex-col items-center justify-between ${
               show ? "opacity-100" : "opacity-0 h-0"
            }`}
            style={{ transition: "opacity 0.3s" }}
         >
            <InfoItem
               position="bottom-left"
               content={
                  <>
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#D2D3E0"
                        viewBox={`0 0 50 50`}
                        width={`${14}px`}
                        height={`${14}px`}
                     >
                        <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z" />
                     </svg>
                     <div className="ml-2 text-sm font-mono">Request</div>
                  </>
               }
               toast={{
                  title: "request",
                  content: (
                     <div className="text-gray-400">
                        Access request info using the following syntax:
                        {getTableHelper([
                           {
                              name: "request.query.queryVariable",
                              description:
                                 "Query variables (?queryVariable=value)",
                           },
                           {
                              name: "request.params.pathVariable",
                              description:
                                 "Path variables (/api/:pathVariable)",
                           },
                           {
                              name: "request.body",
                              description:
                                 "Body object (whatever is sent in the body)",
                           },
                        ])}
                     </div>
                  ),
               }}
            />
            <InfoItem
               position="bottom-left"
               content={
                  <>
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#D2D3E0"
                        viewBox={`0 0 50 50`}
                        width={`${14}px`}
                        height={`${14}px`}
                     >
                        <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z" />
                     </svg>
                     <div className="ml-2 text-sm font-mono">Response</div>
                  </>
               }
               toast={{
                  title: "response",
                  content: (
                     <div className="text-gray-400">
                        Send your response with the following syntax:
                        {getTableHelper([
                           {
                              name: "response.send({})",
                              description:
                                 "Send an object back to the frontend",
                           },
                           {
                              name: "response.status(400).send({})",
                              description:
                                 "Define the status code sent back to the frontend",
                           },
                           {
                              name: "response.redirect(url)",
                              description: "Redirect to another url",
                           },
                        ])}
                     </div>
                  ),
               }}
            />
         </div>
      </>
   );
}
