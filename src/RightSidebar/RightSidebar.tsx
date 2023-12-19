import { faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../API/EndpointAPI";
import { replaceCodeBlocks } from "../Utilities/DataCaster";
import FloatingModal from "../Utilities/FloatingModal";
import { SwizzleContext } from "../Utilities/GlobalContext";
import IconTextButton from "../Utilities/IconTextButton";
import { Page } from "../Utilities/Page";
import ScheduleEditor from "./ScheduleEditor";
import PackageInfo from "./Sections/PackageInfo";
import SecretInfo from "./Sections/SecretInfo";
import TestWindow from "./TestWindow/TestWindow";
import WebPreview from "./WebPreview";

export default function RightSidebar() {
  const programmaticDbUpdateRef = useRef(false);
  const programmaticAuthUpdateRef = useRef(false);

  const [isHelper, setIsHelper] = useState(false);
  const [isCron, setIsCron] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isScheduleChecked, setIsScheduleChecked] = useState(false);
  const [isSchedulerVisible, setIsSchedulerVisible] = useState(false);

  const [shouldShowTestWindow, setShouldShowTestWindow] = useState(false);
  const [shouldShowSecretsWindow, setShouldShowSecretsWindow] = useState(false);
  const [shouldShowPackagesWindow, setShouldShowPackagesWindow] = useState(false);
  const [autocheckResponse, setAutocheckResponse] = useState<ReactNode | undefined>();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [didRunAutocheck, setDidRunAutocheck] = useState(false);
  const { ideReady, setPostMessage, currentFileProperties, selectedTab, swizzleActionDispatch, setSwizzleActionDispatch, postMessage, fileErrors } = useContext(SwizzleContext);
  const { getAutocheckResponse, restartFrontend, restartBackend } = useEndpointApi();

  // const toggleAuth = (isRequired: boolean) => {
  //   if(isScheduleChecked){
  //     toast.error("You cannot enable authentication and scheduling at the same time.")
  //     return
  //   }

  //   setIsAuthChecked(isRequired);

  //   var newImportStatement = currentFileProperties.importStatement
  //   if(isRequired){
  //     newImportStatement = newImportStatement.replace("optionalAuthentication", "requiredAuthentication")
  //   } else{
  //     newImportStatement = newImportStatement.replace("requiredAuthentication", "optionalAuthentication")
  //   }

  //   const message = {
  //     findText: currentFileProperties.importStatement,
  //     replaceText: newImportStatement,
  //     type: "findAndReplace",
  //   };
  //   setPostMessage(message);
  //   setCurrentFileProperties({...currentFileProperties, hasPassportAuth: isRequired, importStatement: newImportStatement})

  //   //Modify middleware
  //   setTimeout(() => {
  //     if (currentFileProperties.fileUri.includes("backend/user-dependencies/")) {
  //       const message = {
  //         findText: isRequired ? "optionalAuthentication, async" : "requiredAuthentication, async",
  //         replaceText: isRequired ? "requiredAuthentication, async" : "optionalAuthentication, async",
  //         type: "findAndReplace",
  //       };
  //       setPostMessage(message);
  //     }
  //   }, 100)
  // }

  useEffect(() => {
    if (currentFileProperties == undefined || currentFileProperties.fileUri == undefined) return;

    if (currentFileProperties.fileUri.includes("backend/helpers/")) {
      setIsHelper(true);
    } else {
      setIsHelper(false);
    }

    if(currentFileProperties.fileUri.includes("backend/user-dependencies/get.cron")){
      setIsCron(true)
    } else{
      setIsCron(false)
    }

    programmaticAuthUpdateRef.current = true;
    programmaticDbUpdateRef.current = true;
    const importStatement = currentFileProperties.importStatement;
    if(importStatement == undefined) {
      setIsAuthChecked(false);
      return;
    };
    setIsAuthChecked(currentFileProperties.hasPassportAuth);

  }, [currentFileProperties]);

  const refreshSpinner = useRef(null)
  const spin = () => {
    const spinner = refreshSpinner.current
    if (spinner) {
      spinner.classList.add("spin-rotate");
      setTimeout(() => {
        spinner.classList.remove("spin-rotate");
      }, 500);
    }
  }

  const runAutocheck = () => {
    toast("Getting file errors...")
    setDidRunAutocheck(true)
    setPostMessage({
      type: "getFileErrors"
    })
  }

  useEffect(() => {
    if(!didRunAutocheck) { 
      return
    }
    if(fileErrors != ""){
      toast.promise(getAutocheckResponse(fileErrors), {
        loading: "Running autocheck...",
        success: (data) => {
          if (data == "") {
            toast.error("Error running autocheck");
            return;
          }
          setAutocheckResponse(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(data.recommendation_text) }} />);
          return "Done";
        },
        error: "Error running autocheck",
      });
    } else{
      toast.promise(getAutocheckResponse(), {
        loading: "Running autocheck...",
        success: (data) => {
          if (data == "") {
            toast.error("Error running autocheck");
            return;
          }
          setAutocheckResponse(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(data.recommendation_text) }} />);
          return "Done";
        },
        error: "Error running autocheck",
      });
    }
    setDidRunAutocheck(false)
  }, [fileErrors])

  useEffect(() => {
    if(swizzleActionDispatch == "Preview"){
      setIsPreviewVisible(true)
    } else if(swizzleActionDispatch == "Autocheck"){
      runAutocheck()
    } else if(swizzleActionDispatch == "Packages"){
      setShouldShowPackagesWindow(true);
    } else if(swizzleActionDispatch == "Restart"){
      if(selectedTab == Page.Apis){
        toast.promise(restartBackend(), {
          loading: "Restarting backend...",
          success: "Restarted!",
          error: "Error restarting backend",
        });
      } else if(selectedTab == Page.Hosting){
        toast.promise(restartFrontend(), {
          loading: "Sending restart command...",
          success: "Restarting!",
          error: "Error restarting frontend",
        });
      }
    } else if(swizzleActionDispatch == "Test"){
      setShouldShowTestWindow(true);
    } else if(swizzleActionDispatch == "Secrets"){
      setShouldShowSecretsWindow(true);
    } 
    setSwizzleActionDispatch(null)

  }, [swizzleActionDispatch])

  return (
    <div
      className={`text-sm ${selectedTab == Page.Apis || selectedTab == Page.Hosting ? "" : "hidden"}
      ${ideReady ? "" : "opacity-50 pointer-events-none"}
      `}
    >
      <div className="flex flex-col items-center pt-4 h-full px-4">
        {selectedTab == Page.Hosting && (
          <>
            <IconTextButton
              textHidden={true}
              onClick={() => {
                setPostMessage({
                  type: "saveFile",
                })
              }}
              icon={<img src="/save.svg" className="w-4 h-4 m-auto" />}
              text="Save"
            />

            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />

            <IconTextButton
              textHidden={true}
              onClick={() => {
                setIsPreviewVisible(true);
              }}
              icon={<img src="/preview.svg" className="w-4 h-4 m-auto" />}
              text="Preview"
            />
            <WebPreview isVisible={isPreviewVisible} setIsVisible={setIsPreviewVisible} />

            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />
            
            <IconTextButton
              textHidden={true}
              onClick={runAutocheck}
              icon={<FontAwesomeIcon icon={faWrench} className={`w-4 h-4 m-auto`} />}
              text="Autocheck"
            />
            <FloatingModal
              content={autocheckResponse}
              closeModal={() => {
                setAutocheckResponse(null);
              }}
            />
            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />
            
            <IconTextButton
              textHidden={true}
              onClick={() => {
                setShouldShowPackagesWindow(true);
              }}
              icon={<img src="/box.svg" className="w-4 h-4 m-auto" />}
              text="Packages"
            />
            <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow} location="frontend" />
            <div className="h-4" />
            <IconTextButton
              textHidden={true}
              onClick={() => {
                spin()
                toast.promise(restartFrontend(), {
                  loading: "Sending restart command...",
                  success: "Restarting!",
                  error: "Error restarting frontend",
                });
              }}
              icon={<img src="/restart.svg" className="w-4 h-4 m-auto" ref={refreshSpinner} />}
              text="Restart"
            />
            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />
            <IconTextButton
              textHidden={true}
              onClick={() => {
                window.open("https://docs.swizzle.co/frontend", "_blank");
              }}
              icon={<img src="/popout.svg" className="w-4 h-4 m-auto" />}
              text="Docs"
              className="docs-button"
            />
          </>
        )}
        {selectedTab == Page.Apis && (
          <>
            <IconTextButton
              textHidden={true}
              onClick={() => {
                setPostMessage({
                  type: "saveFile",
                })
              }}
              icon={<img src="/save.svg" className="w-4 h-4 m-auto" />}
              text="Save"
            />

            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />
            {isCron && (
              <>
              <IconTextButton
              textHidden={true}
                onClick={() => {
                  setIsSchedulerVisible(true); 
                }}
                icon={<img src="/clock.svg" className={`w-4 h-4 m-auto`} />}
                text={"Schedule"}
                highlightState={isScheduleChecked}
                highlightColor="#4696f969"
                className={`auth-toggle ${isHelper && "pointer-events-none opacity-30"}`}
              />
              <div className="h-3" />
              <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
              <div className="h-3" />
              <ScheduleEditor isVisible={isSchedulerVisible} setIsVisible={setIsSchedulerVisible} setIsScheduleChecked={setIsScheduleChecked} />
              </>
            )}

            <IconTextButton
              textHidden={true}
              onClick={() => {
                setShouldShowTestWindow(true);
              }}
              icon={<img src="/beaker.svg" className="w-4 h-4 m-auto" />}
              text="Test"
              className={`tester-button ${isHelper && "pointer-events-none opacity-30 w-full"}`}
            />
            <TestWindow
              shouldShowTestWindow={shouldShowTestWindow}
              setShouldShowTestWindow={setShouldShowTestWindow}
            />
            <div className="h-4" />
            <IconTextButton
              textHidden={true}
              onClick={runAutocheck}
              icon={<FontAwesomeIcon icon={faWrench} className={`w-4 h-4 m-auto`} />}
              text="Autocheck"
              className="autocheck-button"
            />
            <FloatingModal
              content={autocheckResponse}
              closeModal={() => {
                setAutocheckResponse(null);
              }}
            />
            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />
            <IconTextButton
              textHidden={true}
              onClick={() => {
                setShouldShowSecretsWindow(true);
              }}
              icon={<img src="/lock.svg" className="w-4 h-4 m-auto" />}
              text="Secrets"
              className="secrets-button"
            />
            <SecretInfo isVisible={shouldShowSecretsWindow} setIsVisible={setShouldShowSecretsWindow} />
            <div className="h-4" />
            <IconTextButton
              textHidden={true}
              onClick={() => {
                setShouldShowPackagesWindow(true);
              }}
              icon={<img src="/box.svg" className="w-4 h-4 m-auto" />}
              text="Packages"
              className="packages-button"
            />
            <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow} location="backend" />
            <div className="h-4" />
            <IconTextButton
              textHidden={true}
              onClick={() => {
                spin()
                toast.promise(restartBackend(), {
                  loading: "Restarting backend...",
                  success: "Restarted!",
                  error: "Error restarting backend",
                });
              }}
              icon={<img src="/restart.svg" className="w-4 h-4 m-auto" ref={refreshSpinner} />}
              text="Restart"
              className="restart-button"
            />
            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />
            <IconTextButton
              textHidden={true}
              onClick={() => {
                window.open("https://docs.swizzle.co/backend", "_blank");
              }}
              icon={<img src="/popout.svg" className="w-4 h-4 m-auto" />}
              text="Docs"
              className="docs-button"
            />
          </>
        )}
      </div>
    </div>
  );
}
