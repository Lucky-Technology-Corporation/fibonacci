import { useContext, useRef } from "react";
import { SwizzleContext } from "../Utilities/GlobalContext";
import InProgressDeploymentModal from "../Utilities/InProgressDeploymentModal";
import { Page } from "../Utilities/Page";
import UserTableView from "./Auth/UserTableView";
import DatabaseView from "./Database/DatabaseView";
import Editor from "./Editor/Editor";
import EndpointHeader from "./Editor/EndpointHeader";
import MonitoringPage from "./Logs/MonitoringPage";
import NotificationPage from "./Notifications/NotificationPage";
import ObjectTableView from "./Storage/ObjectTableView";

type CenterContentProps = {
  activeLogsPage: string;
  setActiveLogsPage: any;
  isModalOpen: any;
  setIsModalOpen: any;
};

export default function CenterContent({
  activeLogsPage,
  setActiveLogsPage,
  isModalOpen,
  setIsModalOpen,
}: CenterContentProps) {
  const {
    activeEndpoint,
    activeFile,
    activeHelper,
    shouldOverlay,
    selectedTab,
    currentFileProperties,
    setCurrentFileProperties,
    activeCollection,
  } = useContext(SwizzleContext);

  const headerRef = useRef(null);
  const focusOnHeader = () => {
    if (headerRef.current) {
      headerRef.current.focus();
    }
  };

  return (
    <div
      className={`relative m-0 text-sm whitespace-pre-line max-h-[100vh] ${
        selectedTab == Page.Logs && activeLogsPage == "assistant" ? "!overflow-scroll" : ""
      }`}
    >
      <div
        style={{
          opacity: selectedTab === Page.Apis || selectedTab === Page.Hosting || selectedTab === Page.Types ? "1" : "0",
          pointerEvents: selectedTab === Page.Apis || selectedTab === Page.Hosting || selectedTab === Page.Types ? "auto" : "none",
          height: selectedTab === Page.Apis || selectedTab === Page.Hosting || selectedTab === Page.Types ? "" : "1px",
        }}
      >
        {(shouldOverlay || (selectedTab !== Page.Apis && selectedTab !== Page.Hosting && selectedTab !== Page.Types)) && (
          <div className="absolute top-0 left-0 w-full h-full z-10"></div>
        )}
        <div
          style={{ opacity: activeEndpoint || activeFile || activeHelper ? "1" : "0" }}
          className="absolute w-full z-40"
        >
          {/* <EndpointHeader selectedTab={selectedTab} currentFileProperties={currentFileProperties} setCurrentFileProperties={setCurrentFileProperties} headerRef={headerRef} /> */}
          <Editor
            currentFileProperties={currentFileProperties}
            setCurrentFileProperties={setCurrentFileProperties}
            selectedTab={selectedTab}
            headerRef={headerRef}
          />
        </div>
        <div
          style={{
            display: !activeEndpoint && !activeFile && !activeHelper && selectedTab === Page.Apis ? "block" : "none",
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
        <div className="m-4 mt-2 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <EndpointHeader
            selectedTab={selectedTab}
            currentFileProperties={currentFileProperties}
            setCurrentFileProperties={setCurrentFileProperties}
            headerRef={headerRef}
            activeCollection={activeCollection}
            isDebugging={false}
            setIsDebugging={() => {}}
          />
          <DatabaseView activeCollection={activeCollection} />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Storage ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <ObjectTableView />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Logs ? "block" : "none" }}>
        <div
          className={`m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] ${
            activeLogsPage == "assistant" ? "overflow-none" : "overflow-scroll"
          }`}
        >
          <MonitoringPage
            setActiveLogsPage={setActiveLogsPage}
            activeLogsPage={activeLogsPage}
            shouldShow={selectedTab === Page.Logs}
          />
        </div>
      </div>
      <div style={{ display: selectedTab === Page.Notifications ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <NotificationPage />
        </div>
      </div>
      {/* <div style={{ display: selectedTab === Page.AppCode ? "block" : "none" }}>
        <div className="m-4 ml-2 text-sm whitespace-pre-line max-h-[100vh] overflow-scroll">
          <AppCodePage />
        </div>
      </div> */}
      <InProgressDeploymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
