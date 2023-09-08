import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import useApi from "./DatabaseAPI";

const BASE_URL =process.env.BASE_URL;

export default function useTestApi() {
    const authHeader = useAuthHeader();
    const { 
        getDocuments: getTests, 
        createDocument: createTest, 
        updateDocument: updateTest,
        deleteDocument: deleteTest} = useApi();

    const { domain, activeProject, activeEndpoint, environment } = useContext(SwizzleContext);
    //const BASE_URL_USER = domain;
    const BASE_URL_USER = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1'
    const activeCollection  = "ddd";

    const runTest = async (testDoc) => {
        try {
            if (!activeEndpoint) {
                throw new Error("No active endppoint selected");
            }

            // const jwtSpoof = await axios.get(`${BASE_URL}/projects/7a5925d7-44ec-456c-83f4-29aad46dc871/testing/spoofJwt?user_id=1234`,
            // {
            //     headers: {
            //       Authorization: authHeader(),
            //     },
            //   })

            const jwtDataJSON = `{"jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTQyMTg3NjAsInVzZXJJZCI6IjEyMzQifQ.krMXfL62lyzkPwofeVd8WKgMkZw6zjs6wQ5oXZ7VKgE"}`;
            const jwtSpoof = JSON.parse(jwtDataJSON);
            const jwtToken = jwtSpoof.jwt;            
            const method = activeEndpoint.split("/")[0].toUpperCase();
            const header = `Bearer ${jwtToken}`
            const endpointPath = "/" + activeEndpoint.split("/")[1]
            const url = `${BASE_URL_USER}${endpointPath}?${testDoc.queryParametersString}`;
            const body = testDoc.body;
            console.log(header);
            console.log(url);

            switch(method) {
                case 'GET':
                    return await getFunctionTest(url, header, body);
                    
                case 'POST':
                    return await postFunctionTest(url, header, body);
                    
                case 'PUT':
                    return await putFunctionTest(url, header, body);
                    
                case 'DELETE':
                    return await deleteFunctionTest(url, header, body);
                    
                default:
                    console.error('Unsupported method:', method);
                    throw new Error('Unsupported method: ' + method);
            }            
       
        } catch (error) {
            console.error("Error running test:", error);
            throw error;
        }
    }

    const runAllTests = async () => {
        try {
            if (!activeEndpoint) {
                throw new Error("No active endpoint selected");
            }
    
            const allTests = await useApi().getDocuments("ddd");
            
            const responses = [];
            for (const testDoc of allTests) {
                const response = await runTest(testDoc);
                responses.push(response);
            }
    
            return responses; 
        } catch (error) {
            console.error("Error running all tests:", error);
            throw error;
        }
    }    

    const getFunctionTest = async (url, header, body) => {
        try {
            const response = await axios.get(
                url,
                {
                  headers: {
                    Authorization: header,
                  },
                  data: body,
                },
              ); 
            console.log(response)           
            return response;
        } catch (error) {
            console.error("Error running GET test:", error);
            throw error;
        }
    }

    const postFunctionTest = async (url, header, body) => {
        try {
            const response = await axios.post(
                url,
                {
                  headers: {
                    Authorization: header,
                  },
                  data: body,
                },
              );            
            return response;
        } catch (error) {
            console.error("Error running POST test:", error);
            throw error;
        }
    }

    const putFunctionTest = async (url, header, body) => {
        try {
            const response = await axios.put(
                url,
                {
                  headers: {
                    Authorization: header,
                  },
                  data: body,
                },
              );            
            return response;
        } catch (error) {
            console.error("Error running PUT test:", error);
            throw error;
        }
    }

    const deleteFunctionTest = async (url, header, body) => {
        try {
            const response = await axios.delete(
                url,
                {
                  headers: {
                    Authorization: header,
                  },
                  data: body,
                },
              );            
            return response;
        } catch (error) {
            console.error("Error running DELETE test:", error);
            throw error;
        }
    }

    return { getTests, updateTest, createTest, deleteTest, runTest, runAllTests };
}
