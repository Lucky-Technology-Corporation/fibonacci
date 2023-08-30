import { useContext, useEffect, useRef, useState } from "react";
import Button from "../../Utilities/Button";
import DatabaseRow from "../Database/DatabaseRow";
import useApi from "../../API/DatabaseAPI";
import useStorageApi from "../../API/StorageAPI";
import RowDetail from "../Database/RowDetail";
import Dropdown from "../../Utilities/Dropdown";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import NiceInfo from "../../Utilities/NiceInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Pagination from "../../Utilities/Pagination";

export default function ObjectTableView() {
  const { getDocuments } = useApi();
  const { uploadFile } = useStorageApi();

  const { activeProject, domain } = useContext(SwizzleContext);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [rowDetailData, setRowDetailData] = useState<any>({});
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [keys, setKeys] = useState<string[]>([]);
  const [data, setData] = useState<any>();
  const [error, setError] = useState<any>(null);
  const [hiddenRows, setHiddenRows] = useState<string[]>([]);

  const [totalDocs, setTotalDocs] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sortedByColumn, setSortedByColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const ITEMS_PER_PAGE = 20;

  const fetchData = (page: number) => {
    getDocuments(
      "_swizzle_storage",
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
    setCurrentPage(0);
    fetchData(currentPage);
  }, [activeProject]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, sortedByColumn, sortDirection]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(0);
    fetchData(currentPage);
    setIsRefreshing(false);
  };

  const runSearch = () => {
    // run search
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileHandler = (e: any) => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    //upload file
    uploadFile(file);
  };

  const showDetailView = (rowData: any, x: number, y: number) => {
    setRowDetailData(rowData);
    setClickPosition({ x: x, y: y });
  };

  const addHiddenRow = (row: string) => {
    setHiddenRows([...hiddenRows, row]);
  };

  const didClickSortColumn = (key: string) => {
    if (sortedByColumn === key) {
      setSortDirection((prevSortDirection) =>
        prevSortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortDirection("asc");
    }
    setCurrentPage(0)
    setSortedByColumn(key);
  };

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
          <div className={`font-bold text-base`}>Storage</div>
          <div className={`text-sm mt-0.5`}>
            Store images and other files under 16 MB
          </div>
        </div>
        <div className={`flex h-10 mt-1 mr-[-16px] text-sm`}>
          <Dropdown
            className="ml-2"
            onSelect={uploadFileHandler}
            children={[
              {
                id: "json",
                name: "File",
              },
            ]}
            direction="right"
            title="Upload"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
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
      <div className="max-w-full overflow-x-auto" style={{width: "calc(100vw - 220px - 12px)"}}>
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
              <th
                className="text-left py-1.5 rounded-tl-md w-6 cursor-pointer"
              ></th>
              {keys
                .filter((k) => k != "data")
                .map((key, index) => (
                  <th
                    className={`text-left py-1.5 cursor-pointer ${
                      index == keys.length - 2 ? "rounded-tr-md" : ""
                    }`}
                    key={index + 1}
                    onClick={() => didClickSortColumn(key)}
                  >
                    {key == "_id" ? <>File</> : key}
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
                // style={{display: hiddenRows.includes(row._id) ? "none" : "table-row"}}
                collection={"_swizzle_storage"}
                key={row._id}
                rowKey={row._id}
                keys={keys}
                data={Object.entries(row).reduce((result, [key, value]) => {
                  const fileURL = `https://${domain}/swizzle/db/storage/${value}/${row.fileName}`;
                  return {
                    ...result,
                    [key]: key === "_id" ? fileURL : value,
                  };
                }, {})}
                setShouldShowSaveHint={() => {}}
                showDetailView={(e: React.MouseEvent<SVGSVGElement>) => {
                  showDetailView(row, e.clientX, e.clientY);
                }}
                shouldBlockEdits={true}
                shouldHideFields={["data"]}
              />
            ))}
          </tbody>
        </table>
        <RowDetail
          data={rowDetailData}
          clickPosition={clickPosition}
          collection={"_swizzle_storage"}
          addHiddenRow={addHiddenRow}
          shouldHideCopy={true}
          setTotalDocs={setTotalDocs}
        />
      </div>
      {data.length == 0 && (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="text-base font-bold mt-4 mb-4">😟 No files found</div>
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
