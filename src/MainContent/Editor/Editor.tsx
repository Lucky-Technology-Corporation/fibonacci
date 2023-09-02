import React, { useContext, useEffect, useRef } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function Editor({
  fileUri,
  prependText,
}: {
  fileUri: string;
  prependText: string;
}) {
  const iframeRef = useRef(null);
  const { domain, postMessage } = useContext(SwizzleContext);

  useEffect(() => {
    if(postMessage == null) return;
    postMessageToIframe(postMessage)
  }, [postMessage])

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
    if(fileUri == undefined || fileUri == "") return;
    const message = { fileUri: fileUri, type: "openFile" };
    postMessageToIframe(message);
  }, [fileUri]);

  useEffect(() => {
    const message = { content: prependText, type: "prependText" };
    console.log(message);
    postMessageToIframe(message);
  }, [prependText]);

  //Resend the file name when ready
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "extensionReady") {
        const message = { fileUri: fileUri, type: "openFile" };
        postMessageToIframe(message);
      }
      if (event.data.type === "fileChanged") {
        //React to the viewed file changing - update the currently selected endpoint
        console.log("fileChanged");
      }
    });

    //On unmount, save the file and remove the event listener
    return () => {
      window.removeEventListener("message", () => {});
      const message = { type: "saveFile"}
      postMessageToIframe(message);
    }
  }, []);
  
  return (
    <div style={{ overflow: "hidden", height: "calc(100% - 36px)" }}>
      <iframe
        ref={iframeRef}
        src={`${domain.replace("https", "http")}:3000`}
        frameBorder="0"
        style={{
          width: "calc(100% + 96px)",
          height: "calc(100% + 100px)",
          marginLeft: "-48px",
          marginRight: "-48px",
          marginTop: "-78px",
          display: "block", // This ensures the iframe takes up the full width
        }}
      ></iframe>
    </div>
  );
}
