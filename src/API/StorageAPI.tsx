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
      if (!activeProject) {
        throw new Error("No active project selected");
      }
      const fileName = file.name;
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${BASE_URL}/projects/${activeProject}/${environment}/storage/public/${fileName}`, //TODO: change this
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
      throw error; // If you want to re-throw the error to the calling function
    }
  };

  return { uploadFile };
}
