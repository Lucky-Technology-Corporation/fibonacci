import AnalyticsPage from "./AnalyticsPage";
import AssistantPage from "./Assistant/AssistantPage";
import LogsPage from "./LogsPage";
import TemplatesPage from "./TemplatesPage";

export default function MonitoringPage({ activeLogsPage, shouldShow }: { activeLogsPage: string, shouldShow: boolean}) {
  // if(!shouldShow) return null;
  return (
    <>

    {activeLogsPage == "logs" && shouldShow && <LogsPage />}
    {activeLogsPage == "assistant" && shouldShow && <AssistantPage />}
    {activeLogsPage == "templates" && shouldShow && <TemplatesPage />}
    {activeLogsPage == "analytics" && shouldShow && <AnalyticsPage />}
    </>
  )
}
