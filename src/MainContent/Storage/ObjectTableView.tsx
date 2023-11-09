import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useDatabaseApi from "../../API/DatabaseAPI";
import useStorageApi from "../../API/StorageAPI";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import NiceInfo from "../../Utilities/NiceInfo";
import Pagination from "../../Utilities/Pagination";
import { getEstimatedColumnWidth } from "../../Utilities/TableWidthEstimate";
import DatabaseRow from "../Database/DatabaseRow";
import RowDetail from "../Database/RowDetail";
import SearchBar from "../Shared/SearchBar";

export default function ObjectTableView() {
  const { getDocuments, runQuery } = useDatabaseApi();
  const { uploadFile, deleteFile } = useStorageApi();

  const { activeProject, domain, testDomain, environment, prodDeployStatus } = useContext(SwizzleContext);

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

  const [filterName, setFilterName] = useState<string>("fileName");

  //Drag and drop to upload code
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnterLeave = (e) => {
      preventDefaults(e);
      setDragging(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
      preventDefaults(e);
      setDragging(false);
      const files = e.dataTransfer.files;
      handleFiles(files);
    };

    // Add event listeners
    ["dragenter", "dragover", "dragleave"].forEach((eventName) => {
      document.addEventListener(eventName, handleDragEnterLeave, false);
    });

    document.addEventListener("drop", handleDrop, false);

    // Cleanup
    return () => {
      ["dragenter", "dragover", "dragleave"].forEach((eventName) => {
        document.removeEventListener(eventName, handleDragEnterLeave, false);
      });
      document.removeEventListener("drop", handleDrop, false);
    };
  }, [activeProject, environment]);

  const handleFiles = async (files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadFile(file);
      fetchData(currentPage);
    }
  };

  const ITEMS_PER_PAGE = 20;

  const fetchData = (page: number) => {
    getDocuments("_swizzle_storage", page, ITEMS_PER_PAGE, sortedByColumn, sortDirection)
      .then((data) => {
        if (data == null) {
          setData([]);
          setKeys([]);
          setTotalDocs(0);
          setIsRefreshing(false);
          return;
        }
        setData(data.documents || []);
        setKeys(data.keys.sort() || []);
        setTotalDocs(data.pagination.total_documents);
        setIsRefreshing(false);
      })
      .catch((e) => {
        console.error(e);
        setIsRefreshing(false);
        setError(e);
      });
  };

  useEffect(() => {
    setCurrentPage(0);
    fetchData(currentPage);
  }, [activeProject, environment]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, sortedByColumn, sortDirection]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(0);
    fetchData(currentPage);
  };

  const runSearch = async () => {
    if (filterName == "") {
      toast.error("Please select a filter");
      return;
    }
    runQuery(searchQuery, filterName, "_swizzle_storage", sortedByColumn, sortDirection)
      .then((data) => {
        setData(data.documents || []);
        setKeys(data.keys.sort() || []);
        setTotalDocs(data.pagination.total_documents);
      })
      .catch((e) => {
        console.error(e);
        setError(e);
      });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileHandler = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    //upload file
    await uploadFile(file);
    fetchData(currentPage);
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

  if (dragging) {
    return <NiceInfo title="Drop to upload" subtitle="Your file will be uploaded to the public storage bucket" />;
  }

  if(prodDeployStatus != "DEPLOYMENT_SUCCESS") {
    return (
      <NiceInfo
        title="Production deployment in progress..."
        subtitle="Storage requires certain production resources. The deployment will be completed shortly."
      />
    )
  }

  return (
    <div>
      <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div>
          <div className={`font-bold text-base`}>Storage</div>
          <div className={`text-sm mt-0.5`}>Drag and drop files to upload them</div>
        </div>
        <div className={`flex h-10 mt-1 mr-[-16px] text-sm`}>
          <Button text={"Upload"} onClick={uploadFileHandler} />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
        </div>
      </div>
      <div className={`flex pr-2 h-8`}>
        <SearchBar
          keys={keys}
          filterName={filterName}
          setFilterName={setFilterName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          runSearch={runSearch}
          refreshHandler={handleRefresh}
          numberOfResults={data.length}
        />
      </div>
      <div className="max-w-full overflow-x-auto" style={{ width: "calc(100vw - 240px - 32px)" }}>
        <table className="table-auto flex-grow my-4 ml-4" style={{ tableLayout: "auto", minWidth: "100%" }}>
          <thead className="bg-[#85869822]">
            <tr className={`font-mono text-xs ${keys.length == 0 ? "hidden" : ""}`}>
              <th className="text-left py-1.5 w-6 cursor-pointer"></th>
              {keys
                .filter((k) => k != "data")
                .map((key, index) => (
                  <th
                    className={`text-left py-1.5 cursor-pointer`}
                    style={{
                      minWidth: `${getEstimatedColumnWidth(keys.length - 1, key)}px`,
                    }}
                    key={index + 1}
                    onClick={() => didClickSortColumn(key)}
                  >
                    {key == "_id" ? <>File</> : key}
                    {sortedByColumn === key && (
                      <FontAwesomeIcon icon={sortDirection === "asc" ? faArrowUp : faArrowDown} className="ml-5" />
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#85869833]">
            {data.map((row: any, _: number) => (
              <DatabaseRow
                style={{ display: hiddenRows.includes(row._id) ? "none" : "table-row" }}
                collection={"_swizzle_storage"}
                key={row._id}
                rowKey={row._id}
                keys={keys}
                data={Object.entries(row).reduce((result, [key, value]) => {
                  const fileURL = domain ? `${domain.replace("https://", "https://api.")}/swizzle/storage/${value}.${row.fileExtension || row.fileName.split(".").pop()}` : "";
                  return {
                    ...result,
                    [key]: key === "_id" ? fileURL : value,
                  };
                }, {})}
                setShouldShowSaveHint={() => {}}
                showDetailView={(e: React.MouseEvent<SVGSVGElement>) => {
                  showDetailView(row, e.clientX, e.clientY);
                }}
                shouldBlockEdits={["_swizzle_uid", "access", "createdAt", "fileName"]}
                shouldHideFields={["data"]}
                setJsonToEdit={() => {}}
                setKeyForRowBeingEdited={() => {}}
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
          deleteFunction={(data: any) => {
            return deleteFile(data.fileName);
          }}
        />
      </div>
      {data.length == 0 && (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="text-base font-bold mt-4 mb-4">😟 No files found</div>
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
