import AnalyticsPage from "./AnalyticsPage";
import LogsPage from "./LogsPage";
import TemplatesPage from "./TemplatesPage";

export default function MonitoringPage({ activeLogsPage, shouldShow }: { activeLogsPage: string, shouldShow: boolean}) {
  if(!shouldShow) return null;
  return activeLogsPage == "analytics" ? <AnalyticsPage /> : activeLogsPage == "logs" ? <LogsPage /> : <TemplatesPage />;
}
