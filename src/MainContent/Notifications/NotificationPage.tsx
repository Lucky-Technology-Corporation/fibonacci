import { useContext, useEffect, useState } from "react";
import useNotificationApi from "../../API/NotificationsAPI";
import { SwizzleContext } from '@Store'
import NotificationControls from "./NotificationControls";
import NotificationPageSetUp from "./NotificationPageSetUp";

export default function NotificationPage() {
  const api = useNotificationApi();
  const [savedP8Key, setSavedP8Key] = useState("");
  const [savedKeyID, setSavedKeyID] = useState("");
  const [savedTeamID, setSavedTeamID] = useState("");
  const [savedBundleID, setSavedBundleID] = useState("");
  const [showSetUp, setShowSetUp] = useState(true);
  const { activeProject } = useContext(SwizzleContext);

  const getNotificationKeys = async () => {
    try {
      const savedSettings = await api.getNotificationKeys();
      if (savedSettings == null) {
        setShowSetUp(true);
      } else {
        const isEmpty = Object.values(savedSettings).every((val) => val === "");
        setShowSetUp(isEmpty);
        setSavedP8Key(savedSettings.p8_key_base64);
        setSavedKeyID(savedSettings.key_id);
        setSavedTeamID(savedSettings.developer_id);
        setSavedBundleID(savedSettings.bundle_id);
      }
    } catch (error) {
      console.error("Error fetching saved notif keys", error);
    }
  };

  useEffect(() => {
    getNotificationKeys();
  }, [activeProject]);

  return (
    <div>
      {showSetUp ? (
        <NotificationPageSetUp
          setShowSetUp={setShowSetUp}
          savedP8Key={savedP8Key}
          savedTeamID={savedTeamID}
          savedBundleID={savedBundleID}
          savedKeyID={savedKeyID}
        />
      ) : (
        <NotificationControls setShowSetUp={setShowSetUp} />
      )}
    </div>
  );
}
