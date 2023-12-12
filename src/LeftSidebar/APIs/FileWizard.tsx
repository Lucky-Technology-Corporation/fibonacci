import { ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import useFilesystemApi from "../../API/FilesystemAPI";
import Checkbox from "../../Utilities/Checkbox";
import { formatPath, pathToFile } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function FileWizard({
  isVisible,
  setIsVisible,
  files,
  fileType,
  pathIfEditing = "",
  fallbackPathIfEditing = "",
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  files: string[];
  fileType: string;
  pathIfEditing?: string;
  fallbackPathIfEditing?: string;
}) {
  const filesystemApi = useFilesystemApi();
  const endpointApi = useEndpointApi();

  const [inputValue, setInputValue] = useState("");
  const [fallbackInputValue, setFallbackInputValue] = useState("");

  const [authRequired, setAuthRequired] = useState<boolean>(false);
  const { setPostMessage, shouldRefreshList, setShouldRefreshList, setActiveFile } = useContext(SwizzleContext);

  const [overrideRender, setOverrideRender] = useState<ReactNode | null>(null);

  const createHandler = async () => {
    if (inputValue == "") {
      toast.error("Please enter a filename");
      return;
    }

    const regex = /^\/?([a-zA-Z][a-zA-Z0-9-]*)(?:\/([a-zA-Z][a-zA-Z0-9-]*))*\/?$/g;
    if (!regex.test(inputValue)) {
      toast.error("Please enter a valid path");
      return;
    }

    if (inputValue == "/") {
      toast.error("Your homepage already exists");
      return;
    }

    const newFileName = cleanupInputValue(inputValue);
    const hasConflicts = checkForConflicts(newFileName);
    if (hasConflicts) {
      return;
    }

    var fileContent;
    if (pathIfEditing && pathIfEditing != "") {
      fileContent = await generateNewFileContent(pathIfEditing, newFileName, authRequired);
      await runDeleteProcess(pathIfEditing);
    }

    if (fileType == "page") {
      var routePath = inputValue.toLowerCase();
      if (!inputValue.startsWith("/")) {
        routePath = "/" + routePath;
      }

      var unauthenticatedFallback = null;
      if (authRequired) {
        unauthenticatedFallback = fallbackInputValue.toLowerCase();
        if (!fallbackInputValue.startsWith("/")) {
          unauthenticatedFallback = "/" + unauthenticatedFallback;
        }
      }

      await filesystemApi.createNewFile(
        "/frontend/src/pages/" + newFileName,
        undefined,
        routePath,
        unauthenticatedFallback,
        fileContent,
      );
      setActiveFile("frontend/src/pages/" + newFileName);
    } else if (fileType == "file") {
      await filesystemApi.createNewFile(
        "/frontend/src/components/" + newFileName,
        undefined,
        undefined,
        undefined,
        fileContent,
      );
      setActiveFile("frontend/src/components/" + newFileName);
    }

    setTimeout(() => {
      setShouldRefreshList(!shouldRefreshList);
    }, 300); //trying to fix the not-showing-up issue

    setIsVisible(false);
  };

  const cleanupInputValue = (inputValue: string) => {
    var newFileName = inputValue;

    if (newFileName.endsWith("/")) {
      newFileName = newFileName.substring(0, newFileName.length - 1);
    }

    if (!newFileName.endsWith(".ts") || !newFileName.endsWith(".tsx")) {
      newFileName = newFileName + ".tsx";
    }

    if (newFileName.startsWith("/")) {
      newFileName = newFileName.substring(1);
    }
    return pathToFile(newFileName);
  };

  const checkForConflicts = (newFileName: string) => {
    const restrictedNames = ["SwizzleHomePage.tsx", "SwizzleRoute.tsx", "SwizzlePrivateRoute.tsx", "SwizzleRoutes.tsx"];
    if (fileType == "page" && restrictedNames.includes(newFileName)) {
      toast.error("SwizzleHomePage is a reserved endpoint");
      return true;
    }

    const testPath = fileType == "page" ? "pages/" + newFileName : "components/" + newFileName;
    const isSameAsEditingPath = fileType == "page" ? "pages/" + newFileName : "components/" + newFileName;
    if (files.includes(testPath) && testPath != isSameAsEditingPath) {
      toast.error("That file already exists");
      return true;
    }

    return false;
  };

  const generateNewFileContent = async (oldPath: string, newPath: string, authRequired: boolean) => {
    const subfolder = fileType == "page" ? "pages" : "components";
    var fileContent = await endpointApi.getFile("frontend/src/" + subfolder + "/" + pathToFile(oldPath));
    const oldComponentName = pathToFile(oldPath).replace(".tsx", "");
    const newComponentName = pathToFile(newPath).replace(".tsx", "");
    const functionDeclaration = "function " + oldComponentName + "(";
    const newFunctionDeclaration = "function " + newComponentName + "(";
    const constFunctionDeclaration = "const " + oldComponentName + " =";
    const newConstFunctionDeclaration = "const " + newComponentName + " =";
    const exportDeclaration = "export default " + oldComponentName + "";
    const newExportDeclaration = "export default " + newComponentName + "";
    const authImportDeclaration = `import { useAuthUser } from 'react-auth-kit';\n`;
    const authDeclaration = `const auth = useAuthUser();\n`;
    fileContent = fileContent.replace(functionDeclaration, newFunctionDeclaration);
    fileContent = fileContent.replace(constFunctionDeclaration, newConstFunctionDeclaration);
    fileContent = fileContent.replace(exportDeclaration, newExportDeclaration);

    if (authRequired) {
      fileContent = fileContent.replace("return (", `${authDeclaration}    return (`);
      fileContent = fileContent = authImportDeclaration + fileContent;
    } else {
      fileContent = fileContent.replace(authDeclaration, "");
      fileContent = fileContent.replace(authImportDeclaration, "");
    }

    return fileContent;
  };

  const runDeleteProcess = async (fileName: string) => {
    try {
      const subfolder = fileType == "page" ? "pages" : "components";
      const fileNameParsed = "/frontend/src/" + subfolder + "/" + pathToFile(pathIfEditing);

      //close file
      setPostMessage({
        type: "removeFile",
        fileName: fileNameParsed,
      });

      //clean up codegen
      if (fileNameParsed.includes("frontend/src/pages/")) {
        await filesystemApi.removeFile(
          "/frontend/src/pages/" + fileName,
          undefined,
          formatPath(pathIfEditing, pathIfEditing),
        );
      }

      //delete file
      await endpointApi.deleteFile(subfolder + "/" + pathToFile(pathIfEditing), "frontend");
    } catch (e) {
      throw "Error deleting endpoint";
    }
  };

  useEffect(() => {
    if (isVisible) {
      if (pathIfEditing) {
        setInputValue(pathIfEditing);
        setFallbackInputValue(fallbackPathIfEditing);
        setAuthRequired(fallbackPathIfEditing != "");
      } else {
        setInputValue("");
        setFallbackInputValue("");
        setAuthRequired(false);
      }
    } else {
      setInputValue("");
      setFallbackInputValue("");
      setAuthRequired(false);
    }
  }, [isVisible]);

  return (
    <div
      className={`fixed z-50 inset-0 overflow-y-auto ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ transition: "opacity 0.2s" }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#32333b] w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="bg-[#32333b] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <>
                <div className="flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    {pathIfEditing == "" ? "New" : "Edit"}
                    {fileType == "file" ? " Component" : " Page"}
                  </h3>
                </div>
                <div className="my-2">
                  {fileType == "file" ? (
                    `${pathIfEditing == "" ? "Create a new" : "Edit the name of your"} reusable component`
                  ) : (
                    <div className="mt-1">
                      <Checkbox
                        id="requireAuthPage"
                        label="Require Authentication"
                        isChecked={authRequired}
                        setIsChecked={setAuthRequired}
                      />
                    </div>
                  )}
                </div>
                {overrideRender ? (
                  overrideRender
                ) : (
                  <>
                    <div className={`mt-1 ${fileType == "page" && pathIfEditing == "/" ? "hidden" : ""}`}>
                      {fileType == "file" ? "Component Name" : "Page URL"}
                    </div>
                    <div className={`mt-1 mb-2 flex ${fileType == "page" && pathIfEditing == "/" ? "hidden" : ""}`}>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                          if (fileType == "page" && pathIfEditing == "/") {
                            return;
                          }
                          const sanitizedValue = e.target.value;
                          setInputValue(sanitizedValue.trim());
                        }}
                        disabled={fileType == "page" && pathIfEditing == "/"}
                        className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                        placeholder={fileType == "file" ? "MyComponent" : `/about`}
                        onKeyDown={(event: any) => {
                          if (event.key == "Enter") {
                            createHandler();
                          }
                        }}
                      />
                    </div>
                    {authRequired && (
                      <>
                        <div className="mt-1">Fallback URL (where users are redirected if not logged in)</div>
                        <div className="mt-1 mb-2 flex">
                          <input
                            type="text"
                            value={fallbackInputValue}
                            onChange={(e) => {
                              const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-_/]/g, "");
                              setFallbackInputValue(sanitizedValue.trim());
                            }}
                            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                            placeholder={`/login`}
                            onKeyDown={(event: any) => {
                              if (event.key == "Enter") {
                                createHandler();
                              }
                            }}
                          />
                        </div>
                      </>
                    )}
                    <div className="bg-[#32333b] py-3 pt-0 mt-3 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={() => {
                          createHandler();
                        }}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Next
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOverrideRender(null);
                          setIsVisible(false);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
