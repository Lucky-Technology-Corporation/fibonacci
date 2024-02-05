import { faChevronRight, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useDeploymentApi from "../../API/DeploymentAPI";
import useEndpointApi from "../../API/EndpointAPI";
import useFilesystemApi from "../../API/FilesystemAPI";
import useJarvis from "../../API/JarvisAPI";
import TestWindow from "../../RightSidebar/TestWindow/TestWindow";
import Button from "../../Utilities/Button";
import { endpointToFilename, filenameToEndpoint, formatPath } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";
import LogWebsocketViewer from "../Logs/LogWebsocketViewer";
import EndpointHeader from "./EndpointHeader";

export default function Editor({
  currentFileProperties,
  setCurrentFileProperties,
  selectedTab,
  focusOnHeader,
  headerRef,
}: {
  currentFileProperties: any;
  setCurrentFileProperties: (properties: any) => void;
  selectedTab: Page;
  focusOnHeader: () => void;
  headerRef: any;
}) {
  const iframeRef = useRef(null);
  const previewIframeRef = useRef(null);
  const currentFileRef = useRef(null);
  const renameRef = useRef(null);
  const endpointListRef = useRef([]);
  const promptRef = useRef(null);

  const [theiaUrl, setTheiaUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [previewComponent, setPreviewComponent] = useState<string>("");
  const [injectedLog, setInjectedLog] = useState<any>([]);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);

  const {
    frontendRestarting,
    setActiveEndpoint,
    fullEndpointList,
    testDomain,
    postMessage,
    setPostMessage,
    setIdeReady,
    ideReady,
    activeProject,
    activeFile,
    setShouldRefreshList,
    environment,
    refreshTheia,
    setRefreshTheia,
    setSelectedText,
    setFileErrors,
    fileErrors,
    codeMode,
    setCodeMode,
    shouldRefreshList
  } = useContext(SwizzleContext);
  const { getFermatJwt, getFile, writeFile, getPackageJson } = useEndpointApi();
  const { updatePackage } = useDeploymentApi();
  const { fixProblems } = useJarvis()
  const { patchPreviewComponent, setPreviewComponentFromPath, deleteEndpoint, createNewEndpoint } = useFilesystemApi();

  // useEffect(() => {
  //   //steal focus from theia
  //   console.log("focusing", codeMode);
  //   if (promptRef.current == null) return;
  //   console.log("got it");
  //   promptRef.current.focus();
  //   if (codeMode == "ai") {
  //     setTimeout(() => {
  //       if (codeMode == "ai" && promptRef.current != null) {
  //         promptRef.current.focus();
  //       }
  //     }, 500);
  //   }
  // }, [promptRef.current, codeMode]);

  useEffect(() => {
    if (postMessage == null) return;
    if (!ideReady) return;

    if (postMessage.type == "newFile") {
      setCurrentFileProperties({
        fileUri: postMessage.fileName,
        hasPassportAuth: false,
        hasGetDb: false,
      });
    }

    postMessageToIframe(postMessage);
    setPostMessage(null);
  }, [postMessage]);

  const postMessageToIframe = (message) => {
    if (iframeRef == null || iframeRef.current == null || iframeRef.current.contentWindow == null) return;
    iframeRef.current.contentWindow.postMessage(message, "*");
  };

  useEffect(() => {
    if (refreshTheia) {
      iframeRef.current.src = iframeRef.current.src;
      setRefreshTheia(false);
    }
  }, [refreshTheia]);

  const [currentSelector, setCurrentSelector] = useState("");
  const messageHandler = (event) => {
    if (event.data.source == "react-devtools-content-script" || event.data.source == "react-devtools-bridge") return;

    if (event.data.type == "frontendLog") {
      setInjectedLog(event.data);
    }

    if (event.data.type === "extensionReady") {
      setIdeReady(true);
    }

    if (event.data.type === "fileChanged") {
      currentFileRef.current = event.data.fileName;
      setCurrentFileProperties({
        fileUri: event.data.fileUri,
        hasPassportAuth: event.data.hasPassportAuth,
        hasGetDb: event.data.hasGetDb, //unused
        hasStorage: event.data.hasStorage, //unused
        importStatement: event.data.swizzleImportStatement,
      });
    }

    if (event.data.type === "openAi") {
      console.log(event.data);
      focusOnHeader();
    }

    if (event.data.type === "selectedText") {
      setSelectedText(event.data.selectedText);
    }

    if (event.data.type === "fileErrors") {
      setFileErrors(event.data.thisFilesErrors);
    }

    if (event.data.type === "target-div") {
      var unwrappedRoot = event.data.message.replace("div#root > ", "");
      setCurrentSelector(unwrappedRoot);
    }

    if (event.data.type == "routerLine") {
      reactToRouterLineEvent(event);
    }
  };

  const reactToRouterLineEvent = async (event) => {
    const line = event.data.routerLine || "";
    const uri = event.data.fileUri || "";
    if (line == "") {
      return;
    }
    if (uri.includes("backend/user-dependencies")) {
      //split method and path
      const parts = line.split("router.")[1].split("(");
      const method = parts[0];

      //extract path out of the quotes and remove the leading slash if it exists
      var path = parts[1].split("', ")[0].replace(/'/g, "").replace(/"/g, "");
      var noSlashPath = path;
      var doesNeedLeadingSlash = false;

      if (noSlashPath.endsWith("/")) {
        noSlashPath = noSlashPath.split("/").slice(0, -1).join("/");
      }
      if (noSlashPath.startsWith("/")) {
        noSlashPath = noSlashPath.split("/").slice(1).join("/");
      } else {
        doesNeedLeadingSlash = true;
      }

      //get current file name from the postMessage uri
      const currentFileName = decodeURIComponent(uri.split("backend/user-dependencies/").slice(1).join("/"));

      const correctFileName = endpointToFilename(method + "/" + noSlashPath);
      //send auth info just in case
      const authRequired = line.includes("requiredAuthentication");
      //get the file state (open or closed)
      const fileState = event.data.fileState || "closed";
      //if the current file name is not the correct file name, we need to rename it
      if (currentFileName != correctFileName) {
        renameFile(currentFileName, correctFileName, authRequired, fileState, path, method);
      } else {
        if (doesNeedLeadingSlash && path != "/") {
          addLeadingSlash(currentFileName, method, path);
        }
      }
    }
  };

  const addLeadingSlash = async (fileName, routeMethod, routePath) => {
    const fileNameOnServer = "backend/user-dependencies/" + fileName;
    var contentsToCopy = await getFile(fileNameOnServer);
    contentsToCopy = contentsToCopy.replace(
      `router.${routeMethod}('${routePath}'`,
      `router.${routeMethod}('/${routePath}'`,
    );
    await writeFile(fileNameOnServer, contentsToCopy);
  };

  const renameFile = async (oldName, newName, authRequired, fileState, originalPath, originalMethod) => {
    //prevent infinite loop
    // if(renameRef.current == oldName + "-" + newName){ return }
    // renameRef.current = oldName + "-" + newName

    const fileNameOnServer = "backend/user-dependencies/" + oldName;
    var contentsToCopy = await getFile(fileNameOnServer);

    const methodToDelete = oldName.split(".")[0].toUpperCase();
    const pathToDelete = filenameToEndpoint(oldName).split("/").slice(1).join("/");

    const methodToAdd = newName.split(".")[0].toUpperCase();
    const pathToAdd = filenameToEndpoint(newName).split("/").slice(1).join("/");

    //Check for problems with the new path
    const regex = /^(\/|(\/?((:[a-zA-Z][a-zA-Z0-9_]*)|([a-zA-Z0-9-_]+)))+)$/;
    if (!regex.test(originalPath)) {
      toast.error(originalPath + " is an invalid path. Reverting to " + pathToDelete);
      //replace route with old route
      contentsToCopy = contentsToCopy.replace(
        `router.${originalMethod}('${originalPath}'`,
        `router.${methodToDelete.toLowerCase()}('/${pathToDelete}'`,
      );
      await writeFile(fileNameOnServer, contentsToCopy);
      return;
    }

    if (newName.includes(".d.")) {
      newName = newName.replace(".d.", ".");
      toast.error("URLs cannot contain /d/");
      contentsToCopy = contentsToCopy.replace(
        `router.${originalMethod}('${originalPath}'`,
        `router.${methodToDelete.toLowerCase()}('/${pathToDelete}'`,
      );
      await writeFile(fileNameOnServer, contentsToCopy);
      return;
    }

    if (endpointListRef.current.includes(methodToAdd.toLowerCase() + "/" + pathToAdd)) {
      toast.error(originalPath + " already exists. Reverting to " + pathToDelete);
      contentsToCopy = contentsToCopy.replace(
        `router.${originalMethod}('${originalPath}'`,
        `router.${methodToDelete.toLowerCase()}('/${pathToDelete}'`,
      );
      await writeFile(fileNameOnServer, contentsToCopy);
      return;
    }

    if (!originalPath.startsWith("/")) {
      contentsToCopy = contentsToCopy.replace(
        `router.${originalMethod.toLowerCase()}('${originalPath}'`,
        `router.${originalMethod.toLowerCase()}('/${originalPath}'`,
      );
    }

    //Close the file if it was open
    if (fileState == "open") {
      setPostMessage({
        type: "removeFile",
        fileName: "/" + fileNameOnServer,
      });
    }

    await createNewEndpoint(pathToAdd, methodToAdd, authRequired, contentsToCopy); //authRequired has no effect when contentsToCopy is not null, but its here for safety
    await deleteEndpoint(methodToDelete.toLowerCase(), pathToDelete);

    setShouldRefreshList((prev) => !prev);

    //Only reopen the file if it was open before
    if (fileState == "open") {
      setActiveEndpoint(methodToAdd.toLowerCase() + "/" + pathToAdd);
    }
  };

  useEffect(() => {
    endpointListRef.current = fullEndpointList;
  }, [fullEndpointList]);

  useEffect(() => {
    if (testDomain == undefined || activeProject == undefined || testDomain == "" || activeProject == "") return;

    const getUrl = async () => {
      const fermatJwt = await getFermatJwt();
      if (fermatJwt == null || fermatJwt == "" || testDomain == "" || testDomain == undefined) return;
      setTheiaUrl(`${testDomain.replace("https://", "https://pascal.")}?jwt=${fermatJwt.replace("Bearer ", "")}`);
    };
    getUrl();

    window.addEventListener("message", messageHandler);
    renameRef.current = null;
    //On unmount, save the file and remove the event listener
    return () => {
      window.removeEventListener("message", messageHandler);
      const message = { type: "saveFile" };
      postMessageToIframe(message);
      setIdeReady(false);
    };
  }, [activeProject, testDomain]);

  useEffect(() => {
    if (activeFile != undefined && activeFile.includes("frontend/src/pages/") && activeFile.includes(".tsx")) {
      const path = formatPath(activeFile, activeFile);
      setPath(path);
      setUrl(testDomain + path);
    } else if (activeFile != undefined && activeFile.includes("frontend/src/components/")) {
      setPreviewComponentFromPath(activeFile).then((component) => {
        setPreviewComponent(component);
      });
      setUrl(testDomain + "/d/component_preview");
    }
  }, [activeFile]);

  // useEffect(() => {
  //   console.log("refresh preview")
  //   setUrl(testDomain + path + "?refresh=" + Math.random());
  // }, [shouldRefreshList])

  const closePreview = () => {
    setIsSidebarOpen(false);
  };
  const getParentWidth = () => {
    if (selectedTab == Page.Hosting) {
      if (isSidebarOpen) {
        return "calc(60% - 24px)";
      } else {
        return "calc(100% - 24px)";
      }
    } else {
      return "calc(100% - 24px)";
    }
  };
  const getLogsWidth = () => {
    if (selectedTab == Page.Hosting) {
      if (isSidebarOpen) {
        return "calc(60% - 32px)";
      } else {
        return "calc(100% - 32px)";
      }
    } else {
      if (isSidebarOpen) {
        return "calc(100% - 366px)";
      } else {
        return "calc(100% - 32px)";
      }
    }
  };

  const [heightString, setHeightString] = useState("calc(100% - 200px)");
  useEffect(() => {
    if (isDebugging) {
      //This is horrible but its the only way to prevent theia from pushing everything up. im doing it twice just in case the debugger takes a second
      setHeightString("calc(100% - 8px)");
      setTimeout(() => {
        setHeightString(null);
      }, 950);
      setTimeout(() => {
        setHeightString("calc(100% - 8px)");
      }, 1000);
      setTimeout(() => {
        setHeightString(null);
      }, 1950);
      setTimeout(() => {
        setHeightString("calc(100% - 8px)");
      }, 2000);
    } else {
      setHeightString("calc(100% - 200px)");
    }
  }, [isDebugging]);

  const reloadPreviewWindow = () => {
    previewIframeRef.current.contentWindow.location.reload();
  };

  if (testDomain == undefined) {
    return <div className="m-auto mt-4">Something went wrong</div>;
  }

  return (
    <div className="flex flex-row">
      <div
        className={`bg-black bg-opacity-70 absolute w-full h-full top-0 left-0 right-0 bottom-0 z-50 pointer-events-none ${
          environment == "test" && "hidden"
        }`}
      >
        <div className="m-auto mt-20 text-center text-lg font-semibold">You're viewing Production</div>
        <div className="m-auto mt-4 text-center">
          Switch back to Test View in the top left to edit your code.
          <br />
          <br />
          Then, Deploy your code to update the production app.
        </div>
      </div>

      {!isSidebarOpen && (
        <div className="absolute top-4 right-4 z-50">
          <a
            className="cursor-pointer"
            onClick={() => {
              setIsSidebarOpen(true);
            }}
          >
            Show {selectedTab == Page.Hosting ? "Preview" : "Tests"}
          </a>
        </div>
      )}

      <div
        style={{
          overflow: "hidden",
          height: "100vh",
          marginRight: "0px",
          marginLeft: "8px",
          borderRadius: "8px",
          width: getParentWidth(),
          pointerEvents:
            environment == "test"
              ? selectedTab == Page.Apis || selectedTab == Page.Hosting
                ? "auto"
                : "none"
              : "none",
        }}
      >
        <EndpointHeader
          selectedTab={selectedTab}
          currentFileProperties={currentFileProperties}
          setCurrentFileProperties={setCurrentFileProperties}
          headerRef={headerRef}
          isDebugging={isDebugging}
          setIsDebugging={setIsDebugging}
        />

        <iframe
          className="theia-iframe"
          ref={iframeRef}
          src={theiaUrl}
          frameBorder="0"
          tabIndex={-1}
          style={{
            width: "calc(100% + 96px)",
            height: heightString,
            // height: isDebugging ? "calc(100% - 8px)" : "calc(100% - 200px)",
            marginLeft: "-48px",
            marginRight: "-48px",
            display: "block", // This ensures the iframe takes up the full width
            marginTop: "4px",
          }}
        />

        <LogWebsocketViewer
          injectedLog={injectedLog}
          setInjectedLog={setInjectedLog}
          isSidebarOpen={isSidebarOpen}
          location={"backend"}
          reloadPreviewWindow={reloadPreviewWindow}
          style={{
            height: "200px",
            width: getLogsWidth(),
            bottom: "24px",
            position: "absolute",
            display: isDebugging ? "none" : "",
          }}
        />
      </div>
      {selectedTab == Page.Hosting ? (
        <div
          className={`flex flex-col ${isSidebarOpen ? "w-[40%]" : "w-0 hidden"}`}
          style={{ height: "calc(100vh - 12px)" }}
        >
          {(activeFile || "").includes("frontend/src/components") && (
            <div className="flex h-[88px] my-1 pt-3 flex-wrap no-focus-ring">
              <textarea
                className="font-mono mx-4 mr-0 flex-1 rounded bg-transparent border-[#525363] border p-2 text-sm"
                value={previewComponent}
                style={{ resize: "none" }}
                onChange={(e) => {
                  setPreviewComponent(e.target.value);
                }}
              />
              <div className="max-w-[120px] my-auto ml-2">
                <Button
                  className="w-8 h-8 mr-2 text-sm p-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                  children={<FontAwesomeIcon icon={faChevronRight} className="" />}
                  onClick={closePreview}
                />
                <Button
                  children={<FontAwesomeIcon icon={faRefresh} className="" />}
                  className="w-8 h-8 text-sm p-1 mt-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                  onClick={() => {
                    patchPreviewComponent(previewComponent);
                    setUrl(testDomain + "/d/component_preview?refresh=" + Math.random());
                  }}
                />
              </div>
            </div>
          )}
          {selectedTab == Page.Hosting &&
            (activeFile || "").includes("frontend/") &&
            !(activeFile || "").includes("frontend/src/components") && (
              <div className="pt-3 px-1 flex-wrap no-focus-ring">
                <div className="flex flex-row h-10">
                  {/* <Button
                    className="mr-auto ml-2 px-2.5 py-1 mt-2.5 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                    children={<FontAwesomeIcon icon={faUpRightFromSquare} className="h-3 w-3" />}
                    onClick={() => window.open(testDomain + path, "_blank")}
                  /> */}
                  <Button
                    className="ml-auto mr-2 text-sm px-2.5 py-1 mt-2.5 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                    children={<FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 cursor-pointer" />}
                    onClick={closePreview}
                  />
                  <Button
                    children={<FontAwesomeIcon icon={faRefresh} className="w-3 h-3 cursor-pointer" />}
                    className="text-sm px-2.5 py-1 mt-2.5 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                    onClick={() => {
                      if (testDomain + path == url) {
                        setUrl(testDomain + path + "?refresh=" + Math.random());
                      } else {
                        setUrl(testDomain + path);
                      }
                    }}
                  />
                </div>
              </div>
            )}

          <iframe
            ref={previewIframeRef}
            src={url}
            tabIndex={-1}
            style={{
              height: (activeFile || "").includes("frontend/src/components")
                ? "calc(100vh - 112px)"
                : "calc(100vh - 24px)",
              width: "100%",
              backgroundColor: "#ffffffdd",
              marginRight: "16px",
              marginLeft: "4px",
              marginTop: "12px",
              borderRadius: "8px",
            }}
          />
        </div>
      ) : (
        <div
          className={`flex flex-col ${isSidebarOpen ? "w-[500px]" : "w-0 hidden"}`}
          style={{ height: "calc(100vh - 12px)" }}
        >
          <TestWindow isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </div>
      )}
    </div>
  );
}
