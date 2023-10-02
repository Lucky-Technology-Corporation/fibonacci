import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/storage/public/${fileName}?env=${environment}`,
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
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/storage/public/${fileName}?env=${environment}`,
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
