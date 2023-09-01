import { useContext, useEffect, useState } from "react";
import Button from "../../Utilities/Button";
import DatabaseRow from "../Database/DatabaseRow";
import useApi from "../../API/DatabaseAPI";
import RowDetail from "../Database/RowDetail";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import NiceInfo from "../../Utilities/NiceInfo";
import Pagination from "../../Utilities/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { getEstimatedColumnWidth } from "../../Utilities/TableWidthEstimate";

export default function UserTableView() {
  const { getDocuments } = useApi();

  const { activeProject, activeProjectName } = useContext(SwizzleContext);

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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [sortedByColumn, setSortedByColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchData = (page: number) => {
    getDocuments(
      "_swizzle_users",
      page,
      ITEMS_PER_PAGE,
      sortedByColumn,
      sortDirection,
    )
      .then((data) => {
        setData(data.documents || []);
        setKeys(data.keys.sort() || []);
        setTotalDocs(data.pagination.total_documents);
      })
      .catch((e) => {
        console.log(e);
        setError(e);
      });
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, sortedByColumn, sortDirection]);

  //This refreshes the data when the active collection changes. In the future, we should use a context provider
  useEffect(() => {
    setCurrentPage(0);
    fetchData(currentPage);
  }, [activeProject]);

  const runSearch = () => {
    // run search
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
      setSortDirection((prevSortDirection) =>
        prevSortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortDirection("asc");
    }
    setCurrentPage(0);
    setSortedByColumn(key);
  };

  useEffect(() => {
    if (sortedByColumn == "") return;

    const query = searchQuery
      .replace(/(Find|Aggregate|UpdateMany|UpdateOne)\(/, "")
      .replace(/\)$/, "");
    if (query != "") {
      runSearch();
      return;
    }

    getDocuments(
      "_swizzle_users",
      currentPage,
      20,
      sortedByColumn,
      sortDirection,
    )
      .then((data) => {
        console.log(data.documents);
        setData(data.documents || []);
        setKeys(data.keys.sort() || []);
      })
      .catch((e) => {
        console.log(e);
        setError(e);
      });
  }, [sortedByColumn, sortDirection]);

  if (error) {
    return (
      <NiceInfo
        title="Failed to load data"
        subtitle="Check your connection and try again"
      />
    );
  }
  if (!data) {
    return (
      <NiceInfo
        title="Loading data"
        subtitle="Please wait while we load your data"
      />
    );
  }

  return (
    <div>
      <div className={`flex-1 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div>
          <div className={`font-bold text-base`}>{activeProjectName} users</div>
          <div className={`text-sm mt-0.5`}>
            Create users{" "}
            <a
              href="https://www.notion.so/Swizzle-e254b35ddef5441d920377fef3615eab?pvs=4"
              target="_blank"
              rel="nofollow"
              className="underline decoration-dotted text-[#d2d3e0] hover:text-white"
            >
              from your app.
            </a>
          </div>
        </div>
      </div>
      <div className={`flex h-8 ${data.length == 0 ? "hidden" : ""}`}>
        <input
          type="text"
          className="text-s, flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]"
          placeholder={"Filter users"}
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
        <Button text={"Search"} onClick={runSearch} />
      </div>
      <div
        className="max-w-full overflow-x-auto"
        style={{ width: "calc(100vw - 220px - 12px)" }}
      >
        <table
          className="table-auto flex-grow my-4 ml-4"
          style={{ tableLayout: "auto", minWidth: "100%" }}
        >
          <thead className="bg-[#85869822]">
            <tr
              className={`font-mono text-xs ${
                keys.length == 0 ? "hidden" : ""
              }`}
            >
              <th className="text-left py-1.5 rounded-tl-md w-6 cursor-pointer"></th>
              {keys
                .filter((k) => ["_deactivated", "deviceId"].indexOf(k) == -1)
                .map((key, index) => (
                  <th
                    className={`text-left py-1.5 cursor-pointer ${
                      index == keys.length - 2 ? "rounded-tr-md" : ""
                    }`}
                    key={index + 1}
                    onClick={() => didClickSortColumn(key)}
                  >
                    {key == "_id" ? "userId" : key}
                    {sortedByColumn === key && (
                      <FontAwesomeIcon
                        icon={sortDirection === "asc" ? faArrowUp : faArrowDown}
                        className="ml-5"
                      />
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#85869833]">
            {data.map((row: any, _: number) => (
              <DatabaseRow
                collection={"_swizzle_users"}
                key={row._id}
                rowKey={row._id}
                keys={keys}
                data={row}
                setShouldShowSaveHint={() => {}}
                showDetailView={(e: React.MouseEvent<SVGSVGElement>) => {
                  showDetailView(row, e.clientX, e.clientY);
                }}
                shouldHideFields={["_deactivated", "deviceId"]}
                shouldBlockEdits={["_id", "createdAt", "isAnonymous"]}
                shouldShowStrikethrough={
                  hiddenRows.includes(row._id) || row._deactivated == true
                }
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
        <div className="pagination-controls flex justify-center items-center py-4">
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
