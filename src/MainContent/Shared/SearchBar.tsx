import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../Utilities/Button";
import Dropdown from "../../Utilities/Dropdown";

export default function SearchBar({
  keys,
  filterName,
  setFilterName,
  searchQuery,
  setSearchQuery,
  runSearch,
  showMongo = false,
  refreshHandler,
  numberOfResults = 0,
}: {
  keys: string[];
  filterName: string;
  setFilterName: (filterName: string) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  runSearch: () => void;
  showMongo?: boolean;
  refreshHandler: () => void;
  numberOfResults?: number;
}) {
  const exampleKeyOne = keys.filter(k => k != "_id")[0];
  const exampleKeyTwo = keys.filter(k => k != "_id")[keys.length - 2];

  const [mappedKeys, setMappedKeys] = useState([]);
  useEffect(() => {
    var newKeys = keys;
    if (showMongo) {
      newKeys = ["_exec_mongo_query"].concat(keys);
    } 
    
    const newKeyArray = newKeys
      .filter((k) => k !== "_id")
      .map((key) => {
        if (key == "_swizzle_uid") {
          return { id: key, name: "userId" };
        } else if(key == '_exec_mongo_query'){
          return { id: key, name: "Query" };
        } else {
          return { id: key, name: "Filter " + key };
        }
      })
      
    setMappedKeys(newKeyArray)
  }, [keys])

  const validateInput = () => {
    if(searchQuery == ""){
      searchQuery = "find({})"
    }
    const operationType = searchQuery.split('(')[0].trim();
    
    if (!/find|update|delete|aggregate/.test(operationType)) {
      toast.error('The query must start with find, update, delete, or aggregate.');
      return
    }

    if(!searchQuery.includes("(") || !searchQuery.includes(")")){
      toast.error('The query arguments must be enclosed in parentheses: find({"key": "value"}).');
      return
    }

    if (!searchQuery.split('(')[1].startsWith('{') || !searchQuery.endsWith('})')) {
      toast.error('The query must be enclosed in curly braces.');
      return
    }
    
    if (!/\"[\w$]+\"\s*:/.test(searchQuery)) {
      toast.error('Keys must be enclosed in quotes.');
      return
    }
    
    if (!/\:/.test(searchQuery)) {
      toast.error('Keys and values must be separated by a colon.');
      return
    }
  
    if (operationType.startsWith('update')) {
      if (!/\$set|\$unset|\$inc/.test(searchQuery)) {
        toast.error('Update operations must include an operator like $set, $unset, $inc, etc.');
        return
      }
    }
  
    if (operationType === 'find' || operationType === 'delete') {
      if (!/\$or|\$and|\$lt|\$lte|\$gt|\$gte|\$ne/.test(searchQuery) && !/"[^"]+"\s*:\s*[^"]+/.test(searchQuery)) {
        toast.error("Your query must include an operator like $or, $and, $lt, $lte, $gt, $gte, $ne, etc. Or no operators at all.")
        return
      }
    }
  
    if (operationType === 'aggregate') {
      if (!/\$match|\$group|\$unwind|\$sort/.test(searchQuery)) {
        toast.error('Aggregate queries must include operators like $match, $group, $unwind, $sort, etc.');
        return
      }
    }

    runSearch()
  }

  return (
    <>
    {searchQuery != "" ?
      <Button
        className="ml-4 px-2 py-4 mt-0.5 font-medium rounded-md flex justify-center items-center cursor-pointer"
        children={<FontAwesomeIcon icon={faXmark} className="w-4 h-4" />}
        onClick={() => {
          setSearchQuery("");
          refreshHandler()
        }}
      />
      : <div className="w-2"></div>
    }
      <Dropdown
        className="fixed"
        selectorClass="ml-2"
        onSelect={setFilterName}
        children={mappedKeys}
        direction="center"
        title={(filterName == "_exec_mongo_query") ? "Mongo Query" : "Filter " + (keys.filter((key) => key == filterName)[0] || "").replace("_swizzle_uid", "userId")}
      />
      <input
        type="text"
        className={`text-sm h-[36px] flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a] ${filterName == "_exec_mongo_query" ? "font-mono text-xs": ""}`}
        placeholder={filterName == "_exec_mongo_query" ? `updateOne({'${exampleKeyOne}': 'SearchText'}, { $set: {'${exampleKeyTwo}': 'UpdateText'} })` : "Search"}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key == "Enter") {
            if(filterName == "_exec_mongo_query"){
              validateInput()
            } else{
              runSearch();
            }
          }
        }}
      />
      <Button
        text={filterName == "_exec_mongo_query" ? "Run" : "Search"}
        onClick={runSearch}
        className="h-[36px] px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
      />
    </>
  );
}
