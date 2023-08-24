import Editor from "./Editor/Editor";
import EditorHeader from "./Editor/EditorHeader";
import { Method } from "../Utilities/Method";
import { Page } from "../Utilities/Page";
import DatabaseView from "./Database/DatabaseView";
import UserTableView from "./Auth/UserTableView";
import ObjectTableView from "./Storage/ObjectTableView";
import LogsDrawer from "./Editor/LogsDrawer";
import MonitoringPage from "./Logs/MonitoringPage";

type CenterContentProps = {
   selectedTab: Page;
   prependCode: string;
   didDeploy: boolean;
   setDidDeploy: (didDeploy: boolean) => void;
   activeCollection: string;
   activeLogsPage: string;
   fileUri: string;
};

export default function CenterContent({
   selectedTab,
   prependCode,
   didDeploy,
   setDidDeploy,
   activeCollection,
   activeLogsPage,
   fileUri,
}: CenterContentProps) {
   if (selectedTab === Page.Apis) {
      return (
         <div className="m-4 ml-0 text-sm whitespace-pre-line overflow-y-auto max-h-[900px]">
            <EditorHeader method={Method.GET} path="/" />
            <Editor fileUri={fileUri} />
         </div>
      );
   } else if (selectedTab == Page.Auth) {
      return (
         <div className="m-4 ml-0 text-sm whitespace-pre-line overflow-y-auto max-h-[900px]">
            <UserTableView />
         </div>
      );
   } else if (selectedTab == Page.Db) {
      return (
         <div className="m-4 ml-0 text-sm whitespace-pre-line overflow-y-auto max-h-[900px]">
            <DatabaseView activeCollection={activeCollection} />
         </div>
      );
   } else if (selectedTab == Page.Storage) {
      return (
         <div className="m-4 ml-0 text-sm whitespace-pre-line overflow-y-auto max-h-[900px]">
            <ObjectTableView />
         </div>
      );
   } else if (selectedTab == Page.Logs) {
      return (
         <div className="m-4 ml-0 text-sm whitespace-pre-line overflow-y-auto max-h-[900px]">
            <MonitoringPage activeLogsPage={activeLogsPage} />
         </div>
      );
   }
}
