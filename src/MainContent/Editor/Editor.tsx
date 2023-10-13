import { useContext, useEffect, useRef, useState } from "react";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";

export default function Editor({ setCurrentFileProperties, selectedTab }: { setCurrentFileProperties: (properties: any) => void, selectedTab: Page }) {
  const iframeRef = useRef(null);
  const currentFileRef = useRef(null);
  const [theiaUrl, setTheiaUrl] = useState<string | null>(null);
  const { testDomain, postMessage, setPostMessage, setIdeReady, ideReady, activeProject, setActiveFile, setActiveEndpoint } = useContext(SwizzleContext);
  const { getFermatJwt } = useEndpointApi();

  useEffect(() => {
    if (postMessage == null) return;
    if (!ideReady) return;
    postMessageToIframe(postMessage);
    setPostMessage(null);
    console.log("Posted");
  }, [postMessage]);

  const postMessageToIframe = (message) => {
    if (iframeRef == null || iframeRef.current == null || iframeRef.current.contentWindow == null) return;
    iframeRef.current.contentWindow.postMessage(message, "*");
    console.log("Sent message:", message);
  };

  const messageHandler = (event) => {
    if (event.data.type === "extensionReady") {
      console.log("extensionReady");
      setIdeReady(true);
      setTimeout(() => {
        if (currentFileRef.current != null) {
          return;
        } 
        if(selectedTab == Page.Hosting){
          const message = { fileName: "frontend/src/App.js", type: "openFile" };
          postMessageToIframe(message);
        } else{
          const message = { fileName: "backend/user-dependencies/get-.js", type: "openFile" };
          postMessageToIframe(message);
        }
      }, 100);
    }
    
    if (event.data.type === "fileChanged") {
      console.log("fileChanged");
      console.log(event.data);

      currentFileRef.current = event.data.fileName;
      setCurrentFileProperties({
        fileUri: event.data.fileUri,
        hasPassportAuth: event.data.hasPassportAuth,
        hasGetDb: event.data.hasGetDb,
      });
    }
  };

  useEffect(() => {
    if (currentFileRef.current != null) {
      if(selectedTab == Page.Hosting && currentFileRef.current.includes("backend")){ 
        setActiveFile("frontend/src/App.js");
      }
      else if(selectedTab == Page.Apis && currentFileRef.current.includes("frontend")){
        setActiveEndpoint("backend/user-dependencies/get-.js");
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
      console.log("Getting url");
      console.log("testDomain", testDomain, "activeProject", activeProject);
      const fermatJwt = await getFermatJwt();
      if (fermatJwt == null || fermatJwt == "" || testDomain == "" || testDomain == undefined) return;
      setTheiaUrl(`${testDomain.replace("https://", "https://pascal.")}?jwt=${fermatJwt.replace("Bearer ", "")}`);
    };
    getUrl();
  }, [activeProject, testDomain]);

  return testDomain == undefined ? (
    <div className="m-auto mt-4">Something went wrong</div>
  ) : (
    <div style={{ overflow: "hidden", height: "calc(100vh - 60px)" }}>
      <iframe
        ref={iframeRef}
        src={theiaUrl}
        frameBorder="0"
        tabIndex={-1}
        style={{
          width: "calc(100% + 96px)",
          height: "calc(100% + 8px)",
          marginLeft: "-48px",
          marginRight: "-48px",
          // marginTop: "-68px",
          display: "block", // This ensures the iframe takes up the full width
        }}
      ></iframe>
    </div>
  );
}
