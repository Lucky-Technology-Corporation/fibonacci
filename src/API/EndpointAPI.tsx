import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import jwt_decode from "jwt-decode";

const BASE_URL = process.env.BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { testDomain, activeEndpoint, environment, activeProject, setFermatJwt, fermatJwt } = useContext(SwizzleContext);

  const npmSearch = async (query: string) => {
    const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${query}&size=10`);
    return response.data.objects;
  };

  const exchangeJwt = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/projects/${activeProject}/fermat/jwt`, {
        headers: {
          Authorization: authHeader(),
        },
      });
      
      const jwt = response.data.fermat_token;
      if(jwt == undefined || jwt == null || jwt == ""){
        return "";
      }

      setFermatJwt(jwt);
      return jwt;
      
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  const getFermatJwt = async () => {
    if(fermatJwt == ""){
      const jwt = await exchangeJwt();
      if(jwt == ""){
        return "";
      }
      setFermatJwt(jwt)
      return "Bearer " + jwt;
    } else{

      let decoded = jwt_decode(fermatJwt) as any;
      let exp = decoded.exp;
      let now = Date.now() / 1000;
      if(exp < now){
        const jwt = await exchangeJwt();
        if(jwt == ""){
          return "";
        }
        setFermatJwt(jwt)
        return "Bearer " + jwt;
      }

      return "Bearer " + fermatJwt;
    }
  }


  const deploy = async () => {
    try {
      const response = await axios.post(`${testDomain.replace("https://", "http://")}:1234/push_to_production`, {
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
      const response = await axios.get(`${testDomain.replace("https://", "http://")}:1234/code/file_contents?path=code/${fileName}`, {
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

  const askQuestion = async (userQuery: string, fileName: string) => {
    try {
      const fileName = activeEndpoint.replace(/\//g, "-");

      const response = await axios.post(
        `${BASE_URL}/projects/${activeProject}/assistant/ask?env=${environment}`,
        {
          question_type: "code",
          user_query: userQuery,
          fermat_domain: testDomain.replace("https://", "http://"),
          fermat_jwt: await getFermatJwt(),
          current_file: "user-dependencies/" + fileName + ".js",
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
      return null;
    }
  };


  // const getAIResponseToFile = async (userQuery: string, aiAction: string) => {
  //   //TODO: pull in code from imported files
  //   //TODO: split files into chunks an summarize long functions
  //   try {
  //     const fileName = activeEndpoint.replace(/\//g, "-");
  //     const fileContents = await getFile("user-dependencies/" + fileName + ".js");

  //     const response = await axios.post(
  //       `${BASE_URL}/projects/${activeProject}/assistant/file?env=${environment}`,
  //       {
  //         userQuery: userQuery,
  //         aiAction: aiAction,
  //         fileContents: fileContents,
  //       },
  //       {
  //         headers: {
  //           Authorization: authHeader(),
  //         },
  //       },
  //     );
  //     return response.data;
  //   } catch (e) {
  //     console.error(e);
  //     return "";
  //   }
  // };

  const getAutocheckResponse = async () => {
    try {
      const fileName = activeEndpoint.replace(/\//g, "-");
      const fileContents = await getFile("user-dependencies/" + fileName + ".js");

      const response = await axios.post(
        `${BASE_URL}/projects/${activeProject}/assistant/autocheck?env=${environment}`,
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
      const response = await axios.get(`${testDomain.replace("https://", "http://")}:1234/code/package.json`, {
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
      }

      const response = await axios.get(`${testDomain.replace("https://", "http://")}:1234/${path}`, {
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
    getFermatJwt
  };
}
