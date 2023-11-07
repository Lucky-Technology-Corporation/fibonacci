import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../API/EndpointAPI";
import Checkbox from "../Utilities/Checkbox";
import { copyText } from "../Utilities/Copyable";
import { replaceCodeBlocks } from "../Utilities/DataCaster";
import FloatingModal from "../Utilities/FloatingModal";
import { SwizzleContext } from "../Utilities/GlobalContext";
import IconTextButton from "../Utilities/IconTextButton";
import { Page } from "../Utilities/Page";
import DeployButton from "./DeployButton";
import AuthInfo from "./Sections/AuthInfo";
import DBInfo from "./Sections/DBInfo";
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

  const { ideReady, setPostMessage } = useContext(SwizzleContext);
  const { getAutocheckResponse, restartFrontend } = useEndpointApi();

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
    if(importStatement == undefined) return;
    setIsDBChecked(importStatement.includes("db"));
    setIsAuthChecked(currentFileProperties.hasPassportAuth);

  }, [currentFileProperties]);

  const modifySwizzleImport = (importStatement: string, newImport: string, action = 'add') => {
    const imports = importStatement.split("{")[1].split("}")[0].split(",").map((i) => i.trim());
  
    if (action === 'add' && !imports.includes(newImport)) {
      imports.push(newImport);
    } else if (action === 'remove' && imports.includes(newImport)) {
      const index = imports.indexOf(newImport);
      imports.splice(index, 1);
    }
  
    const newImports = `{ ${imports.join(', ')} }`;
    return `import ${newImports} from 'swizzle-js';`;
  }

  return (
    <div
      className={`w-[200px] text-sm ${selectedTab == Page.Apis || selectedTab == Page.Hosting ? "" : "hidden"}
      ${ideReady ? "" : "opacity-50 pointer-events-none"}
      `}
    >
      <div className="flex flex-col items-center pt-4 h-full px-4">
        <DeployButton />
        {selectedTab == Page.Hosting && (
          <>
            <div className="h-4" />
            <IconTextButton
              onClick={() => {toast.promise(restartFrontend(), {
                  loading: "Restarting frontend...",
                  success: "Restarted!",
                  error: "Error restarting frontend",
                });
              }}
              icon={<img src="/restart.svg" className="w-3 h-3 m-auto" />}
              text="Restart Frontend"
            />

            <div className="h-4" />
            <div className="font-bold">Testing</div>
            <div className="h-2" />
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
              icon={<img src="/wand.svg" className="w-3 h-3 m-auto" />}
              text="Autocheck"
            />
            <FloatingModal
              content={autocheckResponse}
              closeModal={() => {
                setAutocheckResponse(null);
              }}
            />
            <div className="h-2" />
            <IconTextButton
              onClick={() => {
                setIsPreviewVisible(true);
              }}
              icon={<img src="/preview.svg" className="w-4 h-4 m-auto" />}
              text="Preview"
            />
            <WebPreview isVisible={isPreviewVisible} setIsVisible={setIsPreviewVisible} />

            <div className="h-4" />
            <div className="font-bold">Configuration</div>
            <div className="h-2" />
            <IconTextButton
              onClick={() => {
                setShouldShowPackagesWindow(true);
              }}
              icon={<img src="/box.svg" className="w-3 h-3 m-auto" />}
              text="Packages"
            />
            <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow} location="frontend" />
          </>
        )}
        {selectedTab == Page.Apis && (
          <>
            {(currentFileProperties.fileUri && currentFileProperties.fileUri.includes("/backend/helpers/")) && (
              <>
                <div className="h-4" />
                <div className="font-bold">Use</div>
                <div className="h-2" />
                <IconTextButton
                  onClick={() => {
                    copyText(`import ${currentFileProperties.fileUri.split("/backend/helpers/")[1].replace(".ts", "")} from "../helpers/${currentFileProperties.fileUri.split("/backend/helpers/")[1]}"`)
                    setTimeout(() => {toast("Paste at the very top of any API file to use this helper")}, 250)
                  }}
                  icon={<img src="/copy.svg" className="w-3 h-3 m-auto" />}
                  text="Copy Import"
                />
              </>
            )}

            <div className="h-4" />
            <div className="font-bold">Testing</div>
            <div className="h-2" />

            {currentFileProperties.fileUri && currentFileProperties.fileUri.includes("/backend/user-dependencies/") && (<>
              <IconTextButton
                onClick={() => {
                  setShouldShowTestWindow(true);
                }}
                icon={<img src="/beaker.svg" className="w-3 h-3 m-auto" />}
                text="Test"
              />
              <TestWindow
                shouldShowTestWindow={shouldShowTestWindow}
                setShouldShowTestWindow={setShouldShowTestWindow}
              />
              <div className="h-2" />
            </>)}
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
              icon={<img src="/wand.svg" className="w-3 h-3 m-auto" />}
              text="Autocheck"
            />
            <FloatingModal
              content={autocheckResponse}
              closeModal={() => {
                setAutocheckResponse(null);
              }}
            />
            <div className="h-4" />
            <div className="font-bold">Configuration</div>
            <div className="h-2" />
            <IconTextButton
              onClick={() => {
                setShouldShowSecretsWindow(true);
              }}
              icon={<img src="/lock.svg" className="w-3 h-3 m-auto" />}
              text="Secrets"
            />
            <SecretInfo isVisible={shouldShowSecretsWindow} setIsVisible={setShouldShowSecretsWindow} />
            <div className="h-2" />
            <IconTextButton
              onClick={() => {
                setShouldShowPackagesWindow(true);
              }}
              icon={<img src="/box.svg" className="w-3 h-3 m-auto" />}
              text="Packages"
            />
            <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow} location="backend" />
            <div className="h-5" />
            {!isHelper && (
              <>
                <div style={{height: "1px"}} className="bg-gray-600 w-full mb-2"></div>
                <div className="text-left w-full space-y-2 mt-0.5">
                  <div className="font-bold mb-1 w-full flex">Authentication <a href="https://docs.swizzle.co/users" target="_blank" rel="noreferrer" className="ml-auto mr-0">Docs</a></div>
                  <Checkbox
                    id="auth"
                    label="Require"
                    checkedLabel="Required"
                    isChecked={isAuthChecked}
                    setIsChecked={() =>{
                      console.log("toggle auth", !isAuthChecked)
                      toggleAuth(!isAuthChecked);
                    }}
                  />
                  <AuthInfo show={true} isAuthChecked={isAuthChecked} />
                </div>
                <div className="h-2" />
              </>
            )}
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
            <div className="text-left w-full space-y-2 mt-0.5">
              <div className="font-bold mb-1 mt-2 w-full flex">Database <a href="https://docs.swizzle.co/database" target="_blank" rel="noreferrer" className="ml-auto mr-0">Docs</a></div>
              <Checkbox id="db" label="Import" checkedLabel="Imported" isChecked={isDBChecked} setIsChecked={() => {
                toggleDb(!isDBChecked);
              }} />
              <DBInfo show={isDBChecked} />
            </div>
            <div className="h-2" />
            <div style={{height: "1px"}} className="bg-gray-600 w-full"></div>
          </>
        )}
      </div>
    </div>
  );
}
