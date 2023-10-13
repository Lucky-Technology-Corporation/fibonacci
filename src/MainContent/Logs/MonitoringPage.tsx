import AnalyticsPage from "./AnalyticsPage";
import LogsPage from "./LogsPage";

export default function MonitoringPage({ activeLogsPage, shouldShow }: { activeLogsPage: string, shouldShow: boolean }) {
  if(!shouldShow) return null;
  return activeLogsPage == "analytics" ? <AnalyticsPage /> : <LogsPage />;
}
