import AnalyticsPage from "./AnalyticsPage";
import LogsPage from "./LogsPage";

export default function MonitoringPage({ activeLogsPage }: { activeLogsPage: string }) {
  return activeLogsPage == "analytics" ? <AnalyticsPage /> : <LogsPage />;
}
