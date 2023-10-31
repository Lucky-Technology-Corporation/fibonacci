import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useDatabaseApi from "../../API/DatabaseAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import NiceInfo from "../../Utilities/NiceInfo";
import Pagination from "../../Utilities/Pagination";
import RowDetail from "../Database/RowDetail";
import SearchBar from "../Shared/SearchBar";
import UserRow from "./UserRow";

export default function UserTableView() {
  const { getDocuments, runQuery } = useDatabaseApi();

  const { activeProject, activeProjectName, environment } = useContext(SwizzleContext);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [rowDetailData, setRowDetailData] = useState<any>({});
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });

  const [keys, setKeys] = useState<string[]>([]);
  const [data, setData] = useState<any>();
  const [error, setError] = useState<any>(null);

  const [hiddenRows, setHiddenRows] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const ITEMS_PER_PAGE = 20;
  const hiddenColumns = [
    "_deactivated",
    "deviceId",
    "created_ip",
    "updatedAt",
    "updated_ip",
    "isAnonymous",
    "subscription",
    "countryCode",
  ];
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [sortedByColumn, setSortedByColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [filterName, setFilterName] = useState<string>("userId");

  const fetchData = (page: number) => {
    getDocuments("_swizzle_users", page, ITEMS_PER_PAGE, sortedByColumn, sortDirection)
      .then((data) => {
        if (data == null || data.documents == null) {
          setData([]);
          setKeys([]);
          setTotalDocs(0);
          return;
        }
        addFlags(data).then((data) => {
          setData(data.documents || []);
          setKeys(data.keys.sort() || []);
          setTotalDocs(data.pagination.total_documents);
        });
      })
      .catch((e) => {
        console.error(e);
        setError(e);
      });
  };

  const addFlags = async (data: any) => {
    if (!data || !data.documents) {
      return;
    }
    const endpoint = "http://ip-api.com/batch";
    var requestBody = [];
    for (var i = 0; i < data.documents.length; i++) {
      requestBody[i] = {
        query: data.documents[i].created_ip,
        fields: "countryCode",
      };
    }
    const flagResponse = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
    const flagData = await flagResponse.json();
    for (var i = 0; i < data.documents.length; i++) {
      data.documents[i].countryCode = flagData[i].countryCode;
    }
    return data;
  };

  useEffect(() => {
    if (searchQuery != "") {
      runSearch();
      return;
    }

    fetchData(currentPage);
  }, [currentPage, sortedByColumn, sortDirection]);

  //This refreshes the data when the active collection changes. In the future, we should use a context provider
  useEffect(() => {
    setCurrentPage(0);
    fetchData(currentPage);
  }, [activeProject, environment]);

  const runSearch = async () => {
    if (filterName == "") {
      toast.error("Please select a filter");
      return;
    }
    runQuery(searchQuery, filterName, "_swizzle_users", sortedByColumn, sortDirection)
      .then((data) => {
        addFlags(data).then((data) => {
          setData(data.documents || []);
          setKeys(data.keys.sort() || []);
          setTotalDocs(data.pagination.total_documents);
        });
      })
      .catch((e) => {
        console.error(e);
        setError(e);
      });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(0);
    fetchData(currentPage);
    setIsRefreshing(false);
  };

  const showDetailView = (rowData: any, x: number, y: number) => {
    setRowDetailData(rowData);
    setClickPosition({ x: x, y: y });
  };

  const addHiddenRow = (row: string) => {
    if (hiddenRows.includes(row)) {
      const newHiddenRows = hiddenRows.filter((hiddenRow) => hiddenRow != row);
      setHiddenRows(newHiddenRows);

      var newData: any = [];
      data.forEach((rowI: any) => {
        if (rowI && rowI["_id"] == row) {
          rowI["_deactivated"] = false;
        }
        newData.push(rowI);
      });

      setData(newData);
    } else {
      setHiddenRows([...hiddenRows, row]);
      var newData: any = [];
      data.forEach((rowI: any) => {
        if (rowI && rowI["_id"] == row) {
          rowI["_deactivated"] = true;
        }
        newData.push(rowI);
      });

      setData(newData);
    }
  };

  const didClickSortColumn = (key: string) => {
    if (sortedByColumn === key) {
      setSortDirection((prevSortDirection) => (prevSortDirection === "asc" ? "desc" : "asc"));
    } else {
      setSortDirection("asc");
    }
    setCurrentPage(0);
    setSortedByColumn(key);
  };

  if (error) {
    return <NiceInfo title="Failed to load data" subtitle="Check your connection and try again" />;
  }
  if (!data) {
    return <NiceInfo title="Loading data" subtitle="Please wait while we load your data" />;
  }

  return (
    <div>
      <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div>
          <div className={`font-bold text-base`}>Users</div>
          <div className={`text-sm mt-0.5`}>
            <a
              href="https://www.notion.so/Swizzle-e254b35ddef5441d920377fef3615eab?pvs=4"
              target="_blank"
              rel="nofollow"
              className="underline decoration-dotted text-[#d2d3e0] hover:text-white"
            >
              Read more
            </a>{" "}
            about creating users.
          </div>
        </div>
      </div>
      <div className={`flex pr-2 h-8 ${data.length == 0 ? "hidden" : ""}`}>
        <SearchBar
          keys={keys}
          filterName={filterName}
          setFilterName={setFilterName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          runSearch={runSearch}
        />
      </div>
      <div className="max-w-full overflow-x-auto" style={{ width: "calc(100vw - 240px - 32px)" }}>
        <table className="table-auto flex-grow my-4 ml-4" style={{ tableLayout: "auto", minWidth: "100%" }}>
          <thead className="bg-[#85869822]">
            <tr className={`font-mono text-xs ${keys.length == 0 ? "hidden" : ""}`}>
              <th className="text-left py-1.5 rounded-tl-md w-6 cursor-pointer"></th>
              {/* country flag */}
              <th className="w-6"></th>
              <th className="w-32"></th>
              {keys
                .filter((k) => hiddenColumns.indexOf(k) == -1)
                .map((key, index) => (
                  <th
                    className={`text-left py-1.5 cursor-pointer ${index == keys.length - 2 ? "rounded-tr-md" : ""}`}
                    key={index + 1}
                    onClick={() => didClickSortColumn(key)}
                  >
                    {key == "_id" ? "userId" : key}
                    {sortedByColumn === key && (
                      <FontAwesomeIcon icon={sortDirection === "asc" ? faArrowUp : faArrowDown} className="ml-5" />
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#85869833]">
            {data.map((row: any, _: number) => (
              <UserRow
                collection={"_swizzle_users"}
                key={row._id}
                rowKey={row._id}
                keys={keys}
                data={row}
                setShouldShowSaveHint={() => {}}
                showDetailView={(e: React.MouseEvent<SVGSVGElement>) => {
                  showDetailView(row, e.clientX, e.clientY);
                }}
                shouldHideFields={hiddenColumns}
                shouldBlockEdits={["_id", "createdAt", "isAnonymous", "subscription"]}
                shouldShowStrikethrough={hiddenRows.includes(row._id) || row._deactivated == true}
              />
            ))}
          </tbody>
        </table>
        <RowDetail
          data={rowDetailData}
          clickPosition={clickPosition}
          collection={"_swizzle_users"}
          addHiddenRow={addHiddenRow}
          shouldHideCopy={true}
          deleteAction="deactivate"
          setTotalDocs={setTotalDocs}
        />
      </div>
      {data.length == 0 && (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="text-base font-bold mt-4 mb-4">😟 No users yet</div>
        </div>
      )}

      <div className={` ${isRefreshing ? "opacity-50" : "opacity-100"}`}>
        <div className="pagination-controls flex justify-center items-center py-4 mb-4">
          {data && data.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalDocs={totalDocs}
              handlePageChange={setCurrentPage}
              handleRefresh={handleRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}
