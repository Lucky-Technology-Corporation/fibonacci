import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { endpointToFilename } from "../Utilities/EndpointParser";
import { SwizzleContext } from "../Utilities/GlobalContext";
import useEndpointApi from "./EndpointAPI";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useMonitoringApi() {
  const authHeader = useAuthHeader();
  const { activeProject, environment, testDomain } = useContext(SwizzleContext);
  const { getFermatJwt } = useEndpointApi();

  const getData = async (startDate: string, endDate: string) => {
    try {
      if (!activeProject) {
        return;
      }
      const body = {
        start: startDate,
        end: endDate,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/monitoring?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
    }
  };

  const analyzeError = async (requestDetails: any) => {
    try {
      var currentFile = endpointToFilename(requestDetails.method.toLowerCase() + requestDetails.url)

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/ask?env=${environment}`,
        {
          question_type: "log",
          other_context: JSON.stringify(requestDetails),
          current_file: currentFile,
          fermat_domain: testDomain.replace("https://", "https://fermat."),
          fermat_jwt: await getFermatJwt(),
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
  };

  const getLogs = async (offset: number, filterKey?: string, filterQuery?: string, pageToken?: string) => {
    try {
      if (!activeProject) {
        return;
      }

      var unwrapResults = false;

      var url = `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/monitoring/logs?env=${environment}&offset=${offset}&limit=20`;
      if (filterKey && filterQuery) {
        if (filterKey == "log") {
          unwrapResults = true;
          url = `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/monitoring/logs/search?env=${environment}&search_string=${filterQuery}${
            pageToken ? `&page_token=${pageToken}` : ""
          }`;
        } else {
          url += `&filter_key=${filterKey}&filter_query=${filterQuery}`;
        }
      }

      const response = await axios.get(url, {
        withCredentials: true,
      });

      if (unwrapResults) {
        return response.data.results;
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
        return;
      }
      const response = await axios.get(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/monitoring/logs/${requestId}?env=${environment}`,
        {
          withCredentials: true,
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
