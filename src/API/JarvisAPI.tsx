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

  const editBackend = async (prompt: string, activeEndpoint: string, activeFile: string, history?: any[]) => {
    if(activeFile.includes("backend/user-dependencies/")) { //endpoint

      const endpointParts = activeEndpoint.split("/");
      const method = endpointParts[0];
      const path = "/" + endpointParts.slice(1).join("/");

      var activeFileParsed = activeFile
      if(activeFileParsed.startsWith("/")){
        activeFileParsed = activeFileParsed.substring(1)
      }

      try {
        const response = await axios.post(
          `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/endpoint/edit?env=${environment}`,
          {
            prompt: prompt,
            endpoint_path: path,
            endpoint_method: method,
            file_path: activeFileParsed,
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
    } else if(activeFile.includes("backend/helpers/")) { //helper
      try {
        const response = await axios.post(
          `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/helper/edit?env=${environment}`,
          {
            prompt: prompt,
            file_path: activeFileParsed,
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

  const addSnippet = async (prompt: string, currentCode: string, filePath: string) => {
    var fileType = ""
    if(filePath.includes("frontend/src/pages/")){
      fileType = "page"
    } else if(filePath.includes("frontend/src/components/")){
      fileType = "component"
    } else if(filePath.includes("backend/user-dependencies/")){
      fileType = "endpoint"
    } else if(filePath.includes("backend/helpers/")){
      fileType = "helper"
    }

    try {
      var body = {
        current_code: currentCode,
        prompt: prompt,
        file_type: fileType,
        file_path: filePath,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/jarvis/snippet?env=${environment}`,
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

  return { editFrontend, editBackend, fixProblems, createMissingBackendEndpoint, createPageFromImage, createComponentFromImage, addSnippet };
}
