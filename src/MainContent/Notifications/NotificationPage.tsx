import { useState, useEffect, useContext } from "react";
import { Card, Title, LineChart } from "@tremor/react";
import useApi from "../../API/MonitoringAPI";
import { DateRangePicker, DateRangePickerValue } from "@tremor/react";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function AnalyticsPage() {
  const api = useApi();
  const { activeProject } = useContext(SwizzleContext);

  return (
    <div className="h-full overflow-scroll">
      <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div>
          <div className={`font-bold text-base`}>Notifications</div>
          <div className={`text-sm mt-0.5`}>Setup and send notifications to your users</div>
        </div>
      </div>
    </div>
  );
}
