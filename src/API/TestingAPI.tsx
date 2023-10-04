import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";
import useApi from "./DatabaseAPI";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useTestApi() {
  const authHeader = useAuthHeader();
  const {
    getDocuments: getTests,
    createDocument: createTest,
    updateDocument: updateTest,
    deleteDocument: deleteTest,
  } = useApi();

  const { testDomain, activeProject, activeEndpoint, environment } = useContext(SwizzleContext);
  const NEXT_PUBLIC_BASE_URL_USER = testDomain.replace("https://", "https://runner.");
  const activeCollection = "_swizzle_usertests";

  const runTest = async (testDoc) => {
    try {
      if (!activeEndpoint) {
        console.error("No active project selected");
        return;
      }

      const response = await axios.get(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/testing/spoofJwt?env=${environment}&user_id=${testDoc.userId}`,
        {
          headers: {
            Authorization: authHeader(),
          },
        },
      );

      const jwtToken = response.data.jwt;

      const method = activeEndpoint.split("/")[0].toUpperCase();
      const header = `Bearer ${jwtToken}`;
      const endpointPath = "/" + activeEndpoint.split("/")[1];
      const url = `${NEXT_PUBLIC_BASE_URL_USER}${endpointPath}?${testDoc.queryParametersString}`;
      const body = testDoc.body;

      switch (method) {
        case "GET":
          return await getFunctionTest(url, header, body);

        case "POST":
          return await postFunctionTest(url, header, body);

        case "PUT":
          return await putFunctionTest(url, header, body);

        case "DELETE":
          return await deleteFunctionTest(url, header, body);

        default:
          console.error("Unsupported method:", method);
          throw new Error("Unsupported method: " + method);
      }
    } catch (error) {
      console.error("Error running test:", error);
      return null;
    }
  };

  const runAllTests = async () => {
    try {
      if (!activeEndpoint) {
        throw new Error("No active endpoint selected");
      }

      const allTests = await useApi().getDocuments(activeCollection, -1, 20, "", "asc", activeEndpoint);

      const responses = [];
      for (const testDoc of allTests) {
        const response = await runTest(testDoc);
        responses.push(response);
      }

      return responses;
    } catch (error) {
      console.error("Error running all tests:", error);
      return null;
    }
  };

  const getFunctionTest = async (url, header, body) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: header,
        },
        data: body,
      });
      return response;
    } catch (error) {
      console.error("Error running GET test:", error);
      return null;
    }
  };

  const postFunctionTest = async (url, header, body) => {
    try {
      const response = await axios.post(url, {
        headers: {
          Authorization: header,
        },
        data: body,
      });
      return response;
    } catch (error) {
      console.error("Error running POST test:", error);
      return null;
    }
  };

  const putFunctionTest = async (url, header, body) => {
    try {
      const response = await axios.put(url, {
        headers: {
          Authorization: header,
        },
        data: body,
      });
      return response;
    } catch (error) {
      console.error("Error running PUT test:", error);
      return null;
    }
  };

  const deleteFunctionTest = async (url, header, body) => {
    try {
      const response = await axios.delete(url, {
        headers: {
          Authorization: header,
        },
        data: body,
      });
      return response;
    } catch (error) {
      console.error("Error running DELETE test:", error);
      return null;
    }
  };

  return { getTests, updateTest, createTest, deleteTest, runTest, runAllTests };
}
