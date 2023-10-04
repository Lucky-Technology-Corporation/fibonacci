import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { useContext } from "react";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { activeProject } = useContext(SwizzleContext);

  const getTemplates = async () => {
    if (activeProject == "") return;
    const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/templates`, {
      headers: {
        Authorization: authHeader(),
      },
    });

    return response.data;
  };

  const createTemplate = async () => {};

  return {
    getTemplates,
    createTemplate,
  };
}
