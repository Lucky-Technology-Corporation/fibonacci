import axios from "axios";
import { useContext } from "react";
import { useAuthHeader, useSignOut } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import useEndpointApi from "./EndpointAPI";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useSettingsApi() {
  const authHeader = useAuthHeader();
  const signOut = useSignOut();
  const { environment, activeProject } = useContext(SwizzleContext);
  const endpointApi = useEndpointApi();

  const checkIfAccountNeedsEmail = async () => {
    try {
      const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/login/email`, {
        withCredentials: true,
      });
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const addEmailToAccount = async (email: string, projectType?: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/login/email`,
        {
          email: email,
          project_type: projectType,
        },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e: any) {
      if (e.response.status == 401) {
        signOut();
        const urlParams = new URLSearchParams(window.location.search);
        const signedIn = urlParams.get("signed_in");
        if (signedIn && signedIn.length > 0) {
          location.href = "/";
        }
      }
      console.error(e);
      return null;
    }
  };

  const updateBilling = async (should_override: boolean = false) => {
    var override_to_payment_method_update = should_override ? "true" : "false";
    try {
      const response = await axios.get(
        `${NEXT_PUBLIC_BASE_URL}/billing?override_to_payment_method_update=${override_to_payment_method_update}`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const response = await axios.delete(`${NEXT_PUBLIC_BASE_URL}/projects/${projectId}`, {
        withCredentials: true,
      });
      if(response.status != 200) {
        throw new Error("Failed to delete project");
      }
      return response.data;
    } catch (e: any) {
      console.error(e);
      throw new Error("Failed to delete project");
    }
  };

  const updateApns = async (p8Key: string, key_id: string, team_id: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/setNotificationKeys?env=${environment}`,
        { p8_key_base64: p8Key, key_id: key_id, developer_id: team_id },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const parseFrontendEnv = (frontendEnv: string) => {
    try{
      const index = frontendEnv.indexOf("{")
      var stringifiedObject = frontendEnv.substring(index)
      stringifiedObject = stringifiedObject.split("module.exports")[0]
      const javascriptObject = (new Function(`return (${stringifiedObject});`))();
      return javascriptObject
    } catch(e){
      console.error("Misformatted webpack config", e)
    }
  }

  function mergeFrontendEnv(secretsObject, frontendEnv) {
      try{
        var mergedFrontendEnv = {...frontendEnv}
        Object.keys(secretsObject.test).forEach((key) => {
          if(secretsObject.test[key] != null && secretsObject.test[key] != ""){
            mergedFrontendEnv.test[key] = secretsObject.test[key]
          }
        })
        Object.keys(secretsObject.prod).forEach((key) => {
          if(secretsObject.prod[key] != null && secretsObject.prod[key] != ""){
            mergedFrontendEnv.prod[key] = secretsObject.prod[key]
          }
        })

        return mergedFrontendEnv
      } catch(e){
        console.error("Failed to merge frontend env", e)
      }
  }

  const getSecrets = async (location: string) => {
    try {
      if (activeProject == null || activeProject == "") {
        return null;
      }
      if(location == "backend"){
        const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/secrets?env=${environment}`, {
          withCredentials: true,
        });
        return response.data;
      } else if(location == "frontend"){
        const frontendEnv = await endpointApi.getFile("frontend/frontendEnv.js");
        return parseFrontendEnv(frontendEnv)
      }
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const saveSecrets = async (location: string, newSecrets: any) => {
    console.log("save", location, newSecrets)
    try {
      if (activeProject == null) {
        return null;
      }
      if(location == "backend"){
        const response = await axios.patch(
          `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/secrets?env=${environment}`,
          newSecrets,
          {
            withCredentials: true,
          },
        );
        endpointApi.restartBackend();
        return response.data;
      } else if(location == "frontend"){
        const frontendEnv = await endpointApi.getFile("frontend/frontendEnv.js");
        const frontendEnvObject = parseFrontendEnv(frontendEnv)
        const newFrontendEnv = mergeFrontendEnv(newSecrets, frontendEnvObject)
        const newFrontendEnvFile = "var frontendEnv = " + JSON.stringify(newFrontendEnv, null, 2) + "\nmodule.exports = { frontendEnv }"
        console.log("writing", newFrontendEnvFile)
        await endpointApi.writeFile("frontend/frontendEnv.js", newFrontendEnvFile);
      }
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const deleteSecret = async (location: string, secretName: string) => {
    try {
      if (activeProject == null) {
        return null;
      }
      if(location == "backend"){
        const response = await axios.delete(
          `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/secrets/${secretName}?env=${environment}`,
          {
            withCredentials: true,
          },
        );
        endpointApi.restartBackend();
        return response.data;
      } else if(location == "frontend"){
        const frontendEnv = await endpointApi.getFile("frontend/frontendEnv.js");
        var frontendEnvObject = parseFrontendEnv(frontendEnv)
        console.log(frontendEnvObject.prod[secretName])
        console.log(frontendEnvObject.test[secretName])
        console.log(frontendEnvObject.test)
        console.log(frontendEnvObject.prod)

        delete frontendEnvObject.test[secretName]
        delete frontendEnvObject.prod[secretName]
        const newFrontendEnvFile = "var frontendEnv = " + JSON.stringify(frontendEnvObject, null, 2) + "\nmodule.exports = { frontendEnv }"
        await endpointApi.writeFile("frontend/frontendEnv.js", newFrontendEnvFile);
      }
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const updatePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/billing?payment_method_id=${paymentMethodId}`,
        {},
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const hasAddedPaymentMethod = async () => {
    try {
      const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/billing`, {
        withCredentials: true,
      });
      return response.data.hasPaymentMethod;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  };

  const pingProjectActive = async () => {
    if (activeProject == null || activeProject == "") {
      return false;
    }
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/active?env=${environment}`,
        {},
        {
          withCredentials: true,
        },
      );
      return true;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  };

  return {
    updateApns,
    getSecrets,
    saveSecrets,
    deleteSecret,
    updateBilling,
    updatePaymentMethod,
    hasAddedPaymentMethod,
    deleteProject,
    addEmailToAccount,
    checkIfAccountNeedsEmail,
    pingProjectActive,
  };
}
