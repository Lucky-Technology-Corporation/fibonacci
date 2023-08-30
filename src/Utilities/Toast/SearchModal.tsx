import ToastWindow from "./ToastWindow";
import { getSearchTableHelper } from "../SearchTableHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function SearchModal({
  searchTerm,
  handleSearch,
  setTerm,
  matchingCode,
  isModalOpen,
  setModalOpen,
}) {
  const isHintWindowVisible = isModalOpen;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value); // Update searchTerm with the new value
  };

  // Functions to show/hide the modal can be defined here
  const showHintWindowIfOpen = () => {
    // Your logic
  };

  const hideHintWindow = () => {
    setModalOpen(false);
  };

  const matchingRows = matchingCode.map((code) => ({
    endpoint: code.endpoint,
    snippet: code.snippet,
  }));
  const handleRowClick = (row: { endpoint: string; snippet?: string }) => {
    console.log(row.endpoint);
  };
  const table = getSearchTableHelper(matchingRows, handleRowClick);

  return (
    <ToastWindow
      isHintWindowVisible={isHintWindowVisible}
      showHintWindowIfOpen={showHintWindowIfOpen}
      hideHintWindow={hideHintWindow}
      title="search code"
      titleText="text-sm"
      position="top-left"
      content={
        <>
          <input
            className="text-s, mb-1 w-full flex-grow p-2 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a]"
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <div className="mt-1">
            {matchingCode.length === 0 ? (
              <p>No matches found</p>
            ) : (
              table // Display table here
            )}
          </div>
        </>
      }
    />
  );
}
