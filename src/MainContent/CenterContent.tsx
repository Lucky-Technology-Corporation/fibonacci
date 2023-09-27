import Editor from "./Editor/Editor";
import EditorHeader from "./Editor/EditorHeader";
import { Method } from "../Utilities/Method";
import { Page } from "../Utilities/Page";
import DatabaseView from "./Database/DatabaseView";
import UserTableView from "./Auth/UserTableView";
import ObjectTableView from "./Storage/ObjectTableView";
import LogsDrawer from "./Editor/LogsDrawer";
import MonitoringPage from "./Logs/MonitoringPage";
import { useContext, useState, useEffect} from "react";
import { SwizzleContext } from "../Utilities/GlobalContext";
import NotificationPage from "./Notifications/NotificationPage";

type CenterContentProps = {
  selectedTab: Page; 
  setCurrentFileProperties: (properties: any) => void;
  didDeploy: boolean;
  setDidDeploy: (didDeploy: boolean) => void;
  activeCollection: string;
  activeLogsPage: string;
};

export default function CenterContent({
  selectedTab,
  setCurrentFileProperties,
  didDeploy,
  setDidDeploy,
  activeCollection,
  activeLogsPage,
}: CenterContentProps) {
  const { activeEndpoint, activeFile } = useContext(SwizzleContext);
  
  
  
  return (
    <div className="m-0 text-sm whitespace-pre-line max-h-[100vh]">
      <div
        style={{
          display: selectedTab === Page.Apis || selectedTab === Page.Hosting ? "block" : "none",
        }}
      >
        <div style={{ display: activeEndpoint || activeFile ? "block" : "none" }}>
          <EditorHeader />
          <Editor
            setCurrentFileProperties={setCurrentFileProperties}
          />
        </div>
        <div
          style={{
            display: !activeEndpoint && selectedTab === Page.Apis ? "block" : "none",
          }}
        >
          <div className="flex-grow flex flex-col items-center justify-center">
            <div className="text-lg mt-12 mb-4 font-bold">No endpoint selected</div>
            <div className="text-md">👈 Create or select an endpoint from the list</div>
          </div>
        </div>
        <div
          style={{
            display: !activeFile && selectedTab === Page.Hosting ? "block" : "none",
          }}
        >
          <div className="flex-grow flex flex-col items-center justify-center">
            <div className="text-lg mt-12 mb-4 font-bold">No file selected</div>
            <div className="text-md">👈 Create or select a file from the list</div>
          </div>
        </div>
      </div>

      <div style={{ display: selectedTab === Page.Auth ? "block" : "none" }}>
        <div className="m-4 ml-0 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <UserTableView />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Db ? "block" : "none" }}>
        <div className="m-4 ml-0 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <DatabaseView activeCollection={activeCollection} />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Storage ? "block" : "none" }}>
        <div className="m-4 ml-0 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <ObjectTableView />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Logs ? "block" : "none" }}>
        <div className="m-4 ml-0 text-sm whitespace-pre-line max-h-[100vh] min-h-[50vh] overflow-scroll">
          <MonitoringPage activeLogsPage={activeLogsPage} />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Notifications ? "block" : "none" }}>
        <div className="m-2 ml-3 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <NotificationPage />
        </div>
      </div>
    </div>
  );
}
