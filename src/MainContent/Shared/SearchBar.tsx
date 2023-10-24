import { useEffect, useState } from "react";
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
}: {
  keys: string[];
  filterName: string;
  setFilterName: (filterName: string) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  runSearch: () => void;
  showMongo?: boolean;
}) {
  const exampleKeyOne = keys.filter(k => k != "_id")[0];
  const exampleKeyTwo = keys.filter(k => k != "_id")[keys.length - 2];

  const [mappedKeys, setMappedKeys] = useState<{id: string, name: string}[]>([]);
  const [action, setAction] = useState<string>("find");
  
  const actions = [
    { id: "find", name: "Find" },
    { id: "update", name: "Update" },
    { id: "delete", name: "Delete" },
    { id: "count", name: "Count" },
  ]
  
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
  }, [])

  const getActionPlaceholder = () => {
    if(action == "find"){
      return  [`{ '${exampleKeyOne}': { $ne: 'Example' }}`, ``]
    } else if(action == "update"){
      return [`{ '${exampleKeyOne}': 'Example' }`, `{ $set: { '${exampleKeyTwo}': 'Update' } }`]
    } else if(action == "delete"){
      return [`{ '${exampleKeyOne}': 'Example' }`, ``]
    } else if(action == "count"){
      return [`{ '${exampleKeyOne}': 'Example' }`]
    }
    return [``, ``]
  }

  return (
    <>
      <Dropdown
        className="ml-4"
        onSelect={setFilterName}
        children={mappedKeys}
        direction="left"
        title={(filterName == "_exec_mongo_query") ? "Query" : "Filter " + (keys.filter((key) => key == filterName)[0] || "").replace("_swizzle_uid", "userId")}
      />
      {filterName == "_exec_mongo_query" && (
        <Dropdown
          className="ml-4"
          onSelect={setAction}
          children={actions}
          direction="left"
          title={actions.filter((type) => type.id == action)[0].name}
        />
      )}
      <input
        type="text"
        className={`text-sm h-[36px] flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a] ${filterName == "_exec_mongo_query" ? "font-mono" : ""}`}
        placeholder={filterName == "_exec_mongo_query" ? getActionPlaceholder()[0] : "Search"}
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
      {action == "update" && (
        <input
          type="text"
          className={`text-sm h-[36px] flex-grow p-2 bg-transparent mr-4 border-[#525363] border rounded outline-0 focus:border-[#68697a] ${filterName == "_exec_mongo_query" ? "font-mono" : ""}`}
          placeholder={filterName == "_exec_mongo_query" ? getActionPlaceholder()[1] : "Search"}
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
      )}
      <Button
        text={filterName == "_exec_mongo_query" ? "Run" : "Search"}
        onClick={runSearch}
        className="h-[36px] px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
      />
    </>
  );
}
