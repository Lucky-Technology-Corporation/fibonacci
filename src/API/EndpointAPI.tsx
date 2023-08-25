import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

// const zlib = require('zlib');

const BASE_URL = process.env.BASE_RUL

export default function useApi() {
   const authHeader = useAuthHeader();
   const { domain } = useContext(SwizzleContext);

   const getFiles = async () => {
      // console.log(domain)
      // const response = await axios.get(`http://146.190.138.216:3000/code`, {
      //     headers: {
      //         Authorization: authHeader(),
      //     },
      // })
      // return response.data;
   };

   const createAPI = async (apiName: string) => {
      return true;
   };

   const updateEndpoint = async (endpointName: string, code: string) => {
      return true;
   };

   return { createAPI, updateEndpoint, getFiles };
}
