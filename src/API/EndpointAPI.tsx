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

  const exchangeJwt = async () => {
    if(activeProject == null || activeProject == undefined || activeProject == "") return "";
    try {
      const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/fermat/jwt`, {
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
    const jwt = await exchangeJwt();
    if (jwt == "") {
      return "";
    }
    setFermatJwt(jwt);
  }

  const getFermatJwt = async () => {
    let decoded = jwt_decode(fermatJwt) as any;
    let exp = decoded.exp;
    let now = Date.now() / 1000;
    if (exp < now) {
      const jwt = await exchangeJwt();
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
      const response = await axios.post(`${testDomain.replace("https://", "https://fermat.")}/push_to_production`, {
        headers: {
          Authorization: await getFermatJwt(),
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
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const askQuestion = async (userQuery: string, aiCommand: string) => {
    try {
      const fileName = activeEndpoint.replace(/\//g, "-").replace(/:/g, "_");

      var body = {};
      if (aiCommand == "ask") {
        body = {
          question_type: "edit",
          user_query: userQuery,
          fermat_domain: testDomain.replace("https://", "https://fermat."),
          fermat_jwt: await getFermatJwt(),
          current_file: "user-dependencies/" + fileName + ".js",
        };
      } else if (aiCommand == "edit") {
        body = {
          question_type: "code",
          user_query: userQuery,
          fermat_domain: testDomain.replace("https://", "https://fermat."),
          fermat_jwt: await getFermatJwt(),
          current_file: "user-dependencies/" + fileName + ".js",
        };
      }

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
      const fileContents = await getFile("user-dependencies/" + fileName + ".js");

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

  const getPackageJson = async () => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.get(`${testDomain.replace("https://", "https://fermat.")}/code/package.json`, {
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

      var path = "table_of_contents";
      if (fileTypes.toLowerCase() == "files") {
        path = "table_of_files";
      } else if (fileTypes.toLowerCase() == "helpers") {
        path = "table_of_helpers";
      }
      
      const response = await axios.get(`${testDomain.replace("https://", "https://fermat.")}/${path}`, {
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
    refreshFermatJwt
  };
}
