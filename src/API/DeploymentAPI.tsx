import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { useContext } from "react";

const BASE_URL = process.env.BASE_URL;

export default function useApi() {
    const authHeader = useAuthHeader();
    const { activeProject, environment } = useContext(SwizzleContext);

    const getDeploymentStatus = async () => {
        if (activeProject == "") return;
        const response = await axios.get(`${BASE_URL}/projects/${activeProject}/deploymentStaus?env=${environment}`, {
            headers: {
              Authorization: authHeader(),
            },
          });
          console.log("Deploy api response is: " + response);
          return response;
    };

    return {
        getDeploymentStatus,
    }
}