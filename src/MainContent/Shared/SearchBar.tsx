import { Button, Dropdown } from '@Components';

export default function SearchBar({
  keys,
  filterName,
  setFilterName,
  searchQuery,
  setSearchQuery,
  runSearch,
}: {
  keys: string[];
  filterName: string;
  setFilterName: (filterName: string) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  runSearch: () => void;
}) {
  const exampleKeyOne = keys.filter(k => k != "_id")[0];
  const exampleKeyTwo = keys.filter(k => k != "_id")[keys.length - 2];

  return (
    <>
      <Dropdown
        className="ml-4"
        onSelect={setFilterName}
        children={(["_exec_mongo_query"].concat(keys))
          .filter((k) => k !== "_id")
          .map((key) => {
            if (key == "_swizzle_uid") {
              return { id: key, name: "userId" };
            } else if(key == '_exec_mongo_query'){
              return { id: key, name: "Execute Mongo Query" };
            } else {
              return { id: key, name: "Filter " + key };
            }
          })}
        direction="left"
        title={(filterName == "_exec_mongo_query") ? "Execute Mongo Query" : "Filter " + (keys.filter((key) => key == filterName)[0] || "").replace("_swizzle_uid", "userId")}
      />
      <input
        type="text"
        className={`text-sm h-[36px] flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]`}
        placeholder={filterName == "_exec_mongo_query" ? `updateOne({'${exampleKeyOne}': 'Example'}, { $set: {'${exampleKeyTwo}': 'Update'} })` : "Search"}
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
        text={filterName == "_exec_mongo_query" ? "Run" : "Search"}
        onClick={runSearch}
        className="h-[36px] px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
      />
    </>
  );
}
