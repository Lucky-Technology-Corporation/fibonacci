import axios from "axios";
import { useContext } from "react";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useJarvis() {
  const { activeProject, environment } = useContext(SwizzleContext);

  const createPageFromImage = async (base64: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/page/image?env=${environment}`,
        {
          base64: base64,
        },
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

  const createComponentFromImage = async (base64: string) => {  
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/component/image?env=${environment}`,
        {
          base64: base64,
        },
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

  const editFrontend = async (prompt: string, pagePath: string, activeFile: string, history?: any[]) => {
    if(activeFile.includes("frontend/src/pages/")) {
      try {
        const response = await axios.post(
          `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/page/edit?env=${environment}`,
          {
            prompt: prompt,
            page_path: pagePath,
            file_path: activeFile,
            history: history,
          },
          {
            withCredentials: true,
          },
        );

        return response.data;
      } catch (e) {
        console.error(e);
        return null;
      }
    } else if(activeFile.includes("frontend/src/components")){
      try {
        const response = await axios.post(
          `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/component/edit?env=${environment}`,
          {
            prompt: prompt,
            file_path: activeFile.replace("frontend/src/components/", ""),
            history: history,
          },
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
  };

  const createMissingBackendEndpoint = async (currentCode: string, missingEndpoint: string) => {
    try {
      var body = {
        current_code: currentCode,
        missing_endpoint: missingEndpoint,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/page/endpoint?env=${environment}`,
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

  return { editFrontend, fixProblems, createMissingBackendEndpoint, createPageFromImage, createComponentFromImage };
}
