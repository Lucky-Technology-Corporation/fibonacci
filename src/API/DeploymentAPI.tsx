import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from '@Store';

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { activeProject, environment, setTestDeployStatus, setProdDeployStatus } = useContext(SwizzleContext);

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

  const getProjectDeploymentStatus = async (projectId, env = environment) => {
    var enviro = env ? env : environment;
    const response = await axios.get(
      `${NEXT_PUBLIC_BASE_URL}/projects/${projectId}/deploymentStatus?env=${enviro}`,
      {
        headers: {
          Authorization: authHeader(),
        },
      },
    );
    if(env == 'test'){
      setTestDeployStatus(response.data.deployment_status);
    } else if(env == 'prod'){
      setProdDeployStatus(response.data.deployment_status);
    }
    return response.data.deployment_status;
  };

  return {
    listProjectBuilds,
    getProjectDeploymentStatus,
  };
}
