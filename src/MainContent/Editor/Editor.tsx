import React, { useContext, useEffect, useRef, useState } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import useApi from "../../API/EndpointAPI";

export default function Editor({
  setCurrentFileProperties,
}: {
  setCurrentFileProperties: (properties: any) => void;
}) {

  const iframeRef = useRef(null);
  const [theiaUrl, setTheiaUrl] = useState<string | null>(null);
  
  const { testDomain, postMessage, setPostMessage, setIdeReady, activeProject } = useContext(SwizzleContext);

  const {getFermatJwt} = useApi()

  useEffect(() => {
    if (postMessage == null) return;
    console.log("postMessage", postMessage)
    postMessageToIframe(postMessage);
    setPostMessage(null);
  }, [postMessage]);

  const postMessageToIframe = (message) => {
    if (iframeRef == null || iframeRef.current == null || iframeRef.current.contentWindow == null) return;
    iframeRef.current.contentWindow.postMessage(message, "*");
    console.log("message sent", message)
  };

  const messageHandler = (event) => {
    if (event.data.type === "extensionReady") {
      console.log("extensionReady")
      setIdeReady(true);
      const message = { fileName: "user-dependencies/get-.js", type: "openFile" };
      postMessageToIframe(message);
    }
    if (event.data.type === "fileChanged") {
      console.log("fileChanged")
      setCurrentFileProperties({
        fileUri: event.data.fileUri,
        hasPassportAuth: event.data.hasPassportAuth,
        hasGetDb: event.data.hasGetDb,
      });
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
    if(activeProject == undefined || activeProject == "") return
    // console.log("activeProject", activeProject)
    // setTheiaUrl(`${testDomain.replace("https://", "http://")}:3000/#/home/swizzle_prod_user/code`)
    // return

    // /#/home/swizzle_prod_user/code
    const getUrl = async () => {
      const fermatJwt = await getFermatJwt()
      setTheiaUrl(`${testDomain.replace("https://", "https://pascal.")}?jwt=${fermatJwt.replace("Bearer ", "")}`)
    }
    getUrl()

  //   async function getSrc() {
  //     const res = await fetch(`${testDomain.replace("https://", "http://")}:3000/#/home/swizzle_prod_user/code`, {
  //       method: 'GET',
  //       headers: {
  //         // Here you can set any headers you want
  //         Authorization: await getFermatJwt(),
  //       }
  //     });
  //     const blob = await res.blob();
  //     const urlObject = URL.createObjectURL(blob);
  //     document.querySelector('iframe').setAttribute("src", urlObject)
  //   }

  //   getSrc();

  }, [activeProject])

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
