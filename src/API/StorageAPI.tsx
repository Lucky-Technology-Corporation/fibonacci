import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const BASE_URL = process.env.BASE_URL;

export default function useStorageApi() {
  const authHeader = useAuthHeader();
  const { activeProject, environment } = useContext(SwizzleContext);

  const uploadFile = async (file: any) => {
    try {
      if (activeProject == null || activeProject == "") {
        console.error("No active project");
        return null;
      }
      const fileName = file.name;
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${BASE_URL}/projects/${activeProject}/${environment}/storage/public/${fileName}`,
        formData,
        {
          headers: {
            Authorization: authHeader(),
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading the file:", error);
      return null;
    }
  };

  const deleteFile = async (fileName: string) => {
    try {
      if (activeProject == null || activeProject == "") {
        console.error("No active project");
        return null;
      }
      const response = await axios.delete(
        `${BASE_URL}/projects/${activeProject}/${environment}/storage/public/${fileName}`,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading the file:", error);
      return null;
    }
  };

  return { uploadFile, deleteFile };
}
