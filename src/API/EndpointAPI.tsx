import axios from 'axios';
import {useAuthHeader} from 'react-auth-kit'

// const zlib = require('zlib');

// const BASE_URL = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1';
// const BASE_URL = 'http://localhost:4000/api/v1'

export default function useApi() {
    const authHeader = useAuthHeader();

    const createAPI = async (apiName: string) => {
       return true
    };
    
    const updateEndpoint = async (endpointName: string, code: string) => {
        return true
        // const zippedCode = await zlib.gzip(code)

        // const projectId = localStorage.getItem("projectId");
        // if(!projectId) throw new Error("No project id");

        // const response = await axios.post(`DEV_SERVER_API_ENDPOINT/${endpointName}`, zippedCode, {
        //     headers: {
        //         Authorization: authHeader(), 
        //         'Content-Encoding': 'gzip'
        //     },
        // });

        // return response.data;
    }
  
    return { createAPI, updateEndpoint };
}

