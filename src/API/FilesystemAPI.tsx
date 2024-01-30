import axios from "axios";
import { useContext } from "react";
import { pathToFile } from "../Utilities/EndpointParser";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { addImports } from "../Utilities/ImportUpserter";
import useEndpointApi from "./EndpointAPI";

export default function useFilesystemApi() {
  const endpointApi = useEndpointApi();
  const { activeProject } = useContext(SwizzleContext);
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const createNewPage = async (
    relativePagePath: string,
    authRequired: boolean,
    fallbackPath: string,
    contents = "",
  ) => {
    try {
      if (!authRequired) {
        fallbackPath = "";
      } else {
        // If we have authRequired set to true but no fallbackPath is given we need to set it to
        // something other than the empty string. Euler treats the empty string to mean public route.
        if (fallbackPath === "") {
          fallbackPath = "/";
        }
      }

      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/frontend/page`,
        {
          name: relativePagePath,
          unauthenticated_fallback: fallbackPath,
          contents,
        },
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

  const createNewComponent = async (relativeComponentPath: string, contents = "") => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/frontend/component`,
        {
          name: relativeComponentPath,
          contents,
        },
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

  const createNewHelper = async (relativeHelperPath: string) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/helper`,
        {
          name: relativeHelperPath,
        },
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

  const createNewEndpoint = async (
    relativeEndpointPath: string,
    method: string,
    authRequired: boolean,
    contentsToCopy?: string,
  ) => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/endpoint`,
        {
          endpoint: relativeEndpointPath,
          http_method: method,
          auth_required: authRequired,
          contents: contentsToCopy,
        },
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

  const removeAuthFromPage = async (page: string) => {
    var path = page;
    const routeListTsx = await endpointApi.getFile("frontend/src/RouteList.tsx");

    if (routeListTsx) {
      var content = routeListTsx;

      //Find old route to remove
      const routeToRemoveRegex = new RegExp(`<SwizzleRoute path="${page.replace("/", "/")}".*>`, "g");

      //Build new route
      if (path.startsWith("/")) {
        path = path.substring(1);
      }
      const componentName = /[^/]*$/.exec(pathToFile(path))[0]; //path after last slash

      const newRoute = `<SwizzleRoute path="${page}" element={<${componentName} />} />`;

      //Swap them
      content = content.replace(routeToRemoveRegex, newRoute);

      await endpointApi.writeFile("frontend/src/RouteList.tsx", content);
    }
  };

  const deleteEndpoint = async (method: string, path: string) => {
    try {
      await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/endpoint/delete`,
        {
          path: path,
          method: method,
        },
        {
          withCredentials: true,
        },
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const deleteHelper = async (helper: string) => {
    try {
      await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/backend/helper/delete`,
        {
          path: helper,
        },
        {
          withCredentials: true,
        },
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const deletePage = async (page: string) => {
    try {
      await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/frontend/page/delete`,
        {
          path: page,
        },
        {
          withCredentials: true,
        },
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const deleteComponent = async (component: string) => {
    try {
      await axios.post(
        `${NEXT_PUBLIC_BASE_URL}/projects/${activeProject}/codegen/frontend/component/delete`,
        {
          path: component,
        },
        {
          withCredentials: true,
        },
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const upsertImport = async (file: string, importObject: any) => {
    const fileContents = await endpointApi.getFile(file);
    if (fileContents) {
      const newFileContents = addImports(fileContents, importObject);
      return newFileContents;
    }
    return null;
  };

  const setPreviewComponentFromPath = async (componentPath: string) => {
    const fileContents = await endpointApi.getFile("frontend/src/ComponentPreview.tsx");
    const componentContents = await endpointApi.getFile(componentPath);
    if (fileContents) {
      var componentName = "";
      var isNamed = false;
      if (componentContents.includes("export default function ")) {
        componentName = componentContents.split("export default function ")[1].split("(")[0].trim();
      } else if (componentContents.includes("export default ")) {
        componentName = componentContents.split("export default ")[1].split(/\s/)[0];
      } else if (componentContents.includes("export function ")) {
        isNamed = true;
        componentName = componentContents.split("export function ")[1].split("(")[0].trim();
      } else if (componentContents.includes("export const ")) {
        isNamed = true;
        componentName = componentContents.split("export const ")[1].split("=")[0].trim();
      }
      componentName = componentName.replace("{", "").replace("}", "").replace(";", "").trim();

      var firstPart = fileContents.split(`{/* Component Preview Area Start */}`)[0];
      if (firstPart.includes("import ")) {
        const regex = /^import.*\n/gm;
        firstPart = firstPart.replace(regex, "");
      }
      const relativePath = "./" + componentPath.split("frontend/src/")[1].replace(".tsx", "");
      if (isNamed) {
        firstPart = "import { " + componentName + " } from '" + relativePath + "';\n" + firstPart;
      } else {
        firstPart = "import " + componentName + " from '" + relativePath + "';\n" + firstPart;
      }

      const secondPart = fileContents.split(`{/* Component Preview Area End */}`)[1];
      const newAssembly =
        firstPart +
        `{/* Component Preview Area Start */}\n<` +
        componentName +
        ` />\n{/* Component Preview Area End */}` +
        secondPart;
      const file = await endpointApi.getFile("frontend/src/ComponentPreview.tsx");

      if (file.includes(`<` + componentName)) {
        return "<" + componentName + " />";
      }

      await endpointApi.writeFile("frontend/src/ComponentPreview.tsx", newAssembly);
      return "<" + componentName + " />";
    }
    return "";
  };

  const patchPreviewComponent = async (componentJsx: string) => {
    const fileContents = await endpointApi.getFile("frontend/src/ComponentPreview.tsx");
    const firstPart = fileContents.split(`{/* Component Preview Area Start */}`)[0];
    const secondPart = fileContents.split(`{/* Component Preview Area End */}`)[1];
    const newAssembly =
      firstPart +
      `{/* Component Preview Area Start */}\n` +
      componentJsx +
      ` \n{/* Component Preview Area End */}` +
      secondPart;
    await endpointApi.writeFile("frontend/src/ComponentPreview.tsx", newAssembly);
  };

  //this is kind of a failed experiment
  const findSelector = async (file: string, selector: string) => {
    // console.log("Get", file)
    // const code = await endpointApi.getFile(file);
    // console.log(code)
    // console.log(selector)
    // const elements = selector.split('>').map(s => s.trim());
    // let lastMatch = '';
    // let regexPattern = '';
    // for (let i = 0; i < elements.length; i++) {
    //     const el = elements[i];
    //     let elRegex;
    //     if (el.includes(':nth-of-type')) {
    //         const match = el.match(/(\w+):nth-of-type\((\d+)\)/);
    //         if (match) {
    //             const [_, element, index] = match;
    //             elRegex = `(?:<${element}[^>]*>[\\s\\S]*?){${index}}`;
    //         }
    //     } else if (el.match(/^[A-Z]/)) { // Assuming component names start with an uppercase letter
    //         elRegex = `<${el}[^>]*>[\\s\\S]*?</${el}>`;
    //     } else {
    //         elRegex = `<${el}[^>]*>`;
    //     }
    //     if (elRegex) {
    //         regexPattern += elRegex;
    //         if (i < elements.length - 1) {
    //             regexPattern += '[\\s\\S]*?';
    //         }
    //         const regex = new RegExp(regexPattern, 'g');
    //         const matches = [...code.matchAll(regex)];
    //         if (matches.length > 0) {
    //             lastMatch = matches[matches.length - 1][0];
    //         } else if (i === elements.length - 1) {
    //             // When no match is found at the last element, look for a React component at that position
    //             const componentRegex = new RegExp(`<(\\w+)[^>]*>[\\s\\S]*?</\\1>`, 'g');
    //             const componentMatches = [...code.matchAll(componentRegex)];
    //             if (componentMatches.length > 0) {
    //                 lastMatch = componentMatches[componentMatches.length - 1][0];
    //             }
    //             break;
    //         } else {
    //             break; // Stop if no match is found for the current pattern
    //         }
    //     }
    // }
    // if (lastMatch) {
    //     return '/* START HIGHLIGHT */' + lastMatch + '/* END HIGHLIGHT */';
    // }
    // return 'Component not found.';
  };

  return {
    // createNewFile,
    // removeFile,
    setPreviewComponentFromPath,
    patchPreviewComponent,
    findSelector,
    removeAuthFromPage,
    createNewPage,
    createNewComponent,
    createNewHelper,
    createNewEndpoint,
    deleteEndpoint,
    deleteHelper,
    deletePage,
    deleteComponent,
    upsertImport,
  };
}
