import React, { useContext, useEffect, useRef } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function Editor({
  fileUri,
  prependText,
  findReplace,
  setCurrentFileProperties,
}: {
  fileUri: string;
  prependText: string;
  findReplace: string[]; //[find, replace]
  setCurrentFileProperties: (properties: any) => void;
}) {
  const iframeRef = useRef(null);
  const { testDomain, postMessage, setIdeReady } = useContext(SwizzleContext);

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

  useEffect(() => {
    if(findReplace == undefined || findReplace.length != 2) return;
    const message = { findText: findReplace[0], replaceText: findReplace[1], type: "findAndReplace" };
    postMessageToIframe(message);
  }, [findReplace]);

  //Resend the file name when ready
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "extensionReady") {
        console.log("EXTENSION READY")
        setIdeReady(true);
        const message = { fileUri: fileUri, type: "openFile" };
        postMessageToIframe(message);
      }
      if (event.data.type === "fileChanged") {
        setCurrentFileProperties({
          fileUri: event.data.fileUri,
          hasPassportAuth: event.data.hasPassportAuth,
          hasGetDb: event.data.hasGetDb,
        })
        //React to the viewed file changing - update the currently selected endpoint
        console.log("fileChanged");
        console.log(event.data);
      }
    });

    //On unmount, save the file and remove the event listener
    return () => {
      window.removeEventListener("message", () => {});
      const message = { type: "saveFile"}
      postMessageToIframe(message);
      setIdeReady(false);
    }
  }, []);
  
  return (
    <div style={{ overflow: "hidden", height: "calc(100vh - 60px)" }}>
      <iframe
        ref={iframeRef}
        src={`${testDomain.replace("https", "http")}:3000/#/home/swizzle_prod_user/code`}
        // src={`http://localhost:3000`}
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
