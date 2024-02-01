import axios from "axios";
import { useContext } from "react";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useJarvis() {
  const { activeProject, environment } = useContext(SwizzleContext);

  const editFrontend = async (prompt: string, pagePath: string, activeFile: string, history?: any[]) => {
    try {
      var body = {
        prompt: prompt,
        page_path: pagePath,
        file_path: activeFile,
        history: history,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/page/edit?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );

      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const createEndpoint = async (currentCode: string, missingEndpoint: string) => {
    try {
      var body = {
        current_code: currentCode,
        missing_endpoint: missingEndpoint,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/endpoint/create?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  const fixProblems = async (currentCode: string, fileErrors: string) => {
    try {
      var body = {
        current_code: currentCode,
        file_errors: fileErrors,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/page/fix?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return { editFrontend, fixProblems };
}
