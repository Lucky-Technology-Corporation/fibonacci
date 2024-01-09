import { useContext, useEffect, useRef, useState } from "react";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";
import LogWebsocketViewer from "../Logs/LogWebsocketViewer";
import EndpointHeader from "./EndpointHeader";
import CategoryList from "./Wysiwyg/CategoryList";

export default function Editor({ currentFileProperties, setCurrentFileProperties, selectedTab, focusOnHeader, headerRef }: { currentFileProperties: any, setCurrentFileProperties: (properties: any) => void, selectedTab: Page, focusOnHeader: () => void, headerRef: any }) {
  const iframeRef = useRef(null);
  const previewIframeRef = useRef(null);
  const currentFileRef = useRef(null);

  const [theiaUrl, setTheiaUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [injectedLog, setInjectedLog] = useState<any>([]);
  const { testDomain, postMessage, setPostMessage, setIdeReady, ideReady, activeProject, activeFile, setActiveFile, setActiveEndpoint, environment, refreshTheia, setRefreshTheia, setSelectedText, setFileErrors } = useContext(SwizzleContext);
  const { getFermatJwt } = useEndpointApi();

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

  };

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
      const path = (activeFile.includes("SwizzleHomePage.tsx")) ? "" : activeFile.split("frontend/src/pages/")[1].split(".tsx")[0].replace(/_/g, "/").toLowerCase()
      setPath("/" + path)
      setUrl(testDomain + "/" + path)
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

      <div style={{ 
        overflow: "hidden", 
        height: "100vh", 
        marginRight: "0px",
        marginLeft: "8px",
        borderRadius: "8px",
        width: selectedTab == Page.Hosting ? "calc(60% - 24px)" : "calc(100% - 24px)",
        pointerEvents: environment == "test" ? (selectedTab == Page.Apis || selectedTab == Page.Hosting ? "auto" : "none") : "none" }}
      >
        <EndpointHeader selectedTab={selectedTab} currentFileProperties={currentFileProperties} setCurrentFileProperties={setCurrentFileProperties} headerRef={headerRef} />
        <iframe
          className="theia-iframe"
          ref={iframeRef}
          src={theiaUrl}
          frameBorder="0"
          tabIndex={-1}
          style={{
            width: "calc(100% + 96px)",
            height: "calc(100% - 180px)",
            marginLeft: "-48px",
            marginRight: "-48px",
            display: "block", // This ensures the iframe takes up the full width
            marginTop: "4px",
          }}
        />

        <LogWebsocketViewer
          injectedLog={injectedLog}
          setInjectedLog={setInjectedLog}
          location={"backend"} 
          style={{
            height: "200px",
            width: selectedTab == Page.Hosting ? "calc(60% - 32px)" : "calc(100% - 24px)",
            bottom: "24px",
            position: "absolute",
          }}
        />
      </div>
      {selectedTab == Page.Hosting && (
        <div className="flex flex-col w-[40%]" style={{height: "calc(100vh - 12px)"}}>
          <div className="flex h-[88px] my-1 pt-3 flex-wrap">
            <CategoryList handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} />
          </div>
          <iframe
            ref={previewIframeRef}
            src={url}
            tabIndex={-1}
            style={{
              height: "calc(100vh - 72px)", 
              width: "100%",
              backgroundColor: "#ffffffdd",
              marginRight: "16px",
              marginLeft: "4px",
              pointerEvents: isDragging ? "none" : "auto",
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
      )}
    </div>
  );
}
