import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";


const BASE_URL = process.env.BASE_URL;

export default function useNotificationApi() {
  const { activeProject, environment } = useContext(SwizzleContext);
  const authHeader = useAuthHeader();

  const sendNotification = async (title, body, users) => {
    try {
        if (!activeProject) {
            throw new Error ("No active project selected");
        }

        const payload = {
            title: title, 
            body: body, 
            users: users
        };

        const url = `${BASE_URL}/projects/${activeProject}/notification?env=${environment}`;
        const response = await axios.post(url, payload, {
            headers: {
              Authorization: authHeader(),
            },
          });
        console.log(response);

    } catch (error) {
        console.error("Error sending notification", error)
    }

  };

  const setNotificationKey = async (p8Key, keyID, teamID, bundleID) => {
    try {
      if (!activeProject) {
        throw new Error("No active project selected");
      }

      const payload = {
        p8_key_base64: p8Key,
        key_id: keyID,
        developer_id: teamID,
        bundle_id: bundleID
      };

      const url = `${BASE_URL}/projects/${activeProject}/setNotificationKeys`;
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: authHeader(),
        },
      });
      console.log(response);
    } catch (error) {
      console.error("Error posting notification key", error);
    }
  };
  return { setNotificationKey, sendNotification };
}
