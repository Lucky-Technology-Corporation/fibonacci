import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const BASE_URL = process.env.BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { activeProject, environment } = useContext(SwizzleContext);

  const getData = async (startDate: string, endDate: string) => {
    try {
      if (!activeProject) {
        return;
      }
      const body = {
        start: startDate,
        end: endDate,
      };

      const response = await axios.post(`${BASE_URL}/projects/${activeProject}/monitoring?env=${environment}`, body, {
        headers: {
          Authorization: authHeader(),
        },
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  };

  const analyzeError = async (message: any) => {
    return ""
  }

  const getLogs = async (offset: number, filterKey?: string, filterQuery?: string, pageToken?: string) => {
    try {
      if (!activeProject) {
        console.error("No active project selected");
        return
      }

      var unwrapResults = false

      var url = `${BASE_URL}/projects/${activeProject}/monitoring/logs?env=${environment}&offset=${offset}&limit=20`;
      if (filterKey && filterQuery) {
        if (filterKey == "log") {
          unwrapResults = true
          url = `${BASE_URL}/projects/${activeProject}/monitoring/logs/search?env=${environment}&search_string=${filterQuery}${
            pageToken ? `&page_token=${pageToken}` : ""
          }`;
        } else {
          url += `&filter_key=${filterKey}&filter_query=${filterQuery}`;
        }
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader(),
        },
      });

      if(unwrapResults){
        return response.data.results
      }

      return response.data;
    } catch (e) {
      console.error(e);
    }
  };

  const searchLogs = async (query: string) => {};

  const getLogDetails = async (requestId: string) => {
    try {
      if (!activeProject) {
        console.error("No active project selected");
        return
      }
      const response = await axios.get(
        `${BASE_URL}/projects/${activeProject}/monitoring/logs/${requestId}?env=${environment}`,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
    }
  };

  return {
    getData,
    getLogs,
    getLogDetails,
    analyzeError,
  };
}
