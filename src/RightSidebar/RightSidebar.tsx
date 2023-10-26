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
import RequestInfo from "./Sections/RequestInfo";
import SecretInfo from "./Sections/SecretInfo";
import StorageInfo from "./Sections/StorageInfo";
import TestWindow from "./TestWindow";
import WebPreview from "./WebPreview";

const noDb = `const router = express.Router();
`;
const withDb = `const router = express.Router();
const { db } = require('swizzle-js');
`;
const justDb = `const { db } = require('swizzle-js');
`;

const noNotificationImport = `const router = express.Router();
`;
const withNotificationImport = `const router = express.Router();
const { sendNotification } = require('swizzle-js');
`;
const justNotificationImport = `const { sendNotification } = require('swizzle-js');
`;

const noStorageImport = `const router = express.Router();
`;
const withStorageImport = `const router = express.Router();
const { saveFile, getFile, deleteFile } = require('swizzle-js');
`;
const justStorageImport = `const { saveFile, getFile, deleteFile } = require('swizzle-js');
`;

export default function RightSidebar({
  selectedTab,
  currentFileProperties,
}: {
  selectedTab: Page;
  currentFileProperties: any;
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
  const { getAutocheckResponse } = useEndpointApi();

  useEffect(() => {
    if (programmaticAuthUpdateRef.current) {
      programmaticAuthUpdateRef.current = false;
    } else {
      if (isAuthChecked) {
        const firstMessage = {
          findText: ", optionalAuthentication,",
          replaceText: ", requiredAuthentication,",
          type: "findAndReplace",
        };
        setPostMessage(firstMessage);
      } else {
        const firstMessage = {
          findText: ", requiredAuthentication,",
          replaceText: ", optionalAuthentication,",
          type: "findAndReplace",
        };
        setPostMessage(firstMessage);
      }
    }
  }, [isAuthChecked]);

  useEffect(() => {
    if (programmaticDbUpdateRef.current) {
      programmaticDbUpdateRef.current = false;
    } else {
      var message = {};
      if (isDBChecked) {
        message = {
          findText: noDb,
          replaceText: withDb,
          type: "findAndReplace",
        };
      } else {
        message = {
          findText: justDb,
          replaceText: "",
          type: "findAndReplace",
        };
      }
      setPostMessage(message);
    }
  }, [isDBChecked]);

  // useEffect(() => {
  //   if (programmaticNotificationUpdateRef.current) {
  //     programmaticNotificationUpdateRef.current = false;
  //   } else {
  //     if (isNotificationsChecked) {
  //       const firstMessage = {
  //         findText: noNotificationImport,
  //         replaceText: withNotificationImport,
  //         type: "findAndReplace",
  //       };
  //       setPostMessage(firstMessage);
  //     } else {
  //       const firstMessage = {
  //         findText: justNotificationImport,
  //         replaceText: "",
  //         type: "findAndReplace",
  //       };
  //       setPostMessage(firstMessage);
  //     }
  //   }
  // }, [isNotificationsChecked]);

  useEffect(() => {
    if (programmaticStorageUpdateRef.current) {
      programmaticStorageUpdateRef.current = false;
    } else {
      if (isStorageChecked) {
        const firstMessage = {
          findText: noStorageImport,
          replaceText: withStorageImport,
          type: "findAndReplace",
        };
        setPostMessage(firstMessage);
      } else {
        const firstMessage = {
          findText: justStorageImport,
          replaceText: "",
          type: "findAndReplace",
        };
        setPostMessage(firstMessage);
      }
    }
  }, [isStorageChecked]);

  useEffect(() => {
    if (currentFileProperties == undefined || currentFileProperties.fileUri == undefined) return;
    console.log(currentFileProperties)

    if (currentFileProperties.fileUri.includes("backend/helpers/")) {
      setIsHelper(true);
    } else {
      setIsHelper(false);
    }

    if (currentFileProperties.hasGetDb !== isDBChecked) {
      programmaticDbUpdateRef.current = true;
      setIsDBChecked(!!currentFileProperties.hasGetDb);
    }
    if (currentFileProperties.hasPassportAuth !== isAuthChecked) {
      programmaticAuthUpdateRef.current = true;
      setIsAuthChecked(!!currentFileProperties.hasPassportAuth);
    }
    if(currentFileProperties.hasStorage !== isStorageChecked){
      programmaticStorageUpdateRef.current = true
      setIsStorageChecked(!!currentFileProperties.hasStorage)
    }
  }, [currentFileProperties]);

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
            {/* <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow} /> */}

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
                    copyText(`const ${currentFileProperties.fileUri.split("/backend/helpers/")[1].replace(".js", "")} = require("../helpers/${currentFileProperties.fileUri.split("/backend/helpers/")[1]}")`)
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
            {!isHelper && (
              <>
                <div className="h-6" />
                <div className="font-bold">Available Variables</div>
                <div className="h-1" />
                <div className="text-left w-full">
                  <RequestInfo show={true} />
                </div>
                <div className="h-3" />
                <div className="text-left w-full space-y-2">
                  <Checkbox
                    id="auth"
                    label="Authentication"
                    isChecked={isAuthChecked}
                    setIsChecked={setIsAuthChecked}
                  />
                  <AuthInfo show={true} isAuthChecked={isAuthChecked} />
                </div>
                <div className="h-2" />
                <div className="text-left w-full space-y-2">
                  <Checkbox id="db" label="Database" isChecked={isDBChecked} setIsChecked={setIsDBChecked} />
                  <DBInfo show={isDBChecked} />
                </div>
                {/* <div className="h-2" />
                <div className="text-left w-full space-y-2">
                  <Checkbox
                    id="notifications"
                    label="Push Notifications"
                    isChecked={isNotificationsChecked}
                    setIsChecked={setIsNotificationsChecked}
                  />
                  <NotificationInfo show={isNotificationsChecked} />
                </div> */}
                <div className="h-2" />
                <div className="text-left w-full space-y-2">
                  <Checkbox
                    id="storage"
                    label="Storage"
                    isChecked={isStorageChecked}
                    setIsChecked={setIsStorageChecked}
                  />
                  <StorageInfo show={isStorageChecked} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
