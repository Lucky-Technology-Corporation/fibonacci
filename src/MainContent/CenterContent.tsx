import { useContext } from "react";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { Page } from "../Utilities/Page";
import AppCodePage from "./AppCode/AppCodePage";
import UserTableView from "./Auth/UserTableView";
import DatabaseView from "./Database/DatabaseView";
import Editor from "./Editor/Editor";
import EndpointHeader from "./Editor/EndpointHeader";
import MonitoringPage from "./Logs/MonitoringPage";
import NotificationPage from "./Notifications/NotificationPage";
import ObjectTableView from "./Storage/ObjectTableView";

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
  const { activeEndpoint, activeFile, activeHelper } = useContext(SwizzleContext);

  return (
    <div className="m-0 text-sm whitespace-pre-line max-h-[100vh]">
      <div
        style={{
          opacity: selectedTab === Page.Apis || selectedTab === Page.Hosting ? "1" : "0",
          pointerEvents: selectedTab === Page.Apis || selectedTab === Page.Hosting ? "auto" : "none",
          height: selectedTab === Page.Apis || selectedTab === Page.Hosting ? "" : "1px",
        }}
      >
        <div style={{ opacity: activeEndpoint || activeFile || activeHelper ? "1" : "0" }}>
          <EndpointHeader />
          <Editor setCurrentFileProperties={setCurrentFileProperties} />
        </div>
        <div
          style={{
            display: (!activeEndpoint && !activeFile && !activeHelper) && selectedTab === Page.Apis ? "block" : "none",
          }}
        >
          <div className="flex-grow flex flex-col items-center justify-center mt-[-95vh]">
            <div className="text-lg mt-12 mb-4 font-bold">No endpoint selected</div>
            <div className="text-md">👈 Create or select an endpoint from the list</div>
          </div>
        </div>
        <div style={{ display: !activeFile && selectedTab === Page.Hosting ? "block" : "none" }}>
          <div className="flex-grow flex flex-col items-center justify-center">
            <div className="text-lg mt-12 mb-4 font-bold">No file selected</div>
            <div className="text-md">👈 Create or select a file from the list</div>
          </div>
        </div>
      </div>

      <div style={{ display: selectedTab === Page.Auth ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <UserTableView />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Db ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <DatabaseView activeCollection={activeCollection} />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Storage ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <ObjectTableView />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Logs ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] min-h-[50vh] overflow-scroll">
          <MonitoringPage activeLogsPage={activeLogsPage} />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Notifications ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <NotificationPage />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.AppCode ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <AppCodePage />
        </div>
      </div>
    </div>
  );
}
