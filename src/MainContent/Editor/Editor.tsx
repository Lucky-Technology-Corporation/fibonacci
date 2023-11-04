import { useContext, useEffect, useRef, useState } from "react";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";

export default function Editor({ setCurrentFileProperties, selectedTab }: { setCurrentFileProperties: (properties: any) => void, selectedTab: Page }) {
  const iframeRef = useRef(null);
  const currentFileRef = useRef(null);
  const [theiaUrl, setTheiaUrl] = useState<string | null>(null);
  const { testDomain, postMessage, setPostMessage, setIdeReady, ideReady, activeProject, setActiveFile, setActiveEndpoint, environment } = useContext(SwizzleContext);
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

  const messageHandler = (event) => {
    if (event.data.type === "extensionReady") {
      setIdeReady(true);
    }
    
    if (event.data.type === "fileChanged") {
      currentFileRef.current = event.data.fileName;
      setCurrentFileProperties({
        fileUri: event.data.fileUri,
        hasPassportAuth: event.data.hasPassportAuth,
        hasGetDb: event.data.hasGetDb,
        hasStorage: event.data.hasStorage,
        importStatement: event.data.swizzleImportStatement
      });
    }
  };

  useEffect(() => {
    if (currentFileRef.current != null) {
      if(selectedTab == Page.Hosting && currentFileRef.current.includes("backend/")){ 
        setActiveFile("frontend/src/pages/Home.tsx");
      }
      else if(selectedTab == Page.Apis && currentFileRef.current.includes("frontend/src")){
        setActiveEndpoint("backend/user-dependencies/get..ts");
      }
      return;
    }
  }, [selectedTab])

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

  return testDomain == undefined ? (
    <div className="m-auto mt-4">Something went wrong</div>
  ) : (
    <>
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
        height: "calc(100vh - 72px)", 
        margin: "6px",
        marginRight: "0px",
        marginLeft: "16px",
        borderRadius: "12px",
        pointerEvents: environment == "test" ? (selectedTab == Page.Apis || selectedTab == Page.Hosting ? "auto" : "none") : "none" }}>
      <iframe
        className="theia-iframe"
        ref={iframeRef}
        src={theiaUrl}
        frameBorder="0"
        tabIndex={-1}
        style={{
          width: "calc(100% + 96px)",
          height: "calc(100% + 56px)",
          marginLeft: "-48px",
          marginRight: "-48px",
          // marginTop: "-68px",
          display: "block", // This ensures the iframe takes up the full width
        }}
      ></iframe>
      
    </div>
    </>
  );
}
