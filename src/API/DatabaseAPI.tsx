import axios from "axios";
import { useContext } from "react";
import { useAuthHeader, useSignOut } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useDatabaseApi() {
  const authHeader = useAuthHeader();
  const { activeProject, environment } = useContext(SwizzleContext);
  const signOut = useSignOut();

  const getCollections = async () => {
    if (activeProject == "") return;
    const response = await axios.get(
      `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/collections?env=${environment}`,
      {
        headers: {
          Authorization: authHeader(),
        },
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
          headers: {
            Authorization: authHeader(),
          },
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
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

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
          headers: {
            Authorization: authHeader(),
          },
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
          headers: {
            Authorization: authHeader(),
          },
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
          headers: {
            Authorization: authHeader(),
          },
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
          headers: {
            Authorization: authHeader(),
          },
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
        headers: {
          Authorization: authHeader(),
        },
      });
      return response.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const createProject = async (name: string) => {
    var shouldDeployProd = false;
    if (NEXT_PUBLIC_BASE_URL == "https://euler-i733tg4iuq-uc.a.run.app/api/v1" || name.includes("prod")) {
      shouldDeployProd = true;
    }
    axios.post(
      `${NEXT_PUBLIC_BASE_URL}/projects`,
      { name, deploy_production: shouldDeployProd },
      {
        headers: {
          Authorization: authHeader(),
        },
        timeout: 180000,
      },
    );
    
    //Reload after 5 seconds to start the polling flow
    return new Promise((resolve) => {
      setTimeout(() => {
        window.location.reload();
        resolve(true);
      }, 8000);
    });  
  };

  const getProjects = async () => {
    try {
      console.log(NEXT_PUBLIC_BASE_URL);
      const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects`, {
        headers: {
          Authorization: authHeader(),
        },
      });
      return response.data;
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status == 401) {
        signOut();
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
  };
}
