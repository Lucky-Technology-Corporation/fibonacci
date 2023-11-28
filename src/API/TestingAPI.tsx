import axios, { Method } from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { QueryParams, TestType } from "../RightSidebar/TestWindow/TestWindow";
import { ParsedActiveEndpoint } from "../Utilities/ActiveEndpointHelper";
import { SwizzleContext } from "../Utilities/GlobalContext";
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

  const { testDomain, prodDomain, activeProject, activeEndpoint, environment } = useContext(SwizzleContext);
  const activeCollection = "_swizzle_usertests";

  const runTest = async (testDoc: TestType) => {
    if (!activeEndpoint) {
      console.error("No active project selected");
      return;
    }

    let jwtToken;
    if (testDoc.userId !== undefined && testDoc.userId !== "") {
      const response = await axios.get(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/testing/spoofJwt?env=${environment}&user_id=${testDoc.userId}`,
        {
          headers: { "swizzle-test": "true", ...testDoc.headers },
          withCredentials: true,
        },
      );
      jwtToken = `Bearer ${response.data.jwt}`;
    }

    const endpoint = new ParsedActiveEndpoint(activeEndpoint);
    // TODO: Get params from input
    var domainToUse = environment == "test" ? testDomain : prodDomain
    const url = `${domainToUse.replace("https://", "https://api.")}${endpoint.getEndpointWithParams(
      testDoc.pathParams,
    )}`;
    const body = testDoc.body;
    return await execTest(url, endpoint.method as Method, testDoc.queryParams, testDoc.headers, body, jwtToken);
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

  const execTest = async (url: string, method: Method, params: QueryParams, headerInput: QueryParams, body?: object, token?: string) => {
    try {
      // console.debug(
      //   `Exec test with URL = ${url}, method = ${method}, params = ${params}, body = ${body}, token = ${token}`,
      // );
      const headers = token ? { Authorization: token, "swizzle-test": "true", ...headerInput } : { "swizzle-test": "true", ...headerInput };
      const response = await axios.request({
        url,
        method,
        headers,
        data: body,
        params,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  return { getTests, updateTest, createTest, deleteTest, runTest, runAllTests };
}
