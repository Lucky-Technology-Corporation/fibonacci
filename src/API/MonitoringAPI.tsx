import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const BASE_URL = process.env.BASE_URL

export default function useApi() {
   const authHeader = useAuthHeader();
   const { activeProject } = useContext(SwizzleContext);

   const getData = async (startDate: string, endDate: string) => {
      try {
         if (!activeProject) {
            throw new Error("No active project selected");
         }
         const body = {
            start: startDate,
            end: endDate,
         };

         const response = await axios.post(
            `${BASE_URL}/projects/${activeProject}/monitoring`,
            body,
            {
               headers: {
                  Authorization: authHeader(),
               },
            },
         );
         return response.data;
      } catch (e) {
         console.log(e);
      }
   };

   const getLogs = async (offset: number) => {
      try{
         if(!activeProject){
            throw new Error("No active project selected");
         }
         const response = await axios.get(
            `${BASE_URL}/projects/${activeProject}/monitoring/logs?offset=${offset}&limit=20`,
            {
               headers: {
                  Authorization: authHeader(),
               },
            },
         );
         return response.data;
      } catch (e) {  
         console.log(e);
      }
   }

   const getLogDetails = async (requestId: string) => {
      try{
         if(!activeProject){
            throw new Error("No active project selected");
         }
         const response = await axios.get(
            `${BASE_URL}/projects/${activeProject}/monitoring/logs/${requestId}`,
            {
               headers: {
                  Authorization: authHeader(),
               },
            },
         );
         return response.data;
      } catch (e){
         console.log(e);
      }
   }  

   return {
      getData,
      getLogs,
      getLogDetails
   };
}
