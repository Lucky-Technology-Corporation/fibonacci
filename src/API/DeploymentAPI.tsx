import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import useEndpointApi from "../API/EndpointAPI";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export type ProjectDeploymentStatus =
  | "NOT_DEPLOYED"
  | "DEPLOYMENT_IN_PROGRESS"
  | "DEPLOYMENT_SUCCESS"
  | "DEPLOYMENT_FAILURE"
  | "DEPLOYMENT_SUSPENDED"
  | "DEPLOYMENT_SUSPENSION_IN_PROGRESS"
  | "DEPLOYMENT_SUSPENSION_FAILURE"
  | "DEPLOYMENT_RESTORE_IN_PROGRESS"
  | "DEPLOYMENT_RESTORE_FAILURE";

export type GetProjectDeploymentStatusResponse = {
  deployment_status: ProjectDeploymentStatus;
};

export default function useDeploymentApi() {
  const authHeader = useAuthHeader();
  const { getFermatJwt } = useEndpointApi();

  const { activeProject, environment, setTestDeployStatus, setProdDeployStatus, testDomain } =
    useContext(SwizzleContext);

  const listProjectBuilds = async (page, pageSize) => {
    if (activeProject == "") return;
    const response = await axios.get(
      `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/build/list?page=${page}&page_size=${pageSize}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  };

  const getProjectDeploymentStatus = async (projectId, env = environment) => {
    var enviro = env ? env : environment;
    const response = await axios.get<GetProjectDeploymentStatusResponse>(
      `${NEXT_PUBLIC_BASE_URL}/projects/${projectId}/deploymentStatus?env=${enviro}`,
      {
        withCredentials: true,
      },
    );
    if (env == "test") {
      setTestDeployStatus(response.data.deployment_status);
    } else if (env == "prod") {
      setProdDeployStatus(response.data.deployment_status);
    }
    return response.data.deployment_status;
  };

  const updatePackage = async (packages: string[], action: "install" | "remove", location: "frontend" | "backend") => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.post(
        `${testDomain.replace("https://", "https://fermat.")}/npm/${action}?path=${location}`,
        {
          packages: packages,
        },
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      console.log("updatePackage", packages, action, location, response.data);
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const restoreProject = async (projectId: string) => {
    const response = await axios.get<GetProjectDeploymentStatusResponse>(
      `${NEXT_PUBLIC_BASE_URL}/projects/${projectId}/restore`,
      {
        withCredentials: true,
      },
    );
    return response.data.deployment_status;
  };

  return {
    listProjectBuilds,
    getProjectDeploymentStatus,
    updatePackage,
    restoreProject,
  };
}
