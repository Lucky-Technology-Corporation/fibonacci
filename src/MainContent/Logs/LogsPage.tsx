import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useMonitoringApi from "../../API/MonitoringAPI";
import Button from "../../Utilities/Button";
import Dropdown from "../../Utilities/Dropdown";
import FloatingModal from "../../Utilities/FloatingModal";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import Pagination from "../../Utilities/Pagination";
import LogRow from "./LogRow";

export default function LogsPage() {
  const { activeProject, environment } = useContext(SwizzleContext);
  const { getLogs } = useMonitoringApi();

  const isRefreshingFresh = useRef(false);
  const [messages, setMessages] = useState([]);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterName, setFilterName] = useState<string | undefined>("log");
  const [filterQuery, setFilterQuery] = useState<string | undefined>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(null);
  const [modalText, setModalText] = useState<ReactNode | undefined>(null);

  const searchTypes = [
    {
      id: "log",
      name: "Log Text",
    },
    {
      id: "url",
      name: "Endpoint URL",
    },
    {
      id: "userId",
      name: "User ID",
    },
    {
      id: "responseCode",
      name: "Response Code",
    },
  ];

  const freshLogs = async () => {
    isRefreshingFresh.current = true;

    setPage(0);
    setOffset(0);
    setFilterQuery(null);
    setSearchQuery("");
    setNextPageToken(null);

    getLogs(0, filterName, null)
      .then((data) => {
        if (data) {
          isRefreshingFresh.current = false;
          setMessages(data);
          return true;
        }
      })
      .catch((e) => {
        isRefreshingFresh.current = false;
        console.error(e);
        return false;
      });
  };

  useEffect(() => {
    freshLogs();
  }, [filterName, environment, activeProject]);

  useEffect(() => {
    setOffset(page * 20);
  }, [page]);

  // const { lastMessage, getWebSocket, readyState } = useWebSocket(wsUrl, {
  //   onError: (e) => {
  //     toast.error("Error connecting to logs stream");
  //     console.error(e);
  //     setTimeout(() => {
  //       setIsStreaming(false);
  //     }, 200);
  //   },
  // });

  // //Handle incoming messages
  // useEffect(() => {
  //   if (lastMessage !== null) {
  //     console.log("Received a message from the server:", lastMessage.data);
  //   }
  // }, [lastMessage]);

  //Connect/disconnect websocket when switch is toggled
  // useEffect(() => {
  //   if (isStreaming) {
  //     setWsUrl(
  //       "ws://localhost:4000/api/v1/projects/" + activeProject + "/monitoring/logs/stream?token=" + authHeader(),
  //     );
  //   } else {
  //     setWsUrl(null);
  //   }
  // }, [isStreaming]);

  // //Disconnect websocket when component unmounts
  // useEffect(() => {
  //   setFilterQuery(null);
  //   setNextPageToken(null);

  //   getLogs(offset, filterName, filterQuery).then((data) => {
  //     if (data) {
  //       setMessages(data);
  //     }
  //   });
  //   return () => {
  //     setWsUrl(null);
  //   };
  // }, []);

  useEffect(() => {
    if (filterQuery == "") {
      setNextPageToken(null);
      setFilterName("log");
      return;
    }

    if (isRefreshingFresh.current) {
      return;
    }

    toast.promise(
      getLogs(offset, filterName, filterQuery, nextPageToken)
        .then((data) => {
          if (data && data.results != null) {
            setMessages(data.results);
          } else if (data) {
            setMessages(data);
          } else {
            setMessages([]);
          }
        })
        .catch((e) => {
          console.error(e);
        }),
      {
        loading: "Loading",
        success: "Loaded",
        error: "Failed to load logs",
      },
    );
  }, [offset, filterQuery]);

  const runSearch = () => {
    setFilterQuery(searchQuery);
  };

  return (
    <div className="h-full overflow-scroll min-h-[50vh]">
      <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div>
          <div className={`font-bold text-base`}>Logs</div>
          <div className={`text-sm mt-0.5`}>Click any request to see its logs</div>
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
      <div className={`flex pr-2 h-9 mb-4`}>
        {filterQuery != null && filterQuery != "" ? (
          <Button
            className="ml-4 px-2 py-4 mt-0.5 font-medium rounded-md flex justify-center items-center cursor-pointer"
            children={<FontAwesomeIcon icon={faXmark} className="w-4 h-4" />}
            onClick={() => {
              toast.promise(freshLogs(), {
                loading: "Refreshing...",
                success: () => {
                  return "Refreshed";
                },
                error: "Failed to refresh. Try reloading the page",
              });
            }}
          />
        ) : (
          <div className="w-2"></div>
        )}
        <Dropdown
          className="fixed"
          selectorClass="ml-2"
          onSelect={(id: string) => {
            setFilterName(id);
          }}
          children={searchTypes}
          direction="center"
          title={searchTypes.filter((type) => type.id == filterName)[0].name}
        />
        <input
          type="text"
          className={`text-s, flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]`}
          placeholder={"Filter by " + searchTypes.filter((type) => type.id == filterName)[0].name.toLowerCase() + "..."}
          value={searchQuery}
          onChange={(e) => {
            if (filterName == "responseCode") {
              setSearchQuery(e.target.value.replace(/[^0-9]/g, ""));
              return;
            }
            setSearchQuery(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              runSearch();
            }
          }}
        />
        <Button text={"Search"} onClick={runSearch} />
      </div>

      <div className="pr-2 pl-4 pt-1 flex flex-row space-x-2">
        <table className="w-full">
          <thead className="bg-[#85869822]">
            <tr className="border-b border-[#4C4F6B]">
              <th className="text-center py-1 pl-4 w-12 font-light">Retry</th>
              <th className="text-center py-1 pl-4 w-12 font-light">Fix</th>
              <th className="text-left py-1 pl-4 font-light">Time</th>
              <th className="text-left py-1 pl-4 font-light max-w-1/2">Endpoint</th>
              <th className="text-left py-1 pl-4 font-light">Result</th>
              <th className="text-left py-1 pl-4 font-light">User</th>
              <th className="text-left py-1 pl-4 font-light">Request</th>
              <th className="text-left py-1 pl-4 font-light">Response</th>
              <th className="text-left py-1 pl-4 font-light">Runtime</th>
              <th className="text-right pr-2 py-1 pl-4 rounded-tr-md"></th>
            </tr>
          </thead>
          <tbody className="overflow-y-scroll">
            {(messages || []).map((message, index) => {
              return (
                <LogRow
                  key={"log-" + index}
                  message={message}
                  freshLogs={freshLogs}
                  setModalText={setModalText}
                  autofixButtonClassName={index == 0 ? "autofix-button" : ""}
                />
              );
            })}
            <tr></tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 m-auto w-fit mb-8">
        <Pagination
          currentPage={page}
          itemsPerPage={20}
          handlePageChange={setPage}
          handleRefresh={() => {
            setPage(0);
          }}
        />
      </div>

      <FloatingModal
        content={modalText}
        closeModal={() => {
          setModalText(null);
        }}
      />
    </div>
  );
}
