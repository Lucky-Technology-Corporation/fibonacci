import React, { useContext, useEffect, useRef } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function Editor({
  prependText,
  findReplace,
  setCurrentFileProperties,
}: {
  prependText: string;
  findReplace: string[]; //[find, replace]
  setCurrentFileProperties: (properties: any) => void;
}) {
  const iframeRef = useRef(null);
  const { testDomain, postMessage, setIdeReady } = useContext(SwizzleContext);

  useEffect(() => {
    console.log("Posting this message: " + JSON.stringify(postMessage));
    if (postMessage == null) return;
    postMessageToIframe(postMessage);
  }, [postMessage]);

  const postMessageToIframe = (message) => {
    if (
      iframeRef == null ||
      iframeRef.current == null ||
      iframeRef.current.contentWindow == null
    )
      return;
    iframeRef.current.contentWindow.postMessage(message, "*");
  };

  useEffect(() => {
    const message = { content: prependText, type: "prependText" };
    console.log(message);
    postMessageToIframe(message);
  }, [prependText]);

  useEffect(() => {
    if (findReplace == undefined || findReplace.length != 2) return;
    const message = {
      findText: findReplace[0],
      replaceText: findReplace[1],
      type: "findAndReplace",
    };
    postMessageToIframe(message);
  }, [findReplace]);

  const messageHandler = (event) => {
    if (event.data.type === "extensionReady") {
      console.log("EXTENSION READY");
      setIdeReady(true);
      const message = { fileName: "user-dependencies/get-.js", type: "openFile" };
      postMessageToIframe(message);
    }
    if (event.data.type === "fileChanged") {
      setCurrentFileProperties({
        fileUri: event.data.fileUri,
        hasPassportAuth: event.data.hasPassportAuth,
        hasGetDb: event.data.hasGetDb,
      });
      //React to the viewed file changing - update the currently selected endpoint
      console.log("fileChanged");
      console.log(event.data);
    }
  };

  //Resend the file name when ready
  useEffect(() => {
    window.addEventListener("message", messageHandler);

    //On unmount, save the file and remove the event listener
    return () => {
      console.log("unmount listener");
      window.removeEventListener("message", messageHandler);
      const message = { type: "saveFile" };
      postMessageToIframe(message);
      setIdeReady(false);
    };
  }, []);
  
  return (
    (testDomain == undefined) ? <div className="m-auto mt-4">Something went wrong</div> :
    <div style={{ overflow: "hidden", height: "calc(100vh - 60px)" }}>
      <iframe
        ref={iframeRef}
        src={`${testDomain.replace("http", "https").replace("https://", "https://pascal.")}/#/home/swizzle_prod_user/code`}
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
