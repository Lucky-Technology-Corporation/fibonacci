import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useNotificationApi() {
  const { activeProject, environment } = useContext(SwizzleContext);
  const authHeader = useAuthHeader();

  const sendNotification = async (title, body, users) => {
    try {
      if (!activeProject) {
        return null;
      }

      const payload = {
        title: title,
        body: body,
        users: users,
      };

      const url = `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/notification?env=${environment}`;
      const response = await axios.post(url, payload, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error sending notification", error);
      return null;
    }
  };

  const getNotificationKeys = async () => {
    try {
      if (!activeProject) {
        return null;
      }

      const url = `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/getNotificationKeys`;
      const response = await axios.get(url, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error getting saved settings", error);
    }
  };

  const setNotificationKey = async (p8Key, keyID, teamID, bundleID) => {
    try {
      if (!activeProject) {
        return null;
      }

      const payload = {
        p8_key_base64: p8Key,
        key_id: keyID,
        developer_id: teamID,
        bundle_id: bundleID,
      };

      const url = `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/setNotificationKeys`;

      await axios.post(url, payload, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error posting notification key", error);
    }
  };
  return { setNotificationKey, sendNotification, getNotificationKeys };
}
