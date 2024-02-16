import axios from "axios";
import jwt_decode from "jwt-decode";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { toast } from "react-hot-toast";
import { formatPath, pathToFile } from "../Utilities/EndpointParser";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { Page } from "../Utilities/Page";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function useEndpointApi() {
  const authHeader = useAuthHeader();
  const {
    setFrontendRestarting,
    setSelectedTab,
    setActivePage,
    testDomain,
    setActiveEndpoint,
    setActiveFile,
    environment,
    activeProject,
    setFermatJwt,
    fermatJwt,
    openUri,
    fullEndpointList,
    taskQueue,
    setTaskQueue,
    shouldRefreshList,
    setShouldRefreshList,
  } = useContext(SwizzleContext);

  const npmSearch = async (query: string) => {
    const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${query}&size=10`);
    return response.data.objects;
  };

  const exchangeJwt = async (projectId: string) => {
    try {
      if (projectId == undefined || projectId == null || projectId == "") {
        projectId = activeProject;
      }
      if (projectId == undefined || projectId == null || projectId == "") {
        throw "No project id";
      }
      const response = await axios.get(`${NEXT_PUBLIC_BASE_URL}/projects/${projectId}/fermat/jwt`, {
        withCredentials: true,
      });

      const jwt = response.data.fermat_token;
      if (jwt == undefined || jwt == null || jwt == "") {
        return "";
      }

      setFermatJwt(jwt);
      return jwt;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const refreshFermatJwt = async (projectId: string) => {
    const jwt = await exchangeJwt(projectId);
    if (jwt == "") {
      return "";
    }
    setFermatJwt(jwt);
    return "Bearer " + jwt;
  };

  const getFermatJwt = async () => {
    if (fermatJwt == "") {
      return refreshFermatJwt(activeProject);
    }
    let decoded = jwt_decode(fermatJwt) as any;
    let exp = decoded.exp;
    let now = Date.now() / 1000;
    if (exp < now) {
      const jwt = await exchangeJwt(activeProject);
      if (jwt == "") {
        return "";
      }
      setFermatJwt(jwt);
      return "Bearer " + jwt;
    }

    return "Bearer " + fermatJwt;
  };

  const deploy = async () => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/build/release`,
        {},
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const getFile = async (fileName: string, testDomainInput?: string) => {
    var realTestDomain = null;
    if (testDomainInput != null) {
      realTestDomain = testDomainInput;
    } else {
      realTestDomain = testDomain;
    }

    try {
      if (realTestDomain == null || realTestDomain == undefined || realTestDomain == "") {
        return [];
      }
      if (realTestDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.get(
        `${realTestDomain.replace("https://", "https://fermat.")}/code/file_contents?path=code/${fileName}`,
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  //path starts at backend or frontend (e.g. "frontend/src/..."")
  const writeFile = async (path: string, content: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.post(
        `${testDomain.replace("https://", "https://fermat.")}/code/write_file`,
        {
          path: path,
          content: content,
        },
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

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
        `${testDomain.replace("https://", "https://fermat.")}/code/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
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


  const deleteFile = async (fileName: string, location: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return false;
      }

      var filePath = "";
      if (location == "backend") {
        filePath = "/backend/user-dependencies/" + fileName;
      } else if (location == "frontend") {
        filePath = "/frontend/src/" + fileName;
      } else if (location == "helpers") {
        filePath = "/backend/helpers/" + fileName;
      }

      const response = await axios.delete(
        `${testDomain.replace("https://", "https://fermat.")}/code/delete?path=code${filePath}`,
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const removeRouteFromList = async (path: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/serverts/delete`,
        {
          filename: path,
        },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const restartBackend = async () => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.post(
        `${testDomain.replace("https://", "https://fermat.")}/restart_backend`,
        {},
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const restartFrontend = async () => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      setFrontendRestarting(true);
      const response = await axios.post(
        `${testDomain.replace("https://", "https://fermat.")}/restart_frontend`,
        {},
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const promptDbHelper = async (userQuery: string, collection: string, history?: any[]) => {
    try {
      var body = {
        prompt: userQuery,
        collection: collection,
        history: history,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/db?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const promptAiEditor = async (
    userQuery: string,
    queryType: string,
    selectedText?: string,
    history?: any[],
    path?: string,
    fileErrors?: string,
  ) => {
    try {
      const filePath = path ? path : openUri.replace("/swizzle/code/", "");

      var body = {
        prompt: userQuery,
        fermat_domain: testDomain.replace("https://", "https://fermat."),
        fermat_jwt: await getFermatJwt(),
        path: filePath,
        conversation_id: "",
        query_type: queryType,
        selected_text: selectedText,
        history: history,
        error_message: fileErrors,
      };

      sessionStorage.setItem("ai" + activeProject + "_" + filePath + "_file", userQuery);

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/edit?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const promptSchemaPlanner = async (prompts: string[], tasks: any[]) => {
    try {
      var body = {
        prompts: prompts,
        backend_tasks: tasks,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/plan/schema?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const promptAiPlanner = async (userQuery: string, history?: any[]) => {
    try {
      var body = {
        prompt: userQuery,
        fermat_domain: testDomain.replace("https://", "https://fermat."),
        fermat_jwt: await getFermatJwt(),
        history: history,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/plan?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const promptAiTaskEdit = async (task: any, prompt: string) => {
    try {
      var body = {
        prompt: prompt,
        task: task,
      };

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/task_edit?env=${environment}`,
        body,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const aiTaskExecute = async (task: any, allTasks: any) => {
    try {
      var body = {
        task: task,
        full_task_summary: allTasks,
      };

      const response = await axios.post(`${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/execute`, body, {
        withCredentials: true,
      });
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const getCodeFromFigma = async (figmaUrl: string, language: string) => {
    const figmaFileId = figmaUrl.split("file/")[1].split("/")[0];
    const nodeId = figmaUrl.split("node-id=")[1].split("&")[0];
    const response = await axios.post(
      `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/figma?env=${environment}`,
      {
        figma_file_id: figmaFileId,
        figma_node_id: nodeId,
        language: language,
        fermat_domain: testDomain.replace("https://", "https://fermat."),
        fermat_jwt: await getFermatJwt(),
      },
      {
        withCredentials: true,
      },
    );

    return response.data;
  };

  const getAutocheckResponse = async (thisFilesErrors?: string) => {
    try {
      const fileName = openUri.replace("/swizzle/code/", "");
      const fileContents = await getFile(fileName);

      if (fileName.includes("frontend/src")) {
        const neededEndpoints = checkIfAllEndpointsExist(fileContents);
      }

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/autocheck?env=${environment}`,
        {
          file_contents: fileContents,
          path: fileName,
          diagnostics: thisFilesErrors,
        },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const getPackageJson = async (location: string) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }
      const response = await axios.get(
        `${testDomain.replace("https://", "https://fermat.")}/code/${location}/package.json`,
        {
          headers: {
            Authorization: await getFermatJwt(),
          },
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const getFiles = async (fileTypes) => {
    try {
      if (testDomain == null || testDomain == undefined || testDomain == "") {
        return [];
      }
      if (testDomain.includes("localhost")) {
        return [];
      }

      var path = "/backend/user-dependencies";
      if (fileTypes.toLowerCase() == "files") {
        path = "/frontend/src";
      } else if (fileTypes.toLowerCase() == "helpers") {
        path = "/backend/helpers";
      }

      const response = await axios.get(`${testDomain.replace("https://", "https://fermat.")}/code?path=${path}`, {
        headers: {
          Authorization: await getFermatJwt(),
        },
      });

      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const getSchema = async () => {
    try {
      const response = await axios.get(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/schema?env=${environment}`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const setSchema = async (schema) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/assistant/schema?env=${environment}`,
        {
          schema: schema,
        },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const checkIfAllEndpointsExist = (data: string) => {
    const regex = /api\.(get|post)\((.*?)\)/g;
    const matches = [];
    let match;

    while ((match = regex.exec(data)) !== null) {
      matches.push(match[2]);
    }
    var neededEndpoints = [];
    for (var urlInQuotes of matches) {
      const url = urlInQuotes.replace(/^['"]|['"]$/g, "");

      const doesMatch = doesUrlMatch(url, fullEndpointList);
      if (!doesMatch) {
        console.warn("Endpoint " + url + " does not exist");
        console.log("Do you want me to create " + url + " for you?");
        //OFFER TO CREATE THIS ENDPOINT IN THE BACKEND
        neededEndpoints.push(url);
      }
    }
    return neededEndpoints;
  };

  function doesUrlMatch(url, patterns) {
    // Normalize and split the URL to be checked
    const urlParts = url.split("/").filter((part) => part);

    // Iterate through each pattern
    return patterns.some((pattern) => {
      // Normalize and split the pattern
      const patternParts = pattern.split("/").filter((part) => part);

      // Check if the parts match, considering path parameters
      if (urlParts.length !== patternParts.length) {
        return false; // Different lengths, can't match
      }

      return patternParts.every((part, index) => {
        // Compare each part, path parameters are always a match
        return part.startsWith(":") || part === urlParts[index];
      });
    });
  }

  const executeTask = (task, allTasks) => {
    // if(taskQueue.length == 0){
    //   console.log("no more tasks!")
    //   return
    // } else{
    //   console.log("executing task", task)
    // }
    console.log("executing task", task);

    setTaskQueue(taskQueue.slice(1));

    return toast.promise(
      aiTaskExecute(
        task,
        allTasks.filter((v) => v != null),
      ),
      {
        loading: "Thinking...",
        success: (response: any) => {
          if (response.status == "TASK_WAITING_FOR_APPROVAL") {
            console.log("ai is asking for approval on", response.task.code);
          } else if (response.status == "TASK_SUCCEEDED") {
            console.log("succeeded on", task);
            setShouldRefreshList(!shouldRefreshList);
            if (task.type == "CreateEndpoint") {
              const endpoint = task.inputs.method.toLowerCase() + task.inputs.path;
              console.log("setting endpoint after codegen to", endpoint);
              setActiveEndpoint(endpoint);
            } else if (task.type == "CreatePage") {
              const page = task.inputs.path;
              console.log("setting page after codegen to", page);
              setSelectedTab(Page.Hosting);

              if (page.path) {
                //this isn't necessary when the planner makes pages, maybe its for edits?
                var pageRelativePath = page.path.includes("/pages") ? page.path.split("/pages/")[1] : page.path;
                setActivePage(formatPath(page.path, page.name, true));
                setActiveFile("frontend/src/pages/" + pageRelativePath);
              } else {
                // var pageRelativePath = page.replace(/^\//, '');
                var pageRelativePath = page;
                console.log("going for", pathToFile(pageRelativePath));
                setActivePage(pageRelativePath);
                setActiveFile("frontend/src/pages/" + pathToFile(pageRelativePath));
              }
            }
          } else {
            toast.error("An error occured");
          }
          return "Done";
        },
        error: (e) => {
          console.log("failed task", e);
          return "An error occured";
        },
      },
    );
  };

  const scheduleFunction = async (path: string, schedule: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/scheduledFunctions/create?env=${environment}`,
        {
          endpoint: path,
          schedule: schedule,
          http_method: "get",
          description: "",
        },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const getScheduledFunctions = async () => {
    try {
      const response = await axios.get(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/scheduledFunctions/list?env=${environment}`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const removeScheduledFunction = async (id: string) => {
    try {
      const response = await axios.delete(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/scheduledFunctions/${id}?env=${environment}`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const updateScheduledFunction = async (id: string, path: string, schedule: string) => {
    try {
      const response = await axios.patch(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/scheduledFunctions/${id}?env=${environment}`,
        {
          endpoint: path,
          schedule: schedule,
          http_method: "get",
          description: "",
        },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  return {
    checkIfAllEndpointsExist,
    getFiles,
    npmSearch,
    getPackageJson,
    getFile,
    getAutocheckResponse,
    deploy,
    getFermatJwt,
    getCodeFromFigma,
    refreshFermatJwt,
    deleteFile,
    restartFrontend,
    restartBackend,
    writeFile,
    promptAiEditor,
    promptDbHelper,
    promptAiPlanner,
    promptAiTaskEdit,
    aiTaskExecute,
    setSchema,
    getSchema,
    promptSchemaPlanner,
    executeTask,
    scheduleFunction,
    getScheduledFunctions,
    removeScheduledFunction,
    updateScheduledFunction,
    removeRouteFromList,
    uploadFile
  };
}
