import { useState, useEffect, useContext, useRef } from "react";
import useNotificationApi from "../../API/NotificationsAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import Button from "../../Utilities/Button";
import { getTableHelper } from "../../Utilities/TableHelper";
import Checkbox from "../../Utilities/Checkbox";
import NotificationsTable from "./NotificationsTable";
import SampleNotification from "./SampleNotification";
import useApi from "../../API/DatabaseAPI"

export default function NotificationControls() {
  const api = useNotificationApi();
  const dbApi = useApi();
  const [allUsers, setAllUsers] = useState(false);
  const [specificUsers, setSpecificUsers] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const { activeProject, environment } = useContext(SwizzleContext);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [users, setUsers] = useState([]);

  const settings = (async) => {};

  const fetchNotifData = async () => {
    try {
      const fetchedData = await dbApi.getDocuments("_swizzle_notifications");
      if (fetchedData == null) {
        return;
      }
      setNotificationData(fetchedData.documents);
    } catch (error) {
      console.error("Error fetching notification data:", error);
    }
  };

  useEffect(() => {
    if (activeProject == null) {
      return;
    }
    console.log("fetching...");
    fetchNotifData();
  }, [activeProject, environment]);

  return (
    <div className="h-full w-full overflow-scroll">
      <div className="pr-2 mx-4 mb-4 mt-1 flex justify-between items-center">
        <div className="font-bold text-base">Push Notifications</div>
        <Button
          text="Settings"
          onClick={() => settings}
          className="w-30 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#33333c] text-base font-medium hover:bg-[#44464f] sm:text-sm cursor-pointer"
        />
      </div>
      <div className="w-full flex justify-center">
        <SampleNotification />
      </div>

      <div className="flex justify-center space-x-4 items-center">
        <Checkbox id="allusers" label="All users" isChecked={allUsers} setIsChecked={setAllUsers} />
        <Checkbox id="specificusers" label="Specific users" isChecked={specificUsers} setIsChecked={setSpecificUsers} />
        <Button
          text="Send"
          onClick={() => api.sendNotification(title, body, users)}
          className="w-30 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#33333c] text-base font-medium hover:bg-[#44464f] sm:text-sm cursor-pointer"
        />
      </div>
      <div className="mt-8 flex justify-center">
        <NotificationsTable notifications={notificationData ? notificationData : []} />
      </div>
    </div>
  );
}
