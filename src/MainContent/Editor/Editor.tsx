import { useContext, useEffect, useRef, useState } from "react";
import useEndpointApi from "../../API/EndpointAPI";
import useFilesystemApi from "../../API/FilesystemAPI";
import TestWindow from "../../RightSidebar/TestWindow/TestWindow";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";
import LogWebsocketViewer from "../Logs/LogWebsocketViewer";
import EndpointHeader from "./EndpointHeader";

export default function Editor({ currentFileProperties, setCurrentFileProperties, selectedTab, focusOnHeader, headerRef }: { currentFileProperties: any, setCurrentFileProperties: (properties: any) => void, selectedTab: Page, focusOnHeader: () => void, headerRef: any }) {
  const iframeRef = useRef(null);
  const previewIframeRef = useRef(null);
  const currentFileRef = useRef(null);

  const [theiaUrl, setTheiaUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [previewComponent, setPreviewComponent] = useState<string>("");
  const [injectedLog, setInjectedLog] = useState<any>([]);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);

  const { testDomain, postMessage, setPostMessage, setIdeReady, ideReady, activeProject, activeFile, setActiveFile, setActiveEndpoint, environment, refreshTheia, setRefreshTheia, setSelectedText, setFileErrors } = useContext(SwizzleContext);
  const { getFermatJwt } = useEndpointApi();
  const { patchPreviewComponent, setPreviewComponentFromPath } = useFilesystemApi();

  useEffect(() => {
    if (postMessage == null) return;
    if (!ideReady) return;
    
    if(postMessage.type == "newFile"){
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
    if(refreshTheia){
      iframeRef.current.src = iframeRef.current.src;
      setRefreshTheia(false);
    }
  }, [refreshTheia])

 
  const [currentSelector, setCurrentSelector] = useState("")
  const messageHandler = (event) => {
    if(event.data.source == "react-devtools-content-script" || event.data.source == "react-devtools-bridge") return;
    
    if(event.data.type == "frontendLog"){
      setInjectedLog(event.data)
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
        importStatement: event.data.swizzleImportStatement
      });
    }

    if(event.data.type === "openAi"){
      focusOnHeader()
    }

    if(event.data.type === "selectedText"){
      setSelectedText(event.data.selectedText)
    }

    if(event.data.type === "fileErrors"){
      setFileErrors(event.data.thisFilesErrors)
    }

    if(event.data.type === "target-div"){
      var unwrappedRoot = event.data.message.replace("div#root > ", "")
      setCurrentSelector(unwrappedRoot)
    }
  };

  // useEffect(() => {
  //   if(currentSelector == "") return;
  //   if(activeFile == undefined || activeFile == "") return;
  //   findSelector(activeFile, currentSelector).then((selector) => {
  //     console.log(selector)
  //   })
  // }, [currentSelector])

  //Resend the file name when ready
  useEffect(() => {
    window.addEventListener("message", messageHandler);

    //On unmount, save the file and remove the event listener
    return () => {
      window.removeEventListener("message", messageHandler);
      const message = { type: "saveFile" };
      postMessageToIframe(message);
      setIdeReady(false);
    };
  }, []);

  useEffect(() => {
    if (testDomain == undefined || activeProject == undefined || testDomain == "" || activeProject == "") return;

    const getUrl = async () => {
      const fermatJwt = await getFermatJwt();
      if (fermatJwt == null || fermatJwt == "" || testDomain == "" || testDomain == undefined) return;
      setTheiaUrl(`${testDomain.replace("https://", "https://pascal.")}?jwt=${fermatJwt.replace("Bearer ", "")}`);
    };
    getUrl();
  }, [activeProject, testDomain]);

  useEffect(() => {
    if(activeFile != undefined && activeFile.includes("frontend/src/pages/") && activeFile.includes(".tsx")){
      const path = (activeFile.includes("SwizzleHomePage.tsx")) ? "" : activeFile.split("frontend/src/pages/")[1].split(".tsx")[0].replace(/_/g, "/").toLowerCase().replace(/\$/g, ":")
      setPath("/" + path)
      setUrl(testDomain + "/" + path)
    } else if(activeFile != undefined && activeFile.includes("frontend/src/components/")){
      setPreviewComponentFromPath(activeFile).then((component) => {
        setPreviewComponent(component)
      })
      setUrl(testDomain + "/d/component_preview")
    }
  }, [activeFile])



  const [isDragging, setIsDragging] = useState(false);
  const [iframeRect, setIframeRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const handleDragStart = () => {
    setIsDragging(true);
    if (previewIframeRef.current) {
      setIframeRect(previewIframeRef.current.getBoundingClientRect());
    }
  };

  const handleDragEnd = () => {
    previewIframeRef.current.contentWindow.postMessage({ type: 'drag-coordinates', x: -1, y: -1 }, '*');
    setIsDragging(false);
  }

  const handleDragOver = (event) => {
    const x = event.clientX - iframeRect.left;
    const y = event.clientY - iframeRect.top;
    previewIframeRef.current.contentWindow.postMessage({ type: 'drag-coordinates', x, y }, '*');
  };

  const closePreview = () => {
    setIsSidebarOpen(false)
  }
  const getParentWidth = () => {
    if(selectedTab == Page.Hosting){
      if(isSidebarOpen){
        return "calc(60% - 24px)"
      } else{
        return "calc(100% - 24px)"
      }
    } else{
      return "calc(100% - 24px)"
    }
  }
  const getLogsWidth = () => {
    if(selectedTab == Page.Hosting){
      if(isSidebarOpen){
        return "calc(60% - 32px)"
      } else{
        return "calc(100% - 32px)"
      }
    } else{
      if(isSidebarOpen){
        return "calc(100% - 366px)"
      } else{
        return "calc(100% - 32px)"
      }
    }
  }

  const [heightString, setHeightString] = useState("calc(100% - 200px)")
  useEffect(() => {
    if(isDebugging){
      //This is horrible but its the only way to prevent theia from pushing everything up. im doing it twice just in case the debugger takes a second
      setHeightString("calc(100% - 8px)")
      setTimeout(() => {
        setHeightString(null)
      }, 950)
      setTimeout(() => {
        setHeightString("calc(100% - 8px)")
      }, 1000)
      setTimeout(() => {
        setHeightString(null)
      }, 1950)
      setTimeout(() => {
        setHeightString("calc(100% - 8px)")
      }, 2000)
    } else{
      setHeightString("calc(100% - 200px)")
    }
  }, [isDebugging])




  return testDomain == undefined ? (
    <div className="m-auto mt-4">Something went wrong</div>
  ) : (
    <div className="flex flex-row">
      <div className={`bg-black bg-opacity-70 absolute w-full h-full top-0 left-0 right-0 bottom-0 z-50 pointer-events-none ${environment == "test" && "hidden"}`}>
        <div className="m-auto mt-20 text-center text-lg font-semibold">
          You're viewing Production
        </div>
        <div className="m-auto mt-4 text-center">
        Switch back to Test View in the top left to edit your code.<br/><br/>Then, Deploy your code to update the production app.
        </div>
      </div>

      {!isSidebarOpen && (
        <div className="absolute top-4 right-4 z-50">
            <a className="cursor-pointer" onClick={() => {setIsSidebarOpen(true)}}>Show {selectedTab == Page.Hosting ? "Preview" : "Tests"}</a>
        </div>
      )}

      <div style={{ 
        overflow: "hidden", 
        height: "100vh", 
        marginRight: "0px",
        marginLeft: "8px",
        borderRadius: "8px",
        width: getParentWidth(),
        pointerEvents: environment == "test" ? (selectedTab == Page.Apis || selectedTab == Page.Hosting ? "auto" : "none") : "none" }}
      >
        <EndpointHeader selectedTab={selectedTab} currentFileProperties={currentFileProperties} setCurrentFileProperties={setCurrentFileProperties} headerRef={headerRef} isDebugging={isDebugging} setIsDebugging={setIsDebugging} />

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
          style={{
            height: "200px",
            width: getLogsWidth(),
            bottom: "24px",
            position: "absolute",
            display: isDebugging ? "none" : ""
          }}
        />
      </div>
      {selectedTab == Page.Hosting ? (
        <div className={`flex flex-col ${isSidebarOpen ? "w-[40%]" : "w-0 hidden"}`} style={{height: "calc(100vh - 12px)"}}>
          {(activeFile || "").includes("frontend/src/components") && (
            <div className="flex h-[88px] my-1 pt-3 flex-wrap no-focus-ring">
              <div className="max-w-[120px] my-auto">
                <div className="font-bold mb-2">Preview <a className="cursor-pointer" onClick={closePreview}>(close)</a></div>
                <Button
                  text="Update"
                  onClick={() => {
                    patchPreviewComponent(previewComponent);
                  }}
                  className="mt-2 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-1 bg-[#32333b] cursor-pointer text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                />
              </div>
              <textarea
                className="font-mono mx-4 mr-0 flex-1 rounded bg-transparent border-[#525363] border p-2 text-sm"
                value={previewComponent}
                style={{resize: "none"}}
                onChange={(e) => {
                  setPreviewComponent(e.target.value)
                }}
              />
            </div>
          )}
          {(activeFile || "").includes("frontend/src/pages") && (
            <div className="pt-3 px-1 flex-wrap no-focus-ring">
              <div className="mb-1 font-bold">Preview URL <a className="cursor-pointer" onClick={closePreview}>(close)</a></div>
              <div className="flex flex-row h-8">
                <input className="flex-1 mr-2 mr-4 mr-0 flex-1 rounded bg-transparent border-[#525363] border text-sm px-2" 
                  value={path} 
                  onChange={(e) => { setPath(e.target.value) }}
                  onKeyDown={(e) => {
                    if(e.key == "Enter"){
                      setUrl(testDomain + path)
                    }
                  }}
                />
                <Button
                  text="Update"
                  onClick={() => {
                    setUrl(testDomain + path)
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
              height: (activeFile || "").includes("frontend/src/components") ? "calc(100vh - 112px)" : "calc(100vh - 24px)", 
              width: "100%",
              backgroundColor: "#ffffffdd",
              marginRight: "16px",
              marginLeft: "4px",
              marginTop: "12px",
              pointerEvents: isDragging ? "none" : "auto",
              borderRadius: "8px"
            }}
          />
          {isDragging && (
            <div 
              style={{ 
                position: 'fixed', 
                top: iframeRect.top, 
                left: iframeRect.left, 
                width: iframeRect.width, 
                height: iframeRect.height, 
                zIndex: 9999, 
                cursor: 'grabbing',
                border: '3px dashed #ff0000',
                background: 'rgba(255,0,0,0)' // Transparent background
              }}
              onDragOver={handleDragOver}
            />
          )}
        </div>
      ) : (
        <div className={`flex flex-col ${isSidebarOpen ? "w-[500px]" : "w-0 hidden"}`} style={{height: "calc(100vh - 12px)"}}>
          <TestWindow isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>
        </div>
      )}
    </div>
  );
}
