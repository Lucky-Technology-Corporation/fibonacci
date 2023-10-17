import axios from "axios";
import jwt_decode from "jwt-decode";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useEndpointApi() {
  const authHeader = useAuthHeader();
  const { testDomain, activeEndpoint, environment, activeProject, setFermatJwt, fermatJwt } =
    useContext(SwizzleContext);

  const npmSearch = async (query: string) => {
    const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${query}&size=10`);
    return response.data.objects;
  };

  const exchangeJwt = async (projectId: string) => {
    try {
      if (projectId == undefined || projectId == null || projectId == "") {
        projectId = activeProject;
      }
      if (projectId == undefined || projectId == null || projectId == "") {
        throw "No project id";
      }
      const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects/${projectId}/fermat/jwt`, {
        headers: {
          Authorization: authHeader(),
        },
      });

      const jwt = response.data.fermat_token;
      if (jwt == undefined || jwt == null || jwt == "") {
        return "";
      }

      setFermatJwt(jwt);
      return jwt;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const refreshFermatJwt = async (projectId: string) => {
    const jwt = await exchangeJwt(projectId);
    if (jwt == "") {
      return "";
    }
    setFermatJwt(jwt);
    return "Bearer " + jwt;
  };

  const getFermatJwt = async () => {
    if (fermatJwt == "") {
      return refreshFermatJwt(activeProject);
    }
    let decoded = jwt_decode(fermatJwt) as any;
    let exp = decoded.exp;
    let now = Date.now() / 1000;
    if (exp < now) {
      const jwt = await exchangeJwt(activeProject);
      if (jwt == "") {
        return "";
      }
      setFermatJwt(jwt);
      return "Bearer " + jwt;
    }

    return "Bearer " + fermatJwt;
  };

  const deploy = async () => {
    try {
      const response = await axios.post(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/build/release`, {}, {
        headers: {
          Authorization: authHeader(),
        },
      });
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const getFile = async (fileName: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.get(
        `${testDomain.replace("https://", "https://fermat.")}/code/file_contents?path=code/${fileName}`,
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      console.log(response.data)
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const deleteFile = async (fileName: string, location: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return false;
      }

      var filePath = ""
      if(location == "backend"){
        filePath = "/backend/user-dependencies/" + fileName.replace("/", "") + ".js"
      } else if(location == "frontend"){
        filePath = "/frontend/src/" + fileName.replace("/", "") + ".js"
      } else if(location == "helpers"){
        filePath = "/backend/helpers/" + fileName.replace("/", "") + ".js"
      }

      const response = await axios.delete(
        `${testDomain.replace("https://", "https://fermat.")}/code/delete?path=code${filePath}`,
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  const askQuestion = async (userQuery: string, aiCommand: string) => {
    try {
      const fileName = activeEndpoint.replace(/\//g, "-").replace(/:/g, "_");

      var body = (body = {
        question_type: aiCommand,
        user_query: userQuery,
        fermat_domain: testDomain.replace("https://", "https://fermat."),
        fermat_jwt: await getFermatJwt(),
        current_file: "backend/user-dependencies/" + fileName + ".js",
      });

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/ask?env=${environment}`,
        body,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const getCodeFromFigma = async (figmaUrl: string, language: string) => {
    const figmaFileId = figmaUrl.split("file/")[1].split("/")[0];
    const nodeId = figmaUrl.split("node-id=")[1].split("&")[0];
    const response = await axios.post(
      `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/figma?env=${environment}`,
      {
        figma_file_id: figmaFileId,
        figma_node_id: nodeId,
        language: language,
        fermat_domain: testDomain.replace("https://", "https://fermat."),
        fermat_jwt: await getFermatJwt(),
      },
      {
        headers: {
          Authorization: authHeader(),
        },
      },
    );

    return response.data;
  };

  const getAutocheckResponse = async () => {
    try {
      const fileName = activeEndpoint.replace(/\//g, "-").replace(/:/g, "_");
      const fileContents = await getFile("backend/user-dependencies/" + fileName + ".js");

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/autocheck?env=${environment}`,
        {
          file_contents: fileContents,
        },
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const getPackageJson = async (location: string) => {
    console.log("Getting package.json");
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.get(`${testDomain.replace("https://", "https://fermat.")}/code/${location}/package.json`, {
        headers: {
          Authorization: await getFermatJwt(),
        },
      });
      return response.data;
    } catch (e) {
      console.error(e);
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

      var path = "/backend/user-dependencies";
      if (fileTypes.toLowerCase() == "files") {
        path = "/frontend/src";
      } else if (fileTypes.toLowerCase() == "helpers") {
        path = "/backend/helpers";
      }

      const response = await axios.get(`${testDomain.replace("https://", "https://fermat.")}/code?path=${path}`, {
        headers: {
          Authorization: await getFermatJwt(),
        },
      });

      return response.data;
    } catch (e) {
      console.error(e);
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
    askQuestion,
    getAutocheckResponse,
    deploy,
    getFermatJwt,
    getCodeFromFigma,
    refreshFermatJwt,
    deleteFile,
  };
}
