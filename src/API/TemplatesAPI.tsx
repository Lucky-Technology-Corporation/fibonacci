import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useTemplateApi() {
  const authHeader = useAuthHeader();
  const { activeProject } = useContext(SwizzleContext);

  const getTemplates = async () => {
    if (activeProject == "") return;
    const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/templates`, {
      withCredentials: true,
    });
    console.log("templates", response)
    return response.data;
  };

  const createFromTemplate = async (payload) => {
    if (activeProject == "") return;

    try {
      const response = await axios.post(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/templates`, payload, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating from template:", error);
      throw error;
    }
  };

  return {
    getTemplates,
    createFromTemplate,
  };
}
