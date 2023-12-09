import AnalyticsPage from "./AnalyticsPage";
import AssistantPage from "./Assistant/AssistantPage";
import LogsPage from "./LogsPage";
import TemplatesPage from "./TemplatesPage";

export default function MonitoringPage({ activeLogsPage, shouldShow }: { activeLogsPage: string, shouldShow: boolean}) {
  // if(!shouldShow) return null;
  return (
    <>
    <div className={activeLogsPage == "analytics" && shouldShow ? "" : "hidden"}>
      <AnalyticsPage />
    </div>
    <div className={activeLogsPage == "logs" && shouldShow ? "" : "hidden"}>
      <LogsPage />
    </div>
    <div className={activeLogsPage == "assistant" && shouldShow ? "" : "hidden"}>
      <AssistantPage />
    </div>
    <div className={activeLogsPage == "templates" && shouldShow ? "" : "hidden"}>
      <TemplatesPage />
    </div>
    {/* activeLogsPage == "analytics" ? <AnalyticsPage /> : activeLogsPage == "logs" ? <LogsPage /> : activeLogsPage == "assistant" ?  <AssistantPage /> : <TemplatesPage /> */}
    </>
  )
}
