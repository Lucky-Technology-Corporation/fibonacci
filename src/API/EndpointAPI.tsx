import axios from "axios";
import { useContext, useEffect } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import jwt_decode from "jwt-decode";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { testDomain, activeEndpoint, environment, activeProject, setFermatJwt, fermatJwt } = useContext(SwizzleContext);

  const npmSearch = async (query: string) => {
    const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${query}&size=10`);
    return response.data.objects;
  };

  useEffect(() =>{
    setFermatJwt("")
  }, [activeProject])

  const exchangeJwt = async () => {
    try {
      const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/fermat/jwt`, {
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
      const response = await axios.get(`${testDomain.replace("https://", "https://fermat.")}/code/file_contents?path=code/${fileName}`, {
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

  const askQuestion = async (userQuery: string, aiCommand: string) => {
    try {
      const fileName = activeEndpoint.replace(/\//g, "-").replace(/:/g, "_");

      var body = {}
      if(aiCommand == "ask"){
        body = {
          question_type: "edit",
          user_query: userQuery,
          fermat_domain: testDomain.replace("https://", "http://"),
          fermat_jwt: await getFermatJwt(),
          current_file: "user-dependencies/" + fileName + ".js",
        }
      } else if(aiCommand == "edit"){
        body = {
          question_type: "code",
          user_query: userQuery,
          fermat_domain: testDomain.replace("https://", "http://"),
          fermat_jwt: await getFermatJwt(),
          current_file: "user-dependencies/" + fileName + ".js",
        }
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


  // const getAIResponseToFile = async (userQuery: string, aiAction: string) => {
  //   //TODO: pull in code from imported files
  //   //TODO: split files into chunks an summarize long functions
  //   try {
  //     const fileName = activeEndpoint.replace(/\//g, "-");
  //     const fileContents = await getFile("user-dependencies/" + fileName + ".js");

  //     const response = await axios.post(
  //       `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/file?env=${environment}`,
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
    getFermatJwt
  };
}
