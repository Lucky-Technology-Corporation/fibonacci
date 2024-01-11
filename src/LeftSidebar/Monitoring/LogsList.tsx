import { Dispatch, SetStateAction } from "react";
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
        name="Overview"
        onClick={() => {
          setActivePage("analytics");
        }}
      />
      {/* <LogsItem
        className="assistant-tab"
        active={activePage == "assistant"}
        name="Assistant"
        onClick={() => {
          setActivePage("assistant");
        }}
      /> */}
      <LogsItem
        className="logs-tab"
        active={activePage == "logs"}
        name="Logs"
        onClick={() => {
          setActivePage("logs");
        }}
      />
      
      {/* <LogsItem
        className="templates-tab"
        active={activePage == "templates"}
        name="Templates"
        onClick={() => {
          setActivePage("templates");
        }}
      /> */}
    </div>
  );
}
