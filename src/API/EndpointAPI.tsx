import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

// const zlib = require('zlib');

const BASE_URL = process.env.BASE_RUL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { testDomain } = useContext(SwizzleContext);

  const npmSearch = async (query: string) => {
    const response = await axios.get(
      `https://registry.npmjs.com/-/v1/search?text=${query}&size=5`,
    );
    return response.data.objects;
  };

  const getPackageJson = async () => {
    try {
      if(testDomain == null || testDomain == undefined || testDomain == "") {return []};
      if(testDomain.includes("localhost")) {return []};
      const response = await axios.get(`${testDomain.replace("https", "http")}:1234/code/package.json`, {
          headers: {
              Authorization: authHeader(),
          },
      })
      return response.data;
    } catch(e) {
      console.log(e)
      return [];
    }
  };

  const getFiles = async () => {
    try{
      if(testDomain == null || testDomain == undefined || testDomain == "") {return []};
      if(testDomain.includes("localhost")) {return []};
      const response = await axios.get(`${testDomain.replace("https", "http")}:1234/table_of_contents`, {
          headers: {
              Authorization: authHeader(),
          },
      })
      return response.data;
    } catch(e) {
      console.log(e)
      return [];
    }
  };

  const createAPI = async (apiName: string) => {
    return true;
  };

  const updateEndpoint = async (endpointName: string, code: string) => {
    return true;
  };

  return { createAPI, updateEndpoint, getFiles, npmSearch, getPackageJson };
}
