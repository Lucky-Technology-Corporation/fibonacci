import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import LogRow from "./LogRow";
import Switch from "react-switch";
import useWebSocket from "react-use-websocket";
import toast from "react-hot-toast";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { useAuthHeader } from "react-auth-kit";
import useApi from "../../API/MonitoringAPI";
import Pagination from "../../Utilities/Pagination";
import Button from "../../Utilities/Button";
import Dropdown from "../../Utilities/Dropdown";

export default function LogsPage() {
   const { activeProject } = useContext(SwizzleContext);
   const authHeader = useAuthHeader();
   const { getLogs } = useApi();

   const [messages, setMessages] = useState([]);
   const [wsUrl, setWsUrl] = useState<string | null>(null);
   const [isStreaming, setIsStreaming] = useState<boolean>(false);
   const [offset, setOffset] = useState<number>(0);
   const [page, setPage] = useState<number>(0);
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [filterName, setFilterName] = useState<string | undefined>("log");
   const [filterQuery, setFilterQuery] = useState<string | undefined>(null);
   const [nextPageToken, setNextPageToken] = useState<string | undefined>(null);

   const searchTypes = [
      {
         id: "log",
         name: "Log Text",
      },
      {
         id: "user",
         name: "User ID",
      },
      {
         id: "endpoint",
         name: "Endpoint URL",
      },
   ]

   useEffect(() => {
      setOffset(page * 20);
   }, [page]);

   const { lastMessage, getWebSocket, readyState } = useWebSocket(wsUrl, {
      onError: (e) => {
         toast.error("Error connecting to logs stream");
         console.log(e);
         setTimeout(() => {
            setIsStreaming(false);
         }, 200);
      },
   });

   //Handle incoming messages
   useEffect(() => {
      if (lastMessage !== null) {
         console.log("Received a message from the server:", lastMessage.data);
      }
   }, [lastMessage]);

   //Connect/disconnect websocket when switch is toggled
   useEffect(() => {
      if (isStreaming) {
         setWsUrl(
            "ws://localhost:4000/api/v1/projects/" +
               activeProject +
               "/monitoring/logs/stream?token=" +
               authHeader(),
         );
      } else {
         setWsUrl(null);
      }
   }, [isStreaming]);

   //Disconnect websocket when component unmounts
   useEffect(() => {
      setFilterQuery(null)
      setNextPageToken(null)

      getLogs(offset, filterName, filterQuery).then((data) => {
         setMessages(data);
      });
      return () => {
         setWsUrl(null);
      };
   }, []);

   useEffect(() => {
      getLogs(offset, filterName, filterQuery).then((data) => {
         if(data && data.results){
            setMessages(data.results);
            setNextPageToken(data.next_page_token);
         } else{
            setMessages(data);
         }
      });
   }, [offset, filterQuery]);

   const setSearchType = (id: string) => {
      setFilterName(id)
    };

   const runSearch = () => {
      setFilterQuery(searchQuery)
   }

   return (
      <div>
         <div className={`flex-1 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
            <div>
               <div className={`font-bold text-base`}>Logs</div>
               <div className={`text-sm mt-0.5`}>
                  Click any request to see its logs
               </div>
            </div>
            {/* <div className="flex">
               <div className="text-sm m-auto mr-2">
                  Stream {isStreaming ? "active" : "paused"}
               </div>
               <Switch
                  className="m-auto"
                  onChange={() => setIsStreaming(!isStreaming)}
                  checked={isStreaming}
                  checkedIcon={<PlayIcon className="p-2" />}
                  uncheckedIcon={<PauseIcon className="p-2" />}
                  offColor="#474752"
               />
            </div> */}
         </div>
         <div className={`flex h-9 mb-4`}>
            <Dropdown
               className="ml-4"
               onSelect={setSearchType}
               children={searchTypes}
               direction="right"
               title={searchTypes.filter((type) => type.id == filterName)[0].name}
            />
            <input
               type="text"
               className={`text-s, flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]`}
               placeholder={"Filter by " + searchTypes.filter((type) => type.id == filterName)[0].name.toLowerCase() + "..."}
               value={searchQuery}
               onChange={(e) => {
                  setSearchQuery(e.target.value);
               }}
               onKeyDown={(event) => {
                  if (event.key == "Enter") {
                     runSearch();
                  }
               }}
            />
            <Button
               text={"Search"}
               onClick={runSearch}
            />
         </div>

         <div className="mx-4 pt-1 flex flex-row space-x-2">
            <table className="w-full h-full">
               <thead className="bg-[#85869822]">
                  <tr className="border-b border-[#4C4F6B]">
                     <th className="text-left py-1 pl-4 w-12 font-light">
                        Retry
                     </th>
                     <th className="text-left py-1 pl-4 font-light">
                        Timestamp
                     </th>
                     <th className="text-left py-1 pl-4 font-light max-w-1/2">
                        Endpoint
                     </th>
                     <th className="text-left py-1 pl-4 font-light">Result</th>
                     <th className="text-left py-1 pl-4 font-light">User</th>
                     <th className="text-left py-1 pl-4 font-light">Request</th>
                     <th className="text-left py-1 pl-4 font-light">
                        Response
                     </th>
                     <th className="text-left py-1 pl-4 font-light">Runtime</th>
                     <th className="text-right pr-2 py-1 pl-4 rounded-tr-md"></th>
                  </tr>
               </thead>
               <tbody className="overflow-y-scroll">
                  {messages.map((message, index) => {
                     return <LogRow key={index} message={message} />;
                  })}
                  <tr></tr>
               </tbody>
            </table>
         </div>
         <div className="mt-4 m-auto w-fit">
               <Pagination
               currentPage={page}
               itemsPerPage={20}
               handlePageChange={setPage}
               handleRefresh={() => {
                  setPage(0)
               }}
            />
            </div>
      </div>
   );
}
