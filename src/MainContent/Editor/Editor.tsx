import React, { useEffect, useRef } from "react";


export default function Editor({fileUri}: {fileUri: string}){
   const iframeRef = useRef(null);
   
   const postMessageToIframe = () => {
      const message = {fileUri: fileUri, type: "openFile"}
      iframeRef.current.contentWindow.postMessage(message, '*');
   };

   useEffect(() => {
      postMessageToIframe();
   }, [fileUri]);

   //Resend the file name when ready
   useEffect(() => {
      window.addEventListener("message", (event) => {
         if (event.data.type === "extensionReady") {
            postMessageToIframe();
         }
      });
   }, []);
   
   return (
      <iframe
      src="http://localhost:3000/"
      width="100%"
      height="100%"
      ref={iframeRef}
      frameBorder="0"
      ></iframe>
   );
}
   