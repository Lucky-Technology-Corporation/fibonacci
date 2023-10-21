import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from '@Store'
import useDatabaseApi from "./DatabaseAPI";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useTestApi() {
  const authHeader = useAuthHeader();
  const {
    getDocuments: getTests,
    createDocument: createTest,
    updateDocument: updateTest,
    deleteDocument: deleteTest,
  } = useDatabaseApi();

  const { testDomain, activeProject, activeEndpoint, environment } = useContext(SwizzleContext);
  const activeCollection = "_swizzle_usertests";

  const runTest = async (testDoc) => {
      if (!activeEndpoint) {
        console.error("No active project selected");
        return;
      }

      let jwtToken;
      if (testDoc.userId !== undefined && testDoc.userId !== "") {
        const response = await axios.get(
          `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/testing/spoofJwt?env=${environment}&user_id=${testDoc.userId}`,
          {
            headers: {
              Authorization: authHeader(),
            },
          }
        );
        jwtToken = `Bearer ${response.data.jwt}`;
      }

      const method = activeEndpoint.split("/")[0].toUpperCase();
      const endpointPath = "/" + activeEndpoint.split("/")[1]
      const url = `${testDomain.replace("https://", "https://api.")}${endpointPath}?${testDoc.queryParametersString}`;
      const body = testDoc.body;

      return await execTest(url, method, body, jwtToken);
  };

  const runAllTests = async () => {
    try {
      if (!activeEndpoint) {
        throw new Error("No active endpoint selected");
      }

      const allTests = await getTests(activeCollection, -1, 20, "", "asc", activeEndpoint);

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

  const execTest = async (url, method, body, token) => {
    try {
      const headers = token ? { Authorization: token } : undefined;
      const response = await axios.request({
        url, 
        method: method.toLowerCase(), 
        headers, 
        data: body
      });
      return response;
    } catch (error) {
      console.log(`Error running ${method} test:`, error);
      throw error;
    }
  };

  return { getTests, updateTest, createTest, deleteTest, runTest, runAllTests };
}
