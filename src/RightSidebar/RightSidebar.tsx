import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../API/EndpointAPI";
import { ParsedActiveEndpoint } from "../Utilities/ActiveEndpointHelper";
import { replaceCodeBlocks } from "../Utilities/DataCaster";
import { modifySwizzleImport } from "../Utilities/EndpointParser";
import FloatingModal from "../Utilities/FloatingModal";
import { SwizzleContext } from "../Utilities/GlobalContext";
import IconTextButton from "../Utilities/IconTextButton";
import { Page } from "../Utilities/Page";
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
  const programmaticStorageUpdateRef = useRef(false);

  const [isHelper, setIsHelper] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isDBChecked, setIsDBChecked] = useState(false);
  const [isNotificationsChecked, setIsNotificationsChecked] = useState(false);
  const [isStorageChecked, setIsStorageChecked] = useState(false);

  const [shouldShowTestWindow, setShouldShowTestWindow] = useState(false);
  const [shouldShowSecretsWindow, setShouldShowSecretsWindow] = useState(false);
  const [shouldShowPackagesWindow, setShouldShowPackagesWindow] = useState(false);
  const [autocheckResponse, setAutocheckResponse] = useState<ReactNode | undefined>();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [endpointString, setEndpointString] = useState<string>("");
  const { ideReady, setPostMessage, activeEndpoint } = useContext(SwizzleContext);
  const { getAutocheckResponse, restartFrontend, restartBackend } = useEndpointApi();


  useEffect(() => {
    const parsedActiveEndpoint = new ParsedActiveEndpoint(activeEndpoint)
    setEndpointString(`const response = await api.${parsedActiveEndpoint.method.toLowerCase()}("${parsedActiveEndpoint.fullPath}")`)
  }, [activeEndpoint])

  const toggleAuth = (isRequired: boolean) => {
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

  const toggleDb = (isRequired: boolean) => {
    setIsDBChecked(isRequired)

    var newImportStatement = currentFileProperties.importStatement;
    newImportStatement = modifySwizzleImport(newImportStatement, 'db', isRequired ? 'add' : 'remove');
    const message = {
      findText: currentFileProperties.importStatement,
      replaceText: newImportStatement,
      type: "findAndReplace",
    };
    console.log(message)
    setPostMessage(message);
    setCurrentFileProperties({...currentFileProperties, hasGetDb: isRequired, importStatement: newImportStatement})
  }


  useEffect(() => {
    if (currentFileProperties == undefined || currentFileProperties.fileUri == undefined) return;

    if (currentFileProperties.fileUri.includes("backend/helpers/")) {
      setIsHelper(true);
    } else {
      setIsHelper(false);
    }

    programmaticAuthUpdateRef.current = true;
    programmaticDbUpdateRef.current = true;
    const importStatement = currentFileProperties.importStatement;
    if(importStatement == undefined) {
      setIsAuthChecked(false);
      setIsDBChecked(false);
      return;
    };
    setIsDBChecked(importStatement.includes("db"));
    setIsAuthChecked(currentFileProperties.hasPassportAuth);

  }, [currentFileProperties]);

  return (
    <div
      className={`w-[72px] text-sm ${selectedTab == Page.Apis || selectedTab == Page.Hosting ? "" : "hidden"}
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
              textHidden={true}
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
              textHidden={true}
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
              textHidden={true}
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
              text="Restart Frontend"
              textHidden={true}
            />
          </>
        )}
        {selectedTab == Page.Apis && (
          <>

              <IconTextButton
                onClick={() => {
                  toggleAuth(!isAuthChecked);
                }}
                icon={<img src="/auth.svg" className={`w-4 h-4 m-auto`} />}
                text={"Require Authentication"}
                textHidden={true}
                highlightState={isAuthChecked}
                highlightColor="#ff64644f"
                className={`auth-toggle ${isHelper && "pointer-events-none opacity-30"}`}
              />
              {/* <div className="h-4" />

              <IconTextButton
                onClick={() => {
                  toggleDb(!isDBChecked);
                }}
                icon={<img src="/database.svg" className="w-4 h-4 m-auto" />}
                text="Import Database"
                textHidden={true}
                highlightState={isDBChecked}
                highlightColor={"#4696f969"}
                className="db-toggle"
              /> */}
            <div className="h-3" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="h-3" />

            {/* {(currentFileProperties.fileUri && currentFileProperties.fileUri.includes("/backend/helpers/")) && (
              <>
                <IconTextButton
                  onClick={() => {
                    copyText(`import ${currentFileProperties.fileUri.split("/backend/helpers/")[1].replace(".ts", "")} from "../helpers/${currentFileProperties.fileUri.split("/backend/helpers/")[1]}"`)
                    setTimeout(() => {toast("Paste at the very top of any API file to use this helper")}, 250)
                  }}
                  icon={<img src="/copy.svg" className="w-4 h-4 m-auto" />}
                  text="Copy Import"
                  textHidden={true}
                />
                <div className="h-4" />
              </>
            )} */}


            <IconTextButton
              onClick={() => {
                setShouldShowTestWindow(true);
              }}
              icon={<img src="/beaker.svg" className="w-4 h-4 m-auto" />}
              text="Test"
              textHidden={true}
              className={`tester-button ${isHelper && "pointer-events-none opacity-30"}`}
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
              textHidden={true}
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
              textHidden={true}
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
              textHidden={true}
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
              text="Restart Backend"
              textHidden={true}
              className="restart-button"
            />
          </>
        )}
      </div>
    </div>
  );
}
