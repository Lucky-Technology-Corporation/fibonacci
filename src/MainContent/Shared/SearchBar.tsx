import Button from "../../Utilities/Button";
import Dropdown from "../../Utilities/Dropdown";

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
  return (
    <>
      <Dropdown
        className="ml-4"
        onSelect={setFilterName}
        children={keys
          .filter((k) => k !== "_id")
          .map((key) => {
            if (key == "_swizzle_uid") {
              return { id: key, name: "userId" };
            } else {
              return { id: key, name: "Filter " + key };
            }
          })}
        direction="left"
        title={"Filter " + (keys.filter((key) => key == filterName)[0] || "").replace("_swizzle_uid", "userId")}
      />
      <input
        type="text"
        className={`text-sm h-[36px] flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]`}
        placeholder={"Search"}
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
        text={"Search"}
        onClick={runSearch}
        className="h-[36px] px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
      />
    </>
  );
}
