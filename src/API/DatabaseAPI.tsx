import axios from "axios";
import { useContext } from "react";
import { useAuthHeader, useSignOut } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { ProjectDeploymentStatus } from "./DeploymentAPI";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export type ProjectResponse = {
  id: string;
  name: string;
  test_deployment_status: ProjectDeploymentStatus;
  prod_deployment_status: ProjectDeploymentStatus;
  test_public_storage_bucket?: string;
  prod_public_storage_bucket?: string;
  test_swizzle_domain?: string;
  prod_swizzle_domain?: string;
};

export default function useDatabaseApi() {
  const authHeader = useAuthHeader();
  const { activeProject, environment } = useContext(SwizzleContext);
  const signOut = useSignOut();

  const getCollections = async () => {
    if (activeProject == "") return;
    const response = await axios.get(
      `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections?env=${environment}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  };

  const getDocuments = async (
    activeCollection: string,
    page: number = -1,
    pageSize: number = 20,
    sortByKey: string = "",
    sortDirection: string = "asc",
    activeEndpoint: string = "",
  ) => {
    try {
      if (activeProject == "") return;
      if (activeCollection == "") return;
      var queryString = `?env=${environment}&`;
      if (page !== -1) {
        queryString += `page=${page}&page_size=${pageSize}`;
      }
      if (sortByKey !== "") {
        queryString += `&sort=${sortByKey}&sort_direction=${sortDirection}`;
      }
      if (activeEndpoint !== "") {
        queryString += `&active_endpoint=${activeEndpoint}`;
      }

      const response = await axios.get(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections/${activeCollection}${queryString}`,
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

  const updateDocument = async (activeCollection: string, id: string, data: any) => {
    var newDocument = data;
    delete newDocument._id;
    if (activeProject == "") return;
    if (activeCollection == "") return;
    try {
      const response = await axios.patch(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections/${activeCollection}/${id}?env=${environment}`,
        { document: data },
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

  const createUser = async (email: string, password: string, fullName: string) => {
    try {
      if (activeProject == "") return;
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/user?env=${environment}`,
        { email, password, fullName },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e: any) {
      console.error(e);
      throw e
    }
  }

  const createDocument = async (activeCollection: string, data: any) => {
    var newDocument = data;
    delete newDocument._id;
    try {
      if (activeProject == "") return;
      if (activeCollection == "") return;
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections/${activeCollection}?env=${environment}`,
        { documents: [newDocument] },
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

  const deleteDocument = async (activeCollection: string, id: string) => {
    try {
      if (activeProject == "") return;
      if (activeCollection == "") return;
      const response = await axios.delete(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections/${activeCollection}/${id}?env=${environment}`,
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

  const createCollection = async (name: string) => {
    try {
      if (activeProject == "") return;
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections?env=${environment}`,
        { name: name },
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

  const deleteCollection = async (name: string) => {
    try {
      if (activeProject == "") return;
      const response = await axios.delete(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections/${name}?env=${environment}`,
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

  // const runEnglishSearchQuery = async (query: string, exampleDoc: string) => {
  //   try {
  //     const response = await axios.post(
  //       `${NEXT_PUBLIC_BASE_URL}/ai`,
  //       {
  //         english_description: query,
  //         example_doc: exampleDoc,
  //       },
  //       {
  //         headers: {
  //           Authorization: authHeader(),
  //         },
  //       },
  //     );
  //     return response.data;
  //   } catch (e: any) {
  //     console.error(e);
  //     return null;
  //   }
  // };

  const runMongoQuery = async (query: string, collectionName: string) => {
    if (activeProject == "") return;
    var url = `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections/${collectionName}/mongo?env=${environment}`;
    try {
      const response = await axios.post(
        url,
        {
          query: query,
        },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e: any) {
      if (e.response && e.response.status == 400) {
        //error is e.response.data.message
      }
      console.error(e);
      throw e.response.data;
    }
  };

  const runQuery = async (
    query: string,
    search_filter: string,
    collectionName: string,
    sortByKey: string = "",
    sortDirection: string = "asc",
    page: number = 0,
  ) => {
    try {
      if (activeProject == "") return;
      var queryObject = {
        query: query,
        search_filter: search_filter,
        page: page,
      };
      if (sortByKey !== "") {
        queryObject["sort"] = sortByKey;
      }
      if (sortDirection !== "") {
        queryObject["sort_direction"] = sortDirection;
      }

      var url = `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections/${collectionName}/search?env=${environment}`;

      const response = await axios.post(url, queryObject, {
        withCredentials: true,
      });
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const createProject = async (name: string) => {
    // var shouldDeployProd = true;
    // if (NEXT_PUBLIC_BASE_URL == "https://api.swizzle-internal.com/api/v1" || name.includes("dev")) {
    //   shouldDeployProd = false;
    // }

    await axios.post(
      `${NEXT_PUBLIC_BASE_URL}/projects`,
      { name, deploy_production: true },
      {
        withCredentials: true,
      },
    );

    return true;
  };

  const getProjects = async (): Promise<ProjectResponse[] | null> => {
    try {
      const response = await axios.get<ProjectResponse[]>(`${NEXT_PUBLIC_BASE_URL}/projects`, {
        withCredentials: true,
      });
      return response.data;
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status == 401) {
        console.log("signing out")
        signOut();
        const urlParams = new URLSearchParams(window.location.search);
        const signedIn = urlParams.get("signed_in");
        if (signedIn && signedIn.length > 0) {
          location.href = "/";
        }
      }
      return null;
    }
  };

  return {
    getDocuments,
    updateDocument,
    createProject,
    getProjects,
    getCollections,
    deleteDocument,
    createCollection,
    createDocument,
    deleteCollection,
    runQuery,
    runMongoQuery,
    createUser
  };
}
