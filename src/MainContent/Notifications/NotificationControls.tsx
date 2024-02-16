import { useContext, useEffect, useRef, useState } from "react";
import useDatabaseApi from "../../API/DatabaseAPI";
import useNotificationApi from "../../API/NotificationsAPI";
import Button from "../../Utilities/Button";
import Checkbox from "../../Utilities/Checkbox";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import NotificationsTable from "./NotificationsTable";
import SampleNotification from "./SampleNotification";

export default function NotificationControls({ setShowSetUp }) {
  const api = useNotificationApi();
  const dbApi = useDatabaseApi();
  const [allUsers, setAllUsers] = useState(false);
  const [specificUsers, setSpecificUsers] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const { activeProject, environment } = useContext(SwizzleContext);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [users, setUsers] = useState([]);
  const notificationRef = useRef(null);

  const send = async () => {
    if (allUsers) {
      const docs = dbApi.getDocuments("users");
    }

    runAnimation();

    api.sendNotification(title, body, users); //await this later

    const documentToCreate = {
      title: title,
      time: new Date(),
      body: body,
      recipients: users,
    };

    dbApi.createDocument("_swizzle_notifications", documentToCreate);
    fetchNotifData();
  };

  const handleUsers = (event) => {
    const ids = event.target.value.split(",").map((id) => id.trim());
    setUsers(ids);
  };

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
    fetchNotifData();
  }, [activeProject, environment]);

  const runAnimation = () => {
    const element = notificationRef.current;
    element.classList.add("wooshUp");

    setTimeout(() => {
      element.classList.remove("wooshUp");
      element.classList.add("fadeIn");
    }, 800); // Remove wooshUp and add fadeIn after 1 second

    setTimeout(() => {
      element.classList.remove("fadeIn");
    }, 200);
  };

  return (
    <div className="h-full w-full overflow-scroll">
      <div className="pr-2 mx-4 mb-4 mt-1 flex justify-between items-center">
        <div className="font-bold text-base">Push Notifications</div>
        <Button
          text="Settings"
          onClick={() => setShowSetUp(true)}
          className="w-30 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#33333c] text-base font-medium hover:bg-[#44464f] sm:text-sm cursor-pointer"
        />
      </div>
      <div className="w-full flex justify-center">
        <div ref={notificationRef}>
          <SampleNotification setBody={setBody} body={body} setTitle={setTitle} title={title} />
        </div>
      </div>

      <div className="flex justify-center space-x-4 items-center">
        <Checkbox
          id="allusers"
          label="All users"
          isChecked={allUsers}
          setIsChecked={() => {
            setAllUsers(true);
            setSpecificUsers(false);
          }}
        />
        <Checkbox
          id="specificusers"
          label="Specific users"
          isChecked={specificUsers}
          setIsChecked={() => {
            setSpecificUsers(true);
            setAllUsers(false);
          }}
        />

        <Button
          text="Send"
          onClick={send}
          className="w-30 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#33333c] text-base font-medium hover:bg-[#44464f] sm:text-sm cursor-pointer"
        />
      </div>
      <div className="mt-4 flex justify-center">
        <input
          className={`bg-transparent border-[#525363] w-80 border rounded outline-none focus:border-[#68697a] p-2 ${
            specificUsers ? "show" : "h-0 mt-0 opacity-0"
          }`}
          placeholder={"User IDs, seperated by commas"}
          onChange={handleUsers}
          style={{
            transition: "opacity 0.2s ease-in-out, height 0.2s ease-in-out",
          }}
        />
      </div>
      <div className="mt-8 flex justify-center">
        <NotificationsTable notifications={notificationData ? notificationData : []} />
      </div>
    </div>
  );
}
