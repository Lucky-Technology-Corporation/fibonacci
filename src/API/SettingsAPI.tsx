import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { environment, activeProject } = useContext(SwizzleContext);

  const updateApns = async (p8Key: string, key_id: string, team_id: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/setNotificationKeys?env=${environment}`,
        { p8_key_base64: p8Key, key_id: key_id, developer_id: team_id },
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const getSecrets = async () => {
    try {
      if (activeProject == null) {
        return null;
      }
      const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/secrets?env=${environment}`, {
        headers: {
          Authorization: authHeader(),
        },
      });
      console.log(response.data);
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const saveSecrets = async (newSecrets: any) => {
    try {
      if (activeProject == null) {
        return null;
      }
      const response = await axios.patch(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/secrets?env=${environment}`,
        newSecrets,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const deleteSecret = async (secretName: string) => {
    try {
      if (activeProject == null) {
        return null;
      }
      const response = await axios.delete(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/secrets/${secretName}?env=${environment}`,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  return {
    updateApns,
    getSecrets,
    saveSecrets,
    deleteSecret,
  };
}
