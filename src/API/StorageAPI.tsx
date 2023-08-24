import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

//const BASE_URL = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1';
const BASE_URL = "http://localhost:4000/api/v1";

export default function useStorageApi() {
   const authHeader = useAuthHeader();
   const { domain } = useContext(SwizzleContext);

   const uploadFile = async (file: any) => {
      const fileName = file.name;
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
         `${BASE_URL}/storage/test/public/${fileName}`, //TODO: change this
         formData,
         {
            headers: {
               Authorization: authHeader(),
               "Content-Type": "multipart/form-data",
            },
         },
      );
      return response.data;
   };

   return { uploadFile };
}
