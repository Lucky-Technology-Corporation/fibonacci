import GjsEditor from '@grapesjs/react';
import grapesjs, { Editor as GrapeEditor } from 'grapesjs';
import { useContext, useEffect, useRef, useState } from "react";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";
import LogWebsocketViewer from "../Logs/LogWebsocketViewer";

export default function Editor({ currentFileProperties, setCurrentFileProperties, selectedTab }: { currentFileProperties: any, setCurrentFileProperties: (properties: any) => void, selectedTab: Page }) {
  const iframeRef = useRef(null);
  const [theiaUrl, setTheiaUrl] = useState<string | null>(null);
  const { testDomain, postMessage, setPostMessage, setIdeReady, ideReady, activeProject, setActiveFile, setActiveEndpoint, environment, activeFile } = useContext(SwizzleContext);
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
    console.log("postMessage", postMessage)
  }, [postMessage]);

  const postMessageToIframe = (message) => {
    if (iframeRef == null || iframeRef.current == null || iframeRef.current.contentWindow == null) return;
    iframeRef.current.contentWindow.postMessage(message, "*");
  };

  const messageHandler = (event) => {
    if (event.data.type === "extensionReady") {
      setTimeout(() => {
        setIdeReady(true);
      }, 200)
    }
    
    if (event.data.type === "fileChanged") {
      console.log("fileChanged", event.data)
      setCurrentFileProperties({
        fileUri: event.data.fileUri,
        hasPassportAuth: event.data.hasPassportAuth,
        hasGetDb: event.data.hasGetDb, //unused
        hasStorage: event.data.hasStorage, //unused
        importStatement: event.data.swizzleImportStatement
      });
    }
  };

  useEffect(() => {
    console.log("selectedTab", selectedTab)
    if(selectedTab == Page.Hosting){ 
      if(!(currentFileProperties.fileUri || "").includes("frontend/")){
        setActiveFile("frontend/src/pages/SwizzleHomePage.tsx");
      }
    }
    else if(selectedTab == Page.Apis){
      if(!(currentFileProperties.fileUri || "").includes("backend/")){
        setActiveEndpoint("get/");
      }
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

  const onEditor = (editor: GrapeEditor) => {
    console.log('Grape! Editor loaded', { editor });
  };


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
        borderRadius: selectedTab == Page.Apis ? "8px" : "",
        pointerEvents: environment == "test" ? (selectedTab == Page.Apis || selectedTab == Page.Hosting ? "auto" : "none") : "none" }}>

        <div style={{lineHeight: "0.75rem", height: "100%", marginRight: "1rem", display: (selectedTab == Page.Hosting && (activeFile || "").includes("/pages")) ? "" : "none"}}>
          <GjsEditor
            // Pass the core GrapesJS library to the wrapper (required).
            // You can also pass the CDN url (eg. "https://unpkg.com/grapesjs")
            grapesjs={grapesjs}
            // Load the GrapesJS CSS file asynchronously from URL.
            // This is an optional prop, you can always import the CSS directly in your JS if you wish.
            grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
            // GrapesJS init options
            options={{
              height: '100%',
              storageManager: false,
            }}
            plugins={[
              {
                id: 'gjs-blocks-basic',
                src: 'https://unpkg.com/grapesjs-blocks-basic',
              },
              {
                id: 'grapesjs-plugin-forms',
                src: 'https://unpkg.com/grapesjs-plugin-forms',
              },
              {
                id: 'grapesjs-navbar',
                src: 'https://unpkg.com/grapesjs-navbar',
              },
              {
                id: 'grapesjs-blocks-flexbox',
                src: 'https://unpkg.com/grapesjs-blocks-flexbox',
              },
              {
                id: 'grapesjs-tabs',
                src: 'https://unpkg.com/grapesjs-tabs',
              },
              {
                id: 'grapesjs-custom-code',
                src: 'https://unpkg.com/grapesjs-custom-code',
              },
            ]}
            onEditor={onEditor}
          />
        </div>

      <iframe
        className="theia-iframe"
        ref={iframeRef}
        src={theiaUrl}
        frameBorder="0"
        tabIndex={-1}
        style={{
          width: "calc(100% + 96px)",
          height: "calc(100% - 144px)",
          marginLeft: "-48px",
          marginRight: "-48px",
          // marginTop: "-68px",
          display: "block", // This ensures the iframe takes up the full width
        }}
      ></iframe>
      
        <LogWebsocketViewer
          location={"backend"} 
          selectedTab={selectedTab}
          style={{
            height: "200px",
            width: "calc(100% - 24px)",
            bottom: "0px",
            position: "absolute",
            display: (selectedTab != Page.Hosting || !(activeFile || "").includes("/pages")) ? "block" : "none",
          }}
        />

    </div>
    </>
  );
}
