import AnalyticsPage from "./AnalyticsPage";
import AssistantPage from "./Assistant/AssistantPage";
import LogsPage from "./LogsPage";
import TemplatesPage from "./TemplatesPage";

export default function MonitoringPage({
  activeLogsPage,
  setActiveLogsPage,
  shouldShow,
}: {
  activeLogsPage: string;
  setActiveLogsPage: any;
  shouldShow: boolean;
}) {
  // if(!shouldShow) return null;
  return (
    <>
      {activeLogsPage == "logs" && shouldShow && <LogsPage />}
      {activeLogsPage == "assistant" && shouldShow && <AssistantPage />}
      {activeLogsPage == "templates" && shouldShow && <TemplatesPage />}
      {activeLogsPage == "analytics" && shouldShow && <AnalyticsPage setActiveLogsPage={setActiveLogsPage} />}
    </>
  );
}
