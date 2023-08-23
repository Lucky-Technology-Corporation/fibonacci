import { useEffect, useState } from "react";
import Button from "../../Utilities/Button";
import DatabaseEditorHint from "./DatabaseEditorHint";
import DatabaseRow from "./DatabaseRow";
import useApi from "../../API/DatabaseAPI";
import RowDetail from "./RowDetail";
import Dropdown from "../../Utilities/Dropdown";
import DocumentJSON from "./DocumentJSON";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faArrowUp,
   faArrowDown,
   faArrowRight,
   faArrowLeft,
   faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";

export default function DatabaseView({
   activeCollection,
}: {
   activeCollection: string;
}) {
   const { getDocuments, deleteCollection, runEnglishSearchQuery, runQuery } =
      useApi();

   const [isValidMongoQuery, setIsValidMongoQuery] = useState<boolean>(true);
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [queryType, setQueryType] = useState<string>("");
   const [queryDescription, setQueryDescription] = useState<string>("");

   const [shouldShowSearchHint, setShouldShowSearchHint] =
      useState<boolean>(false);
   const [shouldShowSaveHint, setShouldShowSaveHint] = useState(false);
   const [isJSONEditorVisible, setIsJSONEditorVisible] = useState(false);
   const [jsonEditorData, setJSONEditorData] = useState<any>();
   const [editingDocumentId, setEditingDocumentId] = useState<string>("");

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
   const itemsPerPage = 20;
   const startDocument = currentPage * itemsPerPage + 1;
   const isLastPage = Math.ceil(totalDocs / itemsPerPage) === currentPage + 1;
   const endDocument = isLastPage
      ? totalDocs
      : (currentPage + 1) * itemsPerPage;

   const renderPaginationControls = () => {
      const btnStyles =
         "inline-flex items-center justify-center gap-x-1.5 rounded-md px-3 h-7 text-sm font-semibold shadow-sm bg-[#85869833] hover:bg-[#85869855] ring-1 ring-inset ring-[#525363] mx-2";

      return (
         <div className="flex items-center">
            {currentPage >= 1 && (
               <button
                  className={btnStyles}
                  onClick={() => setCurrentPage(currentPage - 1)}
               >
                  <FontAwesomeIcon icon={faArrowLeft} />
               </button>
            )}

            <span className="mx-2">{`${startDocument} – ${endDocument} of ${totalDocs}`}</span>

            {!isLastPage && (
               <button
                  className={btnStyles}
                  onClick={() => setCurrentPage(currentPage + 1)}
               >
                  <FontAwesomeIcon icon={faArrowRight} />
               </button>
            )}

            <button className={btnStyles} onClick={handleRefresh}>
               <FontAwesomeIcon icon={faArrowsRotate} />
            </button>
         </div>
      );
   };

   const handleRefresh = () => {
      if (!activeCollection || activeCollection == "") return;
      setCurrentPage(0);
      getDocuments(activeCollection, currentPage, 20)
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
   const createObjectHandler = (id: string) => {
      if (id == "json") {
         let object = keys.reduce<Record<string, string>>((acc, key) => {
            acc[key] = "";
            return acc;
         }, {});
         delete object["_id"];
         setJSONEditorData(object);
         setIsJSONEditorVisible(true);
      } else if (id == "row") {
         // create new row
      }
   };

   const onJSONChangeHandler = (newData: any) => {
      if (editingDocumentId) {
         // If editing an existing document, update the specific document in the state
         const updatedData = data.map((d: any) =>
            d._id === editingDocumentId ? { ...newData, _id: d._id } : d,
         );
         setData(updatedData);
      } else {
         // If creating a new document or an array of documents
         if (Array.isArray(newData)) {
            // Loop through each object in the array
            newData.forEach((item) => {
               // Add a unique _id property to each item
               item._id = uuidv4();
               // Find the index of the item in the state data (if it exists)
               const index = data.findIndex((d) => d._id === item._id);

               if (index !== -1) {
                  // If the item exists in the state data, update it
                  data[index] = {
                     ...data[index],
                     ...item,
                  };
               } else {
                  // If the item does not exist in the state data, add it
                  setData((prevData) => [...prevData, item]);
               }
            });
         } else {
            // If newData is a single object, add it to the state
            setData((prevData) => [...prevData, newData]);
         }
      }

      // Check for new keys
      if (Array.isArray(newData)) {
         // If newData is an array, consider only the first object to check for new keys
         newData = newData[0];
      }
      const newKeys = Object.keys(newData).filter((key) => !keys.includes(key));
      if (newKeys.length > 0) {
         setKeys((prevKeys) => [...prevKeys, ...newKeys]);
      }
   };

   const deleteCollectionHandler = () => {
      const c = confirm(
         "Are you sure you want to delete this collection? This cannot be undone.",
      );
      if (c) {
         toast.promise(deleteCollection(activeCollection), {
            loading: "Deleting collection...",
            success: () => {
               window.location.reload(); //TODO: Replace this with something better
               return "Collection deleted";
            },
            error: "Failed to delete collection",
         });
      }
   };

   //This refreshes the data when the active collection changes. In the future, we should use a context provider
   useEffect(() => {
      setCurrentPage(0);
   }, [activeCollection]);

   useEffect(() => {
      if (!activeCollection || activeCollection == "") return;
      getDocuments(activeCollection, currentPage, 20)
         .then((data) => {
            setData(data.documents || []);
            setKeys(data.keys.sort() || []);
            setTotalDocs(data.pagination.total_documents);
         })
         .catch((e) => {
            console.log(e);
            setError(e);
         });
   }, [activeCollection, currentPage]);

   //This changes the button to "run" if the query is a mongo query
   useEffect(() => {
      const regex = /^(Find|Aggregate|UpdateMany|UpdateOne)\(\s*\{.*\}\s*\)$/;
      const isValid = regex.test(searchQuery);
      setIsValidMongoQuery(isValid);
      if (!isValid) {
         setQueryDescription("");
      }
   }, [searchQuery]);

   const runSearch = async () => {
      if (isValidMongoQuery) {
         setCurrentPage(0);
         const query = searchQuery
            .replace(/(Find|Aggregate|UpdateMany|UpdateOne)\(/, "")
            .replace(/\)$/, "");
         setSearchQuery("Loading...");
         const results = await runQuery(
            query,
            queryType,
            activeCollection,
            sortedByColumn,
         );
         if (results.documents) {
            setData(results.documents);
            setKeys(results.keys.sort());
            setHiddenRows([]);
         } else {
            console.log(results);
            toast.error(
               "Something went wrong with that query. No documents were updated.",
            );
         }
         setSearchQuery("");
      } else {
         try {
            const exampleDoc = JSON.stringify(data[0]);
            const query = searchQuery;
            setSearchQuery("Loading...");
            const newMongoQuery = await runEnglishSearchQuery(
               query,
               exampleDoc,
            );
            if (newMongoQuery) {
               const mongoFunction = newMongoQuery.mongo_function;
               const englishDescription = newMongoQuery.english_description;
               const mongioQuery = newMongoQuery.mongo_query;

               setSearchQuery(mongoFunction + "(" + mongioQuery + ")");
               setQueryType(mongoFunction);
               setQueryDescription(englishDescription);
            }
         } catch (e) {
            toast.error(
               "We couldn't figure out what you wanted. Please try again.",
            );
         }
      }
   };

   const showDetailView = (rowData: any, x: number, y: number) => {
      setRowDetailData(rowData);
      setClickPosition({ x: x, y: y });
   };

   const addHiddenRow = (row: string) => {
      setHiddenRows([...hiddenRows, row]);
   };

   const [sortedByColumn, setSortedByColumn] = useState<string>("");
   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
   const didClickSortColumn = (key: string) => {
      if (sortedByColumn === key) {
         setSortDirection((prevSortDirection) =>
            prevSortDirection === "asc" ? "desc" : "asc",
         );
      } else {
         setSortDirection("asc");
      }

      setSortedByColumn(key);
   };

   useEffect(() => {
      if (sortedByColumn == "") return;
      if (!activeCollection || activeCollection == "") return;

      const query = searchQuery
         .replace(/(Find|Aggregate|UpdateMany|UpdateOne)\(/, "")
         .replace(/\)$/, "");
      if (query != "") {
         runSearch();
         return;
      }

      getDocuments(
         activeCollection,
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

   if (!activeCollection)
      return getNiceInfo(
         "Select a collection",
         "Select (or create) a collection on the left to get started",
      );
   if (error)
      return getNiceInfo(
         "Failed to load data",
         "Check your connection and try again",
      );
   if (!data)
      return getNiceInfo("Loading data", "Please wait while we load your data");

   return (
      <div>
         <div className={`flex-1 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
            <div>
               <div className={`font-bold text-base`}>{activeCollection}</div>
               <div className={`text-sm mt-0.5`}>
                  Connect{" "}
                  <a
                     href="https://www.notion.so/Swizzle-e254b35ddef5441d920377fef3615eab?pvs=4"
                     target="_blank"
                     rel="nofollow"
                     className="underline decoration-dotted text-[#d2d3e0] hover:text-white"
                  >
                     directly from your app
                  </a>{" "}
                  or via APIs
               </div>
            </div>
            <div className="text-sm w-20">
               <DatabaseEditorHint isVisible={shouldShowSaveHint} />
            </div>
            <div
               className={`flex h-10 mt-1 mr-[-16px] text-sm ${
                  shouldShowSaveHint ? "hidden" : ""
               }`}
            >
               <Dropdown
                  className="ml-2"
                  onSelect={createObjectHandler}
                  children={[
                     {
                        id: "json",
                        name: "Document",
                     },
                  ]}
                  direction="right"
                  title="Create"
               />
            </div>
         </div>
         <div className={`flex h-8 ${data.length == 0 ? "hidden" : ""}`}>
            <input
               type="text"
               className={`text-s, flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a] ${
                  isValidMongoQuery ? "font-mono text-xs" : ""
               }`}
               placeholder={"What do you need?"}
               value={searchQuery}
               onChange={(e) => {
                  setSearchQuery(e.target.value);
               }}
               onKeyDown={(event) => {
                  if (event.key == "Enter") {
                     runSearch();
                  }
               }}
               onMouseEnter={() => {
                  setShouldShowSearchHint(true);
               }}
               onMouseLeave={() => {
                  setShouldShowSearchHint(false);
               }}
            />
            <Button
               text={isValidMongoQuery ? "Execute" : "Go"}
               onClick={runSearch}
            />
         </div>
         <div
            className={`absolute z-40 ml-6 mt-2 border-[#525363] border rounded bg-[#181922] p-2 max-w-lg ${
               shouldShowSearchHint
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
            }`}
            style={{ transition: "opacity 0.2s" }}
            onMouseEnter={() => {
               setShouldShowSearchHint(true);
            }}
            onMouseLeave={() => {
               setShouldShowSearchHint(false);
            }}
         >
            {!isValidMongoQuery ? (
               <>
                  <div className="font-bold mt-1.5">
                     💡 Find anything you need
                  </div>
                  <div className="text-sm ml-5 my-1">
                     You can do things like:
                     <ul className="list-disc my-1 mb-2 ml-5">
                        <li>
                           "Get everything with a SKU containing vendor-001"
                        </li>
                        <li>"Find records missing the email field"</li>
                        <li>
                           "Return documents with a name less than 3 characters,
                           ordered by creation date"
                        </li>
                     </ul>
                  </div>
               </>
            ) : (
               <>
                  <div className="font-bold mt-1.5">🚦 Confirm</div>
                  <div className="text-sm ml-5 my-1">
                     {queryDescription}
                     <br />
                     <br />
                     Click Execute or press enter again to confirm.
                  </div>
               </>
            )}
         </div>
         <div className="flex">
            <table className="table-auto flex-grow my-4 ml-4">
               <thead className="bg-[#85869822]">
                  <tr
                     className={`font-mono text-xs ${
                        keys.length == 0 ? "hidden" : ""
                     }`}
                  >
                     <th
                        className="text-left py-1.5 rounded-tl-md w-6"
                        key={0}
                     ></th>
                     {keys
                        .filter((k) => k != "_id")
                        .map((key, index) => (
                           <th
                              className={`cursor-pointer text-left py-1.5 ${
                                 index == keys.length - 2 ? "rounded-tr-md" : ""
                              }`}
                              key={index + 1}
                              onClick={() => didClickSortColumn(key)}
                           >
                              {key}
                              {sortedByColumn === key && (
                                 <FontAwesomeIcon
                                    icon={
                                       sortDirection === "asc"
                                          ? faArrowUp
                                          : faArrowDown
                                    }
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
                        style={{
                           display: hiddenRows.includes(row._id)
                              ? "none"
                              : "table-row",
                        }}
                        collection={activeCollection}
                        key={row._id}
                        rowKey={row._id}
                        keys={keys}
                        data={row}
                        setShouldShowSaveHint={setShouldShowSaveHint}
                        showDetailView={(
                           e: React.MouseEvent<SVGSVGElement>,
                        ) => {
                           showDetailView(row, e.clientX, e.clientY);
                        }}
                     />
                  ))}
               </tbody>
            </table>
            <RowDetail
               data={rowDetailData}
               clickPosition={clickPosition}
               collection={activeCollection}
               addHiddenRow={addHiddenRow}
            />
            <DocumentJSON
               document={jsonEditorData}
               collection={activeCollection}
               isVisible={isJSONEditorVisible}
               setIsVisible={setIsJSONEditorVisible}
               id={editingDocumentId}
               onChange={(data: any) => onJSONChangeHandler(data)} // Pass the data to the parent's handler
            />
         </div>
         {data.length == 0 && currentPage == 1 ? (
            <div className="flex-grow flex flex-col items-center justify-center">
               <div className="text-lg font-bold mt-4 mb-4">
                  😟 No documents
               </div>
               <Button
                  text="Delete this collection"
                  onClick={deleteCollectionHandler}
               />
            </div>
         ) : (
            <></>
         )}

         <div className="pagination-controls flex justify-center items-center py-4">
            {renderPaginationControls()}
         </div>
      </div>
   );
}

const getNiceInfo = (title: string, subtitle: string) => {
   return (
      <div className="flex-grow flex flex-col items-center justify-center">
         <div className="text-lg font-bold mt-4">{title}</div>
         <div className="text-sm text-center mt-2">{subtitle}</div>
      </div>
   );
};
