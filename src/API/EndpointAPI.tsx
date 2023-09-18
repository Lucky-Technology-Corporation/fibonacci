import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const BASE_URL = process.env.BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { testDomain, activeEndpoint, environment, activeProject } =
    useContext(SwizzleContext);

  const npmSearch = async (query: string) => {
    const response = await axios.get(
      `https://registry.npmjs.com/-/v1/search?text=${query}&size=10`,
    );
    return response.data.objects;
  };

  const updateSecret = async (secretName: string, secretValue: string, environment: string) => {
    
  }

  const getFile = async (fileName: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.get(
        `${testDomain.replace(
          "https",
          "http",
        )}:1234/code/file_contents?path=code/${fileName}`,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.log(e);
      return "";
    }
  };

  const getAIResponseToFile = async (userQuery: string, aiAction: string) => {
    //TODO: pull in code from imported files
    //TODO: split files into chunks an summarize long functions
    try {
      const fileName = activeEndpoint.replace(/\//g, "-");
      const fileContents = await getFile(
        "user-dependencies/" + fileName + ".js",
      );

      const response = await axios.post(
        `${BASE_URL}/projects/${activeProject}/${environment}/assistant/file`,
        {
          userQuery: userQuery,
          aiAction: aiAction,
          fileContents: fileContents,
        },
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.log(e);
      return "";
    }
  };

  const getAutocheckResponse = async () => {
    try {
      const fileName = activeEndpoint.replace(/\//g, "-");
      const fileContents = await getFile(
        "user-dependencies/" + fileName + ".js",
      );

      const response = await axios.post(
        `${BASE_URL}/projects/${activeProject}/${environment}/assistant/autocheck`,
        {
          fileContents: fileContents,
        },
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.log(e);
      return "";
    }
  };

  const getPackageJson = async () => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.get(
        `${testDomain.replace("https", "http")}:1234/code/package.json`,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  const getFiles = async (fileTypes) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }

      var path = "table_of_contents";
      if (fileTypes.toLowerCase() == "files") {
        path = "table_of_files";
      }

      const response = await axios.get(
        `${testDomain.replace("https", "http")}:1234/${path}`,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  const createAPI = async (apiName: string) => {
    return true;
  };

  const updateEndpoint = async (endpointName: string, code: string) => {
    return true;
  };

  return {
    createAPI,
    updateEndpoint,
    getFiles,
    npmSearch,
    getPackageJson,
    getFile,
    getAIResponseToFile,
    getAutocheckResponse,
  };
}
