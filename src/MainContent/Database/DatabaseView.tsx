import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useDatabaseApi from "../../API/DatabaseAPI";
import Button from "../../Utilities/Button";
import { castValues } from "../../Utilities/DataCaster";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import NiceInfo from "../../Utilities/NiceInfo";
import Pagination from "../../Utilities/Pagination";
import { getEstimatedColumnWidth } from "../../Utilities/TableWidthEstimate";
import TailwindModal from "../../Utilities/TailwindModal";
import SearchBar from "../Shared/SearchBar";
import DatabaseEditorHint from "./DatabaseEditorHint";
import DatabaseRow from "./DatabaseRow";
import DocumentJSON from "./DocumentJSON";
import RowDetail from "./RowDetail";

export default function DatabaseView({ activeCollection }: { activeCollection: string }) {
  const { getDocuments, deleteCollection, runQuery, updateDocument, runMongoQuery } = useDatabaseApi();

  const { activeProject, environment } = useContext(SwizzleContext);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [shouldShowSaveHint, setShouldShowSaveHint] = useState(false);
  const [isJSONEditorVisible, setIsJSONEditorVisible] = useState(false);
  const [jsonEditorData, setJSONEditorData] = useState<any>();
  const [editingDocumentId, setEditingDocumentId] = useState<string>("");

  const [jsonToEdit, setJsonToEdit] = useState(null);
  const [keyForRowBeingEdited, setKeyForRowBeingEdited] = useState<string[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

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
  const [didSearch, setDidSearch] = useState<boolean>(false);

  const [filterName, setFilterName] = useState<string>(null);

  useEffect(() => {
    if (searchQuery == "") {
      resetCollection();
    }
  }, [filterName]);

  const resetCollection = () => {
    setDidSearch(false);
    setCurrentPage(0);
    fetchData(0);
  };

  const fetchData = (page: number) => {
    if (!activeCollection || activeCollection == "") return;
    getDocuments(activeCollection, page, ITEMS_PER_PAGE, sortedByColumn, sortDirection)
      .then((data) => {
        setData(data.documents || []);
        setKeys(data.keys.sort() || []);
        setTotalDocs(data.pagination.total_documents);
        if(filterName == null){
          setFilterName(data.keys.sort().filter(k => k != "_id")[0])
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Something went wrong")
        setError(e);
      });
  };

  const handleRefresh = () => {
    if (!activeCollection || activeCollection == "") return;
    setIsRefreshing(true);
    fetchData(0);
    setIsRefreshing(false);
  };

  const createObjectHandler = (id: string) => {
    if (id == "json") {
      let object = keys.reduce<Record<string, string>>((acc, key) => {
        acc[key] = "";
        return acc;
      }, {});
      delete object["_id"];
      setJSONEditorData(object);
      setIsJSONEditorVisible(true);
    }
  };

  const openNewDocumentWithData = (data: any) => {
    setJSONEditorData(data);
    setIsJSONEditorVisible(true);
  };

  const onJSONChangeHandler = (newData: any) => {
    if (editingDocumentId) {
      // If editing an existing document, update the specific document in the state
      const updatedData = data.map((d: any) => (d._id === editingDocumentId ? { ...newData, _id: d._id } : d));
      setData(updatedData);
    } else {
      if (Array.isArray(newData)) {
        newData.forEach((item) => {
          const index = data.findIndex((d) => d._id === item._id);

          if (index !== -1) {
            data[index] = {
              ...data[index],
              ...item,
            };
          } else {
            setData((prevData) => [...prevData, item]);
          }
        });
        setTotalDocs((prevTotalDocs) => prevTotalDocs + newData.length);
      } else {
        setData((prevData) => [...prevData, newData]);
        setTotalDocs((prevTotalDocs) => prevTotalDocs + 1);
      }
    }

    // Check for new keys
    if (Array.isArray(newData)) {
      newData = newData[0];
    }
    const newKeys = Object.keys(newData).filter((key) => !keys.includes(key));
    if (newKeys.length > 0) {
      setKeys((prevKeys) => [...prevKeys, ...newKeys].sort());
    }
  };

  //This refreshes the data when the active collection changes. In the future, we should use a context provider
  useEffect(() => {
    setCurrentPage(0);
    fetchData(currentPage);
  }, [activeCollection, activeProject, environment]);

  useEffect(() => {
    if (!activeCollection || activeCollection == "") return;
    if (didSearch) {
      runQuery(searchQuery, filterName, activeCollection, sortedByColumn, sortDirection, currentPage);
    } else {
      fetchData(currentPage);
    }
  }, [currentPage, sortedByColumn, sortDirection]);

  const runSearch = async () => {
    if (filterName == "") {
      toast.error("Please select a filter");
      return;
    }
    if(filterName == "_exec_mongo_query"){
      runMongoQuery(searchQuery, activeCollection)
        .then((data) => {
          if(data.search_results == null && data.updated_count == 0 && data.count_result == 0){
            toast.error("No results were matched")
          }
          if(data.search_results){
            setDidSearch(true);
            setData(data.search_results || []);
            setTotalDocs(data.search_results.length);
          } else{
            handleRefresh()
          }
          if(data.updated_count){
            toast.success("Updated " + data.updated_count + " documents")
          }
          if(data.count_result){
            toast.success("Found " + data.count_result + " documents")
          }
        })
        .catch((e) => {
          console.error(e);
          toast.error("Failed - double check your query and try again")
      });
    } else{
      runQuery(searchQuery, filterName, activeCollection, sortedByColumn, sortDirection)
        .then((data) => {
          setDidSearch(true);
          setData(data.documents || []);
          setKeys(data.keys.sort() || []);
          setTotalDocs(data.pagination.total_documents);
        })
        .catch((e) => {
          console.error(e);
          toast.error("Failed to filter")
        });
    }
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

  const saveNewDocumentValue = (newData: any, documentId: string) => {
    toast.promise(updateDocument(activeCollection, documentId, castValues(newData)), {
      loading: "Updating document...",
      success: "Updated document!",
      error: "Failed to update document",
    });
  };

  const updateRowBeingEdited = (data: any) => {
    if (data == undefined) return;
    setData((prevData) => {
      return prevData.map((row) => {
        if (row._id == keyForRowBeingEdited[0]) {
          const newData = { ...row, [keyForRowBeingEdited[1]]: JSON.parse(data) };
          saveNewDocumentValue(newData, row._id);
          return newData;
        } else {
          return row;
        }
      });
    });

    setJsonToEdit(null);
  };

  if (!activeCollection)
    return (
      <NiceInfo title="Select a collection" subtitle="Select (or create) a collection on the left to get started" />
    );
  if (error) return <NiceInfo title="Failed to load data" subtitle="Check your connection and try again" />;
  if (!data) return <NiceInfo title="Loading data" subtitle="Please wait while we load your data" />;

  return (
    <div>
      <TailwindModal
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        title="Delete collection"
        subtitle="Are you sure you want to delete this collection?"
        confirmButtonText="Delete"
        confirmButtonAction={() => { 
          toast.promise(deleteCollection(activeCollection), {
            loading: "Deleting collection...",
            success: () => {
              window.location.reload(); //TODO: Replace this with something better
              return "Collection deleted";
            },
            error: "Failed to delete collection",
          });
        }}
      />
      <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div>
          <div className={`font-bold text-base`}>{activeCollection}</div>
          <div className={`text-sm mt-0.5`}>
            Explore your MongoDB instance
          </div>
        </div>
        <div className="text-sm w-20">
          <DatabaseEditorHint isVisible={shouldShowSaveHint} />
        </div>
        <div className={`flex h-10 mt-1 mr-[-16px] text-sm ${shouldShowSaveHint ? "hidden" : ""}`}>
          <Button
            text="+ Add"
            onClick={() => {
              createObjectHandler("json");
            }}
          />
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
          showMongo={true}
          numberOfResults={data.length}
          refreshHandler={handleRefresh}
        />
      </div>

      <div className="max-w-full overflow-x-auto" style={{ width: "calc(100vw - 240px - 32px)" }}>
        <table className="table-auto my-4 ml-4 block" style={{ tableLayout: "auto" }}>
          <thead className="bg-[#85869822]">
            <tr className={`font-mono text-xs ${keys.length == 0 ? "hidden" : ""}`}>
              <th className="text-left py-1.5 w-6"></th>
              {keys
                .filter((k) => k != "_id")
                .map((key, index) => (
                  <th
                    className={`cursor-pointer text-left py-1.5`}
                    style={{
                      minWidth: `${getEstimatedColumnWidth(keys.length - 1, key)}px`,
                    }}
                    key={index + 1}
                    onClick={() => didClickSortColumn(key)}
                  >
                    {key == "_swizzle_uid" ? "userId" : key}
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
                style={{
                  display: hiddenRows.includes(row._id) ? "none" : "table-row",
                }}
                collection={activeCollection}
                key={row._id}
                rowKey={row._id}
                keys={keys}
                data={row}
                setShouldShowSaveHint={setShouldShowSaveHint}
                shouldBlockEdits={["swizzle_uid"]}
                showDetailView={(e: React.MouseEvent<SVGSVGElement>) => {
                  showDetailView(row, e.clientX, e.clientY);
                }}
                setJsonToEdit={setJsonToEdit}
                setKeyForRowBeingEdited={setKeyForRowBeingEdited}
              />
            ))}
          </tbody>
        </table>
        <RowDetail
          data={rowDetailData}
          clickPosition={clickPosition}
          collection={activeCollection}
          addHiddenRow={addHiddenRow}
          setTotalDocs={setTotalDocs}
          openNewDocumentWithData={openNewDocumentWithData}
        />

        {/* New Document View */}
        <DocumentJSON
          document={jsonEditorData}
          collection={activeCollection}
          isVisible={isJSONEditorVisible}
          setIsVisible={setIsJSONEditorVisible}
          id={editingDocumentId}
          onChange={(data: any) => onJSONChangeHandler(data)} // Pass the data to the parent's handler
          justEditingJson={false}
        />

        {/* Edit object within document view */}
        <DocumentJSON
          document={jsonToEdit}
          isVisible={jsonToEdit != undefined}
          setIsVisible={() => setJsonToEdit(null)}
          onChange={(data: any) => {
            updateRowBeingEdited(data);
          }} // Pass the data to the parent's handler
          justEditingJson={true}
        />
      </div>
      {data.length == 0 && currentPage == 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="text-lg font-bold mt-4 mb-4">😟 No documents</div>
          {!didSearch ? (
            <Button text="Delete this collection" onClick={() => {setShowDeleteModal(true)}} />
          ) : (
            <Button
              text="Reset search"
              onClick={() => {
                setSearchQuery("");
                resetCollection();
              }}
            />
          )}
        </div>
      ) : (
        <></>
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
