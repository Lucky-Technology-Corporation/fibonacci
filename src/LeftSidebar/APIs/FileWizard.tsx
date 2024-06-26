import { ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import useFilesystemApi from "../../API/FilesystemAPI";
import { changeRelativeImportDepth, pathLengthDifference, pathToFile } from "../../Utilities/EndpointParser";
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

  const [validPageUrl, setValidPageUrl] = useState<boolean>(true);
  const [validFallbackUrl, setValidFallbackUrl] = useState<boolean>(true);

  const createHandler = async () => {
    var cleanInputValue = inputValue;
    var cleanFallbackInputValue = fallbackInputValue;
    if (cleanInputValue.endsWith("/")) {
      cleanInputValue = cleanInputValue.substring(0, cleanInputValue.length - 1);
    }
    if (cleanFallbackInputValue.endsWith("/")) {
      cleanFallbackInputValue = cleanFallbackInputValue.substring(0, cleanFallbackInputValue.length - 1);
    }

    if (fileType == "page") {
      if (
        cleanInputValue.startsWith("/d") ||
        cleanFallbackInputValue.startsWith("/d") ||
        cleanInputValue.endsWith("/d") ||
        cleanFallbackInputValue.endsWith("/d")
      ) {
        toast.error("The /d path is reserved for built-in endpoints. Please choose a different path");
        return;
      }
    }

    const editingSameFile = cleanInputValue === pathIfEditing;
    const newFileName = pathToFile(cleanInputValue);
    const hasConflicts = !editingSameFile && checkForConflicts(newFileName);

    if (hasConflicts) {
      toast.error(
        "That " + fileType + " already exists. You cannot overwrite it before changing its name or deleting it.",
      );
      return;
    }

    let content = "";
    if (pathIfEditing != "") {
      content = await generateNewFileContent(pathIfEditing, newFileName, authRequired);
    }

    // NOTE: Normally, when editing a file we want to create the new file with all the contents changed
    // and then delete the old file afterwards. However, this order of events doesn't work if we're editing
    // the same file because the create acts as an overwrite and then the delete just deletes the existing
    // file. So, if we're editing the same file we have to do delete and then create and skip the delete
    // later on.
    //
    // This solution though is risky because if the delete succeeds but the create fails then we just lost
    // the user's entire file. The better solution would be to make this replacement atomic and do it
    // in Euler.
    if (editingSameFile) {
      await runDeleteProcess(pathIfEditing);
    }

    if (fileType == "page") {
      await filesystemApi.createNewPage(cleanInputValue, authRequired, cleanFallbackInputValue, content);
    } else if (fileType == "file") {
      await filesystemApi.createNewComponent(cleanInputValue, content);
    }

    if (pathIfEditing != "" && !editingSameFile) {
      await runDeleteProcess(pathIfEditing);
    }

    setShouldRefreshList((prev) => !prev);
    setIsVisible(false);
  };

  const checkForConflicts = (newFileName: string) => {
    const restrictedNames = ["SwizzleHomePage.tsx", "SwizzleRoute.tsx", "SwizzlePrivateRoute.tsx", "SwizzleRoutes.tsx"];
    if (fileType == "page" && restrictedNames.includes(newFileName)) {
      toast.error("SwizzleHomePage is a reserved endpoint");
      return true;
    }

    const testPath = fileType == "page" ? "pages/" + newFileName : "components/" + newFileName;
    // const isSameAsEditingPath = fileType == "page" ? "pages/" + newFileName : "components/" + newFileName;

    if (files.includes(testPath)) {
      toast.error("That file already exists");
      return true;
    }

    return false;
  };

  const generateNewFileContent = async (oldPath: string, newPath: string, _authRequired: boolean) => {
    const subfolder = fileType == "page" ? "pages" : "components";
    const oldFilePath = pathToFile(oldPath);
    const newFilePath = pathToFile(newPath);
    var fileContent: string = await endpointApi.getFile("frontend/src/" + subfolder + "/" + oldFilePath);

    const oldComponentName = oldFilePath.replace(".tsx", "").substring(oldFilePath.lastIndexOf("/") + 1);
    const newComponentName = newFilePath.replace(".tsx", "").substring(newFilePath.lastIndexOf("/") + 1);

    const functionDeclaration = "function " + oldComponentName + "(";
    const newFunctionDeclaration = "function " + newComponentName + "(";
    const constFunctionDeclaration = "const " + oldComponentName + " =";
    const newConstFunctionDeclaration = "const " + newComponentName + " =";
    const exportDeclaration = "export default " + oldComponentName + "";
    const newExportDeclaration = "export default " + newComponentName + "";
    // const authImportDeclaration = `import { useAuthUser } from 'react-auth-kit';\n`;
    // const authDeclaration = `const auth = useAuthUser();\n`;
    fileContent = fileContent.replace(functionDeclaration, newFunctionDeclaration);
    fileContent = fileContent.replace(constFunctionDeclaration, newConstFunctionDeclaration);
    fileContent = fileContent.replace(exportDeclaration, newExportDeclaration);

    // Replace imports
    const levelDiff = pathLengthDifference(oldFilePath, newFilePath);

    if (levelDiff !== 0) {
      const apiRegex = /import.*from ['"](\.[^"']+)['"];/g;

      // Just replace the capture group with the newApiImport.
      fileContent = fileContent.replace(apiRegex, (match, p1) => {
        return match.replace(p1, changeRelativeImportDepth(oldFilePath, p1, levelDiff));
      });
    }

    // if (authRequired) {
    //   fileContent = fileContent.replace("return (", `${authDeclaration}    return (`);
    //   fileContent = fileContent = authImportDeclaration + fileContent;
    // } else {
    //   fileContent = fileContent.replace(authDeclaration, "");
    //   fileContent = fileContent.replace(authImportDeclaration, "");
    // }

    return fileContent;
  };

  const runDeleteProcess = async (fileName: string) => {
    try {
      const subfolder = fileType == "page" ? "pages" : "components";
      const pageOrComponent = pathToFile(fileName);
      const fileNameParsed = "/frontend/src/" + subfolder + "/" + pageOrComponent;

      //close file
      setPostMessage({
        type: "removeFile",
        fileName: fileNameParsed,
      });

      //clean up codegen
      if (fileNameParsed.includes("frontend/src/pages/")) {
        await filesystemApi.deletePage(fileName);
      } else {
        await filesystemApi.deleteComponent(fileName);
      }
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
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#181922] border-[#525363] border w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="bg-[#181922] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <>
                <div className="flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    {pathIfEditing == "" ? "New" : "Edit"}
                    {fileType == "file" ? " Component" : " Page"}
                  </h3>
                </div>
                {/* <div className="my-2">
                  {fileType == "file" ? (
                    <></>
                  ) : (
                    // `${pathIfEditing == "" ? "Create a new" : "Edit the name of your"} reusable component`
                    <div className="mt-1">
                      <Checkbox
                        id="requireAuthPage"
                        label="Require Authentication"
                        isChecked={authRequired}
                        setIsChecked={setAuthRequired}
                      />
                    </div>
                  )}
                </div> */}
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
                          var slashedUrl = e.target.value;
                          if (fileType == "page") {
                            const regex = /^(\/|(\/((:[a-zA-Z][a-zA-Z0-9_]*)|([a-zA-Z0-9-_]+)))+)$/;
                            if (!slashedUrl.startsWith("/")) {
                              slashedUrl = "/" + slashedUrl;
                            }

                            if (!regex.test(slashedUrl)) {
                              setValidPageUrl(false);
                            } else {
                              setValidPageUrl(true);
                            }
                          }
                          setInputValue(slashedUrl);
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
                              if (e.target.value == "" || e.target.value == "/") {
                                setValidFallbackUrl(true);
                                return;
                              }
                              const regex = /^\/:?([a-zA-Z0-9-_]+(\/(:?[a-zA-Z0-9-_]+)*)*)$/;
                              var slashedUrl = e.target.value;
                              if (!slashedUrl.startsWith("/")) {
                                slashedUrl = "/" + slashedUrl;
                              }

                              if (!regex.test(e.target.value)) {
                                setValidFallbackUrl(false);
                              } else {
                                setValidFallbackUrl(true);
                              }
                              setFallbackInputValue(slashedUrl);
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
                    <div className="bg-[#181922] py-3 pt-0 mt-3 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={() => {
                          createHandler();
                        }}
                        className={`${
                          validPageUrl && validFallbackUrl ? "" : "opacity-70"
                        } w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm`}
                        disabled={!validPageUrl || !validFallbackUrl}
                      >
                        {validPageUrl && validFallbackUrl ? "Next" : "Invalid URL"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOverrideRender(null);
                          setIsVisible(false);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#181922] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
