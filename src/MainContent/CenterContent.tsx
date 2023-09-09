import Editor from "./Editor/Editor";
import EditorHeader from "./Editor/EditorHeader";
import { Method } from "../Utilities/Method";
import { Page } from "../Utilities/Page";
import DatabaseView from "./Database/DatabaseView";
import UserTableView from "./Auth/UserTableView";
import ObjectTableView from "./Storage/ObjectTableView";
import LogsDrawer from "./Editor/LogsDrawer";
import MonitoringPage from "./Logs/MonitoringPage";
import { useContext } from "react";
import { SwizzleContext } from "../Utilities/GlobalContext";

type CenterContentProps = {
  selectedTab: Page;
  prependCode: string;
  findReplace: string[];
  setCurrentFileProperties: (properties: any) => void;
  didDeploy: boolean;
  setDidDeploy: (didDeploy: boolean) => void;
  activeCollection: string;
  activeLogsPage: string;
  fileUri: string;
};

export default function CenterContent({
  selectedTab,
  prependCode,
  findReplace,
  setCurrentFileProperties,
  didDeploy,
  setDidDeploy,
  activeCollection,
  activeLogsPage,
  fileUri,
}: CenterContentProps) {

  const {activeEndpoint} = useContext(SwizzleContext);

  if (selectedTab === Page.Apis) {
    return (
      <div className="m-0 mr-1 text-sm whitespace-pre-line max-h-[100vh]">
        {activeEndpoint ? (
          <>
            <EditorHeader />
            <Editor fileUri={fileUri} prependText={prependCode} findReplace={findReplace} setCurrentFileProperties={setCurrentFileProperties} />
          </>
        ) : (
          <>
           <div className="flex-grow flex flex-col items-center justify-center">
              <div className="text-lg mt-12 mb-4 font-bold">No endpoint selected</div>
              <div className="text-md">👈 Create or select an endpoint from the list</div>
            </div>
          </>
        )}
      </div>
    );
  } else if (selectedTab == Page.Auth) {
    return (
      <div className="m-4 ml-0 text-sm whitespace-pre-line max-h-[100vh]">
        <UserTableView />
      </div>
    );
  } else if (selectedTab == Page.Db) {
    return (
      <div className="m-4 ml-0 text-sm whitespace-pre-line max-h-[100vh]">
        <DatabaseView activeCollection={activeCollection} />
      </div>
    );
  } else if (selectedTab == Page.Storage) {
    return (
      <div className="m-4 ml-0 text-sm whitespace-pre-line max-h-[100vh]">
        <ObjectTableView />
      </div>
    );
  } else if (selectedTab == Page.Logs) {
    return (
      <div className="m-4 ml-0 text-sm whitespace-pre-line max-h-[100vh]">
        <MonitoringPage activeLogsPage={activeLogsPage} />
      </div>
    );
  }
}
