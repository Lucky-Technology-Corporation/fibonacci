import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { useContext } from "react";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { activeProject, environment } = useContext(SwizzleContext);

  const listProjectBuilds = async (page, pageSize) => {
    if (activeProject == "") return;
    const response = await axios.get(
      `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/build/list?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          Authorization: authHeader(),
        },
      },
    );
    return response.data;
  };

  const getProjectDeploymentStatus = async (projectId) => {
    const response = await axios.get(
      `${NEXT_PUBLIC_BASE_URL}/projects/${projectId}/deploymentStatus?env=${environment}`,
      {
        headers: {
          Authorization: authHeader(),
        },
      },
    );
    console.log("Get Project Deployment Status" + response.data.deployment_status)
    return response.data.deployment_status;
  }

  return {
    listProjectBuilds,
    getProjectDeploymentStatus,
  };
}
