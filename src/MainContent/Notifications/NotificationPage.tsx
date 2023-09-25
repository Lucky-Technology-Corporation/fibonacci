import NotificationPageSetUp from "./NotificationPageSetUp";
import NotificationControls from "./NotificationControls";
import { useState, useEffect } from "react";
import useNotificationApi from "../../API/NotificationsAPI";

type NotificationPageProps = {
    setShowSetUp: (value: boolean) => void;
    showSetUp: boolean;
}

export default function NotificationPage({showSetUp, setShowSetUp} : NotificationPageProps) {
  console.log('showSetUp:', showSetUp);
  const api = useNotificationApi();
  const [savedP8Key, setSavedP8Key] = useState("");
  const [savedKeyID, setSavedKeyID] = useState("");
  const [savedTeamID, setSavedTeamID] = useState("");
  const [savedBundleID, setSavedBundleID] = useState("");

  const getNotificationKeys = async () => {
    try {
        const savedSettings = await api.getNotificationKeys()
        if (savedSettings) {
            const isEmpty = Object.values(savedSettings).every(val => val === "");
            setShowSetUp(isEmpty);
            setSavedP8Key(savedSettings.data.p8_key_base64)
            setSavedKeyID(savedSettings.data.key_id)
            setSavedTeamID(savedSettings.data.developer_id)
            setSavedBundleID(savedSettings.data.bundle_id)
            console.log(savedSettings)
        } else {
            console.error("No settings returned from the API");
        }
        
    } catch (error) {
        console.error("Error fetching saved notif keys", error)
    }
  };

  useEffect(() => {
    getNotificationKeys();
}, []);

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
        <NotificationControls 
        setShowSetUp={setShowSetUp}
        setSavedBundleID={setSavedBundleID} 
        setSavedKeyID={setSavedKeyID}
        setSavedP8Key={setSavedP8Key}
        setSavedTeamID={setSavedTeamID}/>
      )}
    </div>
  );
}
