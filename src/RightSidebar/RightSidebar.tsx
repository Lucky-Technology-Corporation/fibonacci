import { useContext, useEffect, useRef, useState } from "react";
import Checkbox from "../Utilities/Checkbox";
import AuthInfo from "./Sections/AuthInfo";
import DBInfo from "./Sections/DBInfo";
import { Page } from "../Utilities/Page";
import RequestInfo from "./Sections/RequestInfo";
import SecretInfo from "./Sections/SecretInfo";
import DeployButton from "./DeployButton";
import PackageInfo from "./Sections/PackageInfo";
import NewTestWindow from "./NewTestWindow";
import IconTextButton from "../Utilities/IconTextButton";
import TestWindow from "./TestWindow";
import useApi from "../API/EndpointAPI";
import toast from "react-hot-toast";
import { SwizzleContext } from "../Utilities/GlobalContext";
import ToastWindow from "../Utilities/Toast/ToastWindow";
import AutocheckInfo from "./Sections/AutocheckInfo";

const signatureWithAuth = `passport.authenticate('jwt', { session: false }), async (request, result)`;
const signatureNoAuth = `async (request, result)`;

const signatureNoDb = `async (request, result) => {
`;
const signatureWithDb = `async (request, result) => {
  const db = getDb()
`;

export default function RightSidebar({
  selectedTab,
  setPrependCode,
  setFindReplace,
  currentFileProperties,
}: {
  selectedTab: Page;
  setPrependCode: (code: string) => void;
  setFindReplace: (content: string[]) => void;
  currentFileProperties: any;
}) {
  const programmaticDbUpdateRef = useRef(false);
  const programmaticAuthUpdateRef = useRef(false);

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isDBChecked, setIsDBChecked] = useState(false);
  const [shouldShowTestWindow, setShouldShowTestWindow] = useState(false);
  const [shouldShowSecretsWindow, setShouldShowSecretsWindow] = useState(false);
  const [shouldShowPackagesWindow, setShouldShowPackagesWindow] = useState(false);
  const [shouldShowNewTestWindow, setShouldShowNewTestWindow] = useState(false);
  const [currentWindow, setCurrentWindow] = useState<"test" | "newTest" | null>(null);
  const [autocheckResponse, setAutocheckResponse] = useState("");

  const { ideReady } = useContext(SwizzleContext);
  const { getAutocheckResponse } = useApi();

  useEffect(() => {
    if (programmaticAuthUpdateRef.current) {
      programmaticAuthUpdateRef.current = false;
    } else {
      if (isAuthChecked) {
        setFindReplace([signatureNoAuth, signatureWithAuth]);
      } else {
        setFindReplace([signatureWithAuth, signatureNoAuth]);
      }
    }
  }, [isAuthChecked]);

  useEffect(() => {
    if (programmaticDbUpdateRef.current) {
      programmaticDbUpdateRef.current = false;
    } else {
      if (isDBChecked) {
        setFindReplace([signatureNoDb, signatureWithDb]);
      } else {
        setFindReplace([signatureWithDb, signatureNoDb]);
      }
    }
  }, [isDBChecked]);

  useEffect(() => {
    if (currentFileProperties == undefined) return;

    if (currentFileProperties.hasGetDb !== isDBChecked) {
      programmaticDbUpdateRef.current = true;
      setIsDBChecked(currentFileProperties.hasGetDb);
    }
    if (currentFileProperties.hasPassportAuth !== isAuthChecked) {
      programmaticAuthUpdateRef.current = true;
      setIsAuthChecked(currentFileProperties.hasPassportAuth);
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

        {selectedTab == Page.Apis && (
          <>
            <div className="h-4" />
            <div className="font-bold">Testing</div>
            <div className="h-2" />

            <IconTextButton
              onClick={() => {
                setCurrentWindow("test");
                setShouldShowTestWindow(true);
              }}
              icon={<img src="/beaker.svg" className="w-3 h-3 m-auto" />}
              text="Test"
            />
            {currentWindow === "test" && (
              <TestWindow
                shouldShowTestWindow={() => setShouldShowTestWindow(false)}
                //hideTestWindow={() => setShouldShowTestWindow(false)}
                setShouldShowNewTestWindow={() => setShouldShowNewTestWindow(true)}
                setCurrentWindow={setCurrentWindow}
                //savedTests={useApi().getTests()}
              />
            )}
            {currentWindow === "newTest" && (
              <NewTestWindow
                shouldShowNewTestWindow={shouldShowNewTestWindow}
                hideNewTestWindow={() => setShouldShowNewTestWindow(false)}
                savedTests={["Test Name 1", "Test Name 2", "Test Name 3"]}
              />
            )}
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
                    setAutocheckResponse(data.recommendation_text);
                    return "Done";
                  },
                  error: "Error running autocheck",
                });
              }}
              icon={<img src="/wand.svg" className="w-3 h-3 m-auto" />}
              text="Autocheck"
            />
            <AutocheckInfo
              isVisible={autocheckResponse != ""}
              setIsVisible={(show: boolean) => {
                if (!show) {
                  setAutocheckResponse("");
                }
              }}
              autocheckResponse={autocheckResponse}
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
            <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow} />
            <div className="h-6" />
            <div className="font-bold">Available Variables</div>
            <div className="h-1" />
            <div className="text-left w-full">
              <RequestInfo show={true} />
            </div>
            <div className="h-3" />
            <div className="text-left w-full space-y-2">
              <Checkbox id="auth" label="Authentication" isChecked={isAuthChecked} setIsChecked={setIsAuthChecked} />
              <AuthInfo show={isAuthChecked} />
            </div>
            <div className="h-2" />
            <div className="text-left w-full space-y-2">
              <Checkbox id="db" label="Database" isChecked={isDBChecked} setIsChecked={setIsDBChecked} />
              <DBInfo show={isDBChecked} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
