import { useEffect, useRef, useState } from "react";
import Checkbox from "../Utilities/Checkbox";
import AuthInfo from "./Sections/AuthInfo";
import DBInfo from "./Sections/DBInfo";
import toast from "react-hot-toast";
import { Page } from "../Utilities/Page";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import RequestInfo from "./Sections/RequestInfo";
import SecretInfo from "./Sections/SecretInfo";
import DeployButton from "./DeployButton";
import PackageInfo from "./Sections/PackageInfo";
import SearchCodeButton from "./SearchCodeButton";
import CodeCheckButton from "./CodeCheckButton";
import TestButton from "../Utilities/IconTextButton";
import NewTestWindow from "./NewTestWindow";
import IconButton from "../Utilities/IconButton";
import IconTextButton from "../Utilities/IconTextButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask } from "@fortawesome/free-solid-svg-icons";
import TestWindow from "./TestWindow";
import useTestApi from "../API/TestingAPI";

const signatureWithAuth = `passport.authenticate('jwt', { session: false }), async (request, result)`
const signatureNoAuth = `async (request, result)`

const signatureNoDb = `async (request, result) => {
`
const signatureWithDb = `async (request, result) => {
  const db = getDb()
`

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


  useEffect(() => {
    if (programmaticAuthUpdateRef.current) {
      programmaticAuthUpdateRef.current = false;
    } else {
      if(isAuthChecked){
        setFindReplace([signatureNoAuth, signatureWithAuth])
      } else {
        setFindReplace([signatureWithAuth, signatureNoAuth])
      }
    }
  }, [isAuthChecked]);

  useEffect(() => {
    if (programmaticDbUpdateRef.current) {
      programmaticDbUpdateRef.current = false;
    } else {  
      if(isDBChecked){
        setFindReplace([signatureNoDb, signatureWithDb])
      } else {
        setFindReplace([signatureWithDb, signatureNoDb])
      }
    }
  }, [isDBChecked]);

  useEffect(() => {
    if(currentFileProperties == undefined) return;
    
    if(currentFileProperties.hasGetDb !== isDBChecked){
      programmaticDbUpdateRef.current = true;
      setIsDBChecked(currentFileProperties.hasGetDb)
    }
    if(currentFileProperties.hasPassportAuth !== isAuthChecked){
      programmaticAuthUpdateRef.current = true;
      setIsAuthChecked(currentFileProperties.hasPassportAuth)
    }
  }, [currentFileProperties])

  return (
    <div
      className={`w-[200px] text-sm ${
        selectedTab == Page.Apis ? "" : "hidden"
      }`}
    >
      <div className="flex flex-col items-center mt-4 h-screen pr-4">
        <DeployButton 
          
          />
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
        <div className="h-4" />
        <div className="font-bold">Configuration</div>
        <div className="h-2" />
        <IconTextButton
          onClick={() => {setShouldShowSecretsWindow(true)}}
          icon={<img src="/lock.svg" className="w-3 h-3 m-auto" />}
          text="Secrets"
        />
        <SecretInfo isVisible={shouldShowSecretsWindow} setIsVisible={setShouldShowSecretsWindow} />
        <div className="h-2" />
        <IconTextButton
          onClick={() => {setShouldShowPackagesWindow(true)}}
          icon={<img src="/box.svg" className="w-3 h-3 m-auto" />}
          text="Packages"
        />
        <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow}  />
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
          <AuthInfo show={isAuthChecked} />
        </div>
        <div className="h-2" />
        <div className="text-left w-full space-y-2">
          <Checkbox
            id="db"
            label="Database"
            isChecked={isDBChecked}
            setIsChecked={setIsDBChecked}
          />
          <DBInfo show={isDBChecked} />
        </div>


        {/* <div className='text-left w-full space-y-2'>
              <div className="font-bold flex justify-between"><div>Recent requests</div><div className="mr-2 text-xl mt-[-4px] font-medium cursor-pointer"></div></div>
              <div className="flex justify-between opacity-70"><div>Today</div></div>
              <div className="flex justify-between"><div>2:32:12pm</div> <div className="flex space-x-2"><img src="/logs.svg" className="w-4 h-4 m-auto cursor-pointer" /><ArrowPathIcon className="w-4 h-4 cursor-pointer m-auto mr-0" /></div></div>
              <div className="flex justify-between"><div className="text-red-400">2:32:07pm<br/><div className="text-xs underline cursor-pointer">Error info</div></div> <div className="flex space-x-2"><img src="/logs.svg" className="w-4 h-4 m-auto cursor-pointer" /><ArrowPathIcon className="w-4 h-4 cursor-pointer m-auto mr-0" /></div></div>
              <div className="flex justify-between opacity-70"><div>July 12</div></div>
              <div className="flex justify-between"><div>2:31:47pm</div><ArrowPathIcon className="w-4 h-4 cursor-pointer m-auto mr-0" /></div>
              <div className="flex justify-between"><div>2:31:42pm</div><ArrowPathIcon className="w-4 h-4 cursor-pointer m-auto mr-0" /></div>
              <div className="flex justify-between"><div>2:30:33pm</div><ArrowPathIcon className="w-4 h-4 cursor-pointer m-auto mr-0" /></div>

            </div> */}
      </div>
    </div>
  );
}
