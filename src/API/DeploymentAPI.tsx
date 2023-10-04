import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { useContext } from "react";

const BASE_URL = process.env.BASE_URL;

export default function useApi() {
  const authHeader = useAuthHeader();
  const { activeProject, environment } = useContext(SwizzleContext);

  const listProjectBuilds = async (page, pageSize) => {
    if (activeProject == "") return;
    const response = await axios.get(
      `${BASE_URL}/projects/${activeProject}/build/list?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          Authorization: authHeader(),
        },
      },
    );
    console.log("List project builds is: " + response);
    return response.data;
  };

  return {
    listProjectBuilds,
  };
}
