import axios from "axios";
import { useContext } from "react";
import { SwizzleContext } from "../Utilities/GlobalContext";
import useEndpointApi from "./EndpointAPI";

export default function useFilesystemApi(){

  const endpointApi = useEndpointApi()
  const { activeProject } = useContext(SwizzleContext)
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const createNewPage = async (relativePagePath: string, authRequired: boolean, fallbackPath: string) => {
    try {
      if(!authRequired){
        fallbackPath = ""
      }

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/frontend/page`,
        {
          name: relativePagePath,
          unauthenticated_fallback: fallbackPath,
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
  }

  const createNewComponent = async (relativeComponentPath: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/frontend/component`,
        {
          name: relativeComponentPath,
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
  }

  const createNewHelper = async (relativeHelperPath: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/helper`,
        {
          name: relativeHelperPath,
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
  }

  const createNewEndpoint = async (relativeEndpointPath: string, method: string, authRequired: boolean) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/endpoint`,
        {
          endpoint: relativeEndpointPath,
          http_method: method,
          auth_required: authRequired,
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
  }

  const removeAuthFromPage = async (page: string) => {
    var path = page
    const routeListTsx = await endpointApi.getFile("frontend/src/RouteList.tsx")

    if (routeListTsx) {
      var content = routeListTsx

      //Find old route to remove
      const routeToRemoveRegex = new RegExp(
          `<SwizzleRoute path="${page.replace("/", "\/")}".*>`,
          "g",
      );

      //Build new route
      if(path.startsWith("/")){
        path = path.substring(1)
      }
      const componentName = path
        .replace(/\//g, "_")
        .replace(".tsx", "")
        .replace(".ts", "")
        .replace(/\./g, "_")
        .replace(/^(.)/, (match, p1) => p1.toUpperCase())
        .replace(/_([a-z])/g, (match, p1) => "_" + p1.toUpperCase());

      const newRoute = `<SwizzleRoute path="${page}" element={<${componentName} />} />`;

      //Swap them
      content = content.replace(routeToRemoveRegex, newRoute);

      await endpointApi.writeFile("frontend/src/RouteList.tsx", content)
    }
  }

  const deleteEndpoint = async (method: string, path: string) => {
    try {
      await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/endpoint/delete`,
          {
            path: path,
            method: method,
          },
          {
            withCredentials: true,
          },
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  const deleteHelper = async (helper: string) => {
    try {
      await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/helper/delete`,
          {
            path: helper,
          },
          {
            withCredentials: true,
          },
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  const deletePage = async (page: string) => {
    try {
      await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/frontend/page/delete`,
          {
            path: page,
          },
          {
            withCredentials: true,
          },
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  
  const deleteComponent = async (component: string) => {
    try {
      await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/frontend/component/delete`,
          {
            path: component,
          },
          {
            withCredentials: true,
          },
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }


  return {
    // createNewFile,
    // removeFile,
    removeAuthFromPage,
    createNewPage,
    createNewComponent,
    createNewHelper,
    createNewEndpoint,
    deleteEndpoint,
    deleteHelper,
    deletePage,
    deleteComponent,
  }

}