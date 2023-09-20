import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import LogsItem from "./LogsItem";

export default function Logslist({
  active,
  activePage,
  setActivePage,
}: {
  active: boolean;
  activePage: string;
  setActivePage: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className={`flex-col w-full mt-1 px-2 ${active ? "" : "hidden"}`}>
      <LogsItem
        active={activePage == "analytics"}
        name="Analytics"
        onClick={() => {
          setActivePage("analytics");
        }}
      />
      <LogsItem
        active={activePage == "logs"}
        name="Logs"
        onClick={() => {
          setActivePage("logs");
        }}
      />
    </div>
  );
}
