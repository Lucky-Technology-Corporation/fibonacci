import React, { useContext, useEffect, useRef, useState } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import useApi from "../../API/EndpointAPI";

export default function Editor({ setCurrentFileProperties }: { setCurrentFileProperties: (properties: any) => void }) {
  const iframeRef = useRef(null);
  const [theiaUrl, setTheiaUrl] = useState<string | null>(null);

  const { testDomain, postMessage, setPostMessage, setIdeReady, activeProject } = useContext(SwizzleContext);

  const { getFermatJwt } = useApi();

  useEffect(() => {
    if (postMessage == null) return;
    console.log("postMessage", postMessage);
    postMessageToIframe(postMessage);
    setPostMessage(null);
  }, [postMessage]);

  const postMessageToIframe = (message) => {
    if (iframeRef == null || iframeRef.current == null || iframeRef.current.contentWindow == null) return;
    iframeRef.current.contentWindow.postMessage(message, "*");
    console.log("message sent", message);
  };

  const EXTENSION_READY = "extensionReady";
  const FILE_CHANGED = "fileChanged";
  const OPEN_FILE_MESSAGE = { fileName: "user-dependencies/get-.js", type: "openFile" };
  
  const handleExtensionReady = () => {
    console.log(EXTENSION_READY);
    setIdeReady(true);
    postMessageToIframe(OPEN_FILE_MESSAGE);
  };
  
  const handleFileChanged = (event) => {
    console.log(FILE_CHANGED);
    setCurrentFileProperties({
      fileUri: event.data.fileUri,
      hasPassportAuth: event.data.hasPassportAuth,
      hasGetDb: event.data.hasGetDb,
    });
  };
  
  const handleIframeMessage = (event) => {
    switch (event.data.type) {
      case EXTENSION_READY:
        handleExtensionReady();
        break;
      case FILE_CHANGED:
        handleFileChanged(event);
        break;
      default:
        break;
    }
  };

  //Resend the file name when ready
  const SAVE_FILE_MESSAGE = { type: "saveFile" };
  
  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
  
    // On unmount, save the file and remove the event listener
    // This is to ensure that any changes made in the editor are saved before the component is unmounted
    return () => {
      window.removeEventListener("message", handleIframeMessage);
      postMessageToIframe(SAVE_FILE_MESSAGE);
      setIdeReady(false);
    };
  }, []);

  const HTTPS = "https://";
  const PASCAL = "https://pascal.";
  const BEARER = "Bearer ";
  
  useEffect(() => {
    if (activeProject == undefined || activeProject == "") return;
  
    const setTheiaUrlWithJwt = async () => {
      try {
        const fermatJwt = await getFermatJwt();
        setTheiaUrl(`${testDomain.replace(HTTPS, PASCAL)}?jwt=${fermatJwt.replace(BEARER, "")}`);
      } catch (error) {
        console.error("Failed to fetch JWT or set Theia URL:", error);
      }
    };
    setTheiaUrlWithJwt();
  }, [activeProject]);

  return testDomain == undefined ? (
    <div className="m-auto mt-4">Something went wrong</div>
  ) : (
    <div style={{ overflow: "hidden", height: "calc(100vh - 60px)" }}>
      <iframe
        ref={iframeRef}
        src={theiaUrl}
        frameBorder="0"
        style={{
          width: "calc(100% + 96px)",
          height: "calc(100% + 100px)",
          marginLeft: "-48px",
          marginRight: "-48px",
          marginTop: "-68px",
          display: "block", // This ensures the iframe takes up the full width
        }}
      ></iframe>
    </div>
  );
}
