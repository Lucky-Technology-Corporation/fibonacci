import axios from "axios";
import jwt_decode from "jwt-decode";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useEndpointApi() {
  const authHeader = useAuthHeader();
  const { testDomain, activeEndpoint, environment, activeProject, setFermatJwt, fermatJwt, openUri, fullEndpointList } =
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
        withCredentials: true,
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
        withCredentials: true,
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

  const writeFile = async (path: string, content: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.post(
        `${testDomain.replace("https://", "https://fermat.")}/code/write_file`,
        {
          path: path,
          content: content,
        },
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

  const deleteFile = async (fileName: string, location: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return false;
      }

      var filePath = ""
      if(location == "backend"){
        filePath = "/backend/user-dependencies/" + fileName
      } else if(location == "frontend"){
        filePath = "/frontend/src/" + fileName
      } else if(location == "helpers"){
        filePath = "/backend/helpers/" + fileName
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

  const restartBackend = async () => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      console.log(await getFermatJwt())
      const response = await axios.post(`${testDomain.replace("https://", "https://fermat.")}/restart_backend`, {}, {
        headers: {
          Authorization: await getFermatJwt(),
        },
      });
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  const restartFrontend = async () => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      console.log(await getFermatJwt())
      const response = await axios.post(`${testDomain.replace("https://", "https://fermat.")}/restart_frontend`, {}, {
        headers: {
          Authorization: await getFermatJwt(),
        },
      });
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  const promptDbHelper = async (userQuery: string, collection: string, history?: any[]) => {
    try {
      var body = {
        prompt: userQuery,
        collection: collection,
        history: history,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/db?env=${environment}`,
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


  const promptAiEditor = async (userQuery: string, queryType: string, selectedText?: string, history?: any[]) => {
    try {

      var body = {
        prompt: userQuery,
        fermat_domain: testDomain.replace("https://", "https://fermat."),
        fermat_jwt: await getFermatJwt(),
        path: openUri.replace("/swizzle/code/", ""),
        conversation_id: "",
        query_type: queryType,
        selected_text: selectedText,
        history: history,
      };

      sessionStorage.setItem(("ai" + activeProject + "_" + openUri.replace("/swizzle/code/", "") + "_file"), userQuery)

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/edit?env=${environment}`,
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

  // const askQuestion = async (userQuery: string, aiCommand: string) => {
  //   try {
  //     const fileName = endpointToFilename(activeEndpoint);
      
  //     var currentFile = "backend/user-dependencies/" + fileName
  //     if(fileName.includes("!helper!")){
  //       currentFile = "backend/helpers/" + fileName.replace("!helper!", "")
  //     }

  //     var body = (body = {
  //       question_type: aiCommand,
  //       user_query: userQuery,
  //       fermat_domain: testDomain.replace("https://", "https://fermat."),
  //       fermat_jwt: await getFermatJwt(),
  //       current_file: currentFile,
  //     });

  //     const response = await axios.post(
  //       `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/ask?env=${environment}`,
  //       body,
  //       {
  //         withCredentials: true,
  //       },
  //     );
  //     return response.data;
  //   } catch (e) {
  //     console.error(e);
  //     return null;
  //   }
  // };

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
        withCredentials: true,
      },
    );

    return response.data;
  };

  const getAutocheckResponse = async () => {
    try {
      const fileName = openUri.replace("/swizzle/code/", "");
      const fileContents = await getFile(fileName);
      
      console.log("autochecking", fileName)
      if(fileName.includes("frontend/")){
        const neededEndpoints = checkIfAllEndpointsExist(fileContents)
      }

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/autocheck?env=${environment}`,
        {
          file_contents: fileContents,
          path: fileName,
        },
        {
          withCredentials: true
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const getPackageJson = async (location: string) => {
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

  const checkIfAllEndpointsExist = (data: string) => {
    const regex = /api\.(get|post)\((.*?)\)/g;
    const matches = []
    let match;

    while ((match = regex.exec(data)) !== null) {
      matches.push(match[2]);
    }
    var neededEndpoints = []
    for(var urlInQuotes of matches){
      const url = urlInQuotes.replace(/^['"]|['"]$/g, '');
      console.log("Checking " + url + " against " + fullEndpointList)
      const doesMatch = doesUrlMatch(url, fullEndpointList)
      if(!doesMatch){
        console.warn("Endpoint " + url + " does not exist")
        console.log("Do you want me to create " + url + " for you?")
        //OFFER TO CREATE THIS ENDPOINT IN THE BACKEND
        neededEndpoints.push(url)
      }
    }
    return neededEndpoints
  }

  function doesUrlMatch(url, patterns) {
    // Normalize and split the URL to be checked
    const urlParts = url.split('/').filter(part => part);

    // Iterate through each pattern
    return patterns.some(pattern => {
        // Normalize and split the pattern
        const patternParts = pattern.split('/').filter(part => part);

        // Check if the parts match, considering path parameters
        if (urlParts.length !== patternParts.length) {
            return false; // Different lengths, can't match
        }

        return patternParts.every((part, index) => {
            // Compare each part, path parameters are always a match
            return part.startsWith(':') || part === urlParts[index];
        });
    });
  }

  return {
    checkIfAllEndpointsExist,
    getFiles,
    npmSearch,
    getPackageJson,
    getFile,
    // askQuestion,
    getAutocheckResponse,
    deploy,
    getFermatJwt,
    getCodeFromFigma,
    refreshFermatJwt,
    deleteFile,
    restartFrontend,
    restartBackend,
    writeFile,
    promptAiEditor,
    promptDbHelper
  };
}
