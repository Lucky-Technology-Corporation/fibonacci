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
import TestWindow from "./TestWindow";
import WebPreview from "./WebPreview";

export default function RightSidebar({
  selectedTab,
  currentFileProperties,
  setCurrentFileProperties
}: {
  selectedTab: Page;
  currentFileProperties: any;
  setCurrentFileProperties: (properties: any) => void;
}) {
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
  const { ideReady, setPostMessage } = useContext(SwizzleContext);
  const { getAutocheckResponse, restartFrontend, restartBackend } = useEndpointApi();

  const toggleAuth = (isRequired: boolean) => {
    if(isScheduleChecked){
      toast.error("You cannot enable authentication and scheduling at the same time.")
      return
    }

    setIsAuthChecked(isRequired);

    var newImportStatement = currentFileProperties.importStatement
    if(isRequired){
      newImportStatement = newImportStatement.replace("optionalAuthentication", "requiredAuthentication")
    } else{
      newImportStatement = newImportStatement.replace("requiredAuthentication", "optionalAuthentication")
    }

    const message = {
      findText: currentFileProperties.importStatement,
      replaceText: newImportStatement,
      type: "findAndReplace",
    };
    setPostMessage(message);
    setCurrentFileProperties({...currentFileProperties, hasPassportAuth: isRequired, importStatement: newImportStatement})

    //Modify middleware
    setTimeout(() => {
      if (currentFileProperties.fileUri.includes("backend/user-dependencies/")) {
        const message = {
          findText: isRequired ? "optionalAuthentication, async" : "requiredAuthentication, async",
          replaceText: isRequired ? "requiredAuthentication, async" : "optionalAuthentication, async",
          type: "findAndReplace",
        };
        setPostMessage(message);
      }
    }, 100)
  }

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

  return (
    <div
      className={`w-[180px] text-sm ${selectedTab == Page.Apis || selectedTab == Page.Hosting ? "" : "hidden"}
      ${ideReady ? "" : "opacity-50 pointer-events-none"}
      `}
    >
      <div className="flex flex-col items-center pt-4 h-full px-4">
        {selectedTab == Page.Hosting && (
          <>
          <IconTextButton
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
              onClick={() => {
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
              }}
              icon={<img src="/wand.svg" className="w-4 h-4 m-auto" />}
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
              onClick={() => {
                setShouldShowPackagesWindow(true);
              }}
              icon={<img src="/box.svg" className="w-4 h-4 m-auto" />}
              text="Packages"
            />
            <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow} location="frontend" />
            <div className="h-4" />
            <IconTextButton
              onClick={() => {toast.promise(restartFrontend(), {
                  loading: "Restarting frontend...",
                  success: "Restarted!",
                  error: "Error restarting frontend",
                });
              }}
              icon={<img src="/restart.svg" className="w-4 h-4 m-auto" />}
              text="Restart"
            />
          </>
        )}
        {selectedTab == Page.Apis && (
          <>
            {isCron ? (
              <IconTextButton
                onClick={() => {
                  setIsSchedulerVisible(true); 
                }}
                icon={<img src="/clock.svg" className={`w-4 h-4 m-auto`} />}
                text={"Schedule"}
                highlightState={isScheduleChecked}
                highlightColor="#4696f969"
                className={`auth-toggle ${isHelper && "pointer-events-none opacity-30"}`}
              />
            ) : (
              <IconTextButton
                onClick={() => {
                  toggleAuth(!isAuthChecked);
                }}
                icon={<img src="/auth.svg" className={`w-4 h-4 m-auto`} />}
                text={isAuthChecked ? "Auth Required" : "Auth Optional"}
                highlightState={isAuthChecked}
                highlightColor="#ff64644f"
                className={`auth-toggle ${isHelper && "pointer-events-none opacity-30"}`}
              />
            )}
            
            <ScheduleEditor isVisible={isSchedulerVisible} setIsVisible={setIsSchedulerVisible} setIsScheduleChecked={setIsScheduleChecked} />

            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />

            <IconTextButton
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
              onClick={() => {
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
              }}
              icon={<img src="/wand.svg" className="w-4 h-4 m-auto" />}
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
              onClick={() => {toast.promise(restartBackend(), {
                  loading: "Restarting backend...",
                  success: "Restarted!",
                  error: "Error restarting backend",
                });
              }}
              icon={<img src="/restart.svg" className="w-4 h-4 m-auto" />}
              text="Restart"
              className="restart-button"
            />
          </>
        )}
      </div>
    </div>
  );
}
