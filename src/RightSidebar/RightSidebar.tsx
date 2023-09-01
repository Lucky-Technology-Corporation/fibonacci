import { useEffect, useState } from "react";
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
import TestButton from "./TestButton";
import NewTestWindow from "./NewTestWindow";

const authContent = `if(request.user == null){
    return response.send(401, "Unauthorized")
}
const userId = UID(request.user)
`;
const dbContent = `const db = getDb()
`;

export default function RightSidebar({
  selectedTab,
  setPrependCode,
}: {
  selectedTab: Page;
  setPrependCode: (code: string) => void;
}) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isDBChecked, setIsDBChecked] = useState(false);
  const [isSecretsChecked, setIsSecretsChecked] = useState(false);
  const [isPackagesChecked, setIsPackagesChecked] = useState(false);
  const [shouldShowTestWindow, setShouldShowTestWindow] = useState(false);

  const toggleTestWindow = () => {
    setShouldShowTestWindow((prevState) => !prevState);
  };

  useEffect(() => {
    var newPrependCode = isAuthChecked ? authContent : "";
    newPrependCode += isDBChecked ? dbContent : "";
    setPrependCode(newPrependCode);
  }, [isAuthChecked, isDBChecked]);

  return (
    <div
      className={`w-[200px] text-sm ${
        selectedTab == Page.Apis ? "" : "hidden"
      }`}
    >
      <div className="flex flex-col items-center mt-4 h-screen pr-4 space-y-4">
        <DeployButton />
        <TestButton shouldShowTestWindow={toggleTestWindow} />
        {shouldShowTestWindow && (
          <NewTestWindow
            shouldShowTestWindow={shouldShowTestWindow}
            hideTestWindow={toggleTestWindow}
            savedTests={["Test Name 1", "Test Name 2", "Test Name 3"]}
            position="bottom-left"
          />
        )}
        <div className="text-left w-full space-y-2">
          <Checkbox
            id="requests"
            label="Request"
            isChecked={true}
            setIsChecked={() => {}}
          />
          <RequestInfo show={true} />
        </div>
        <div className="text-left w-full space-y-2">
          <Checkbox
            id="auth"
            label="Authentication"
            isChecked={isAuthChecked}
            setIsChecked={setIsAuthChecked}
          />
          <AuthInfo show={isAuthChecked} />
        </div>
        <div className="text-left w-full space-y-2">
          <Checkbox
            id="db"
            label="Database"
            isChecked={isDBChecked}
            setIsChecked={setIsDBChecked}
          />
          <DBInfo show={isDBChecked} />
        </div>
        <div className="text-left w-full space-y-2">
          <Checkbox
            id="secrets"
            label="Secrets"
            isChecked={isSecretsChecked}
            setIsChecked={setIsSecretsChecked}
          />
          <SecretInfo show={isSecretsChecked} />
        </div>
        <div className="text-left w-full space-y-2">
          <Checkbox
            id="packages"
            label="Packages"
            isChecked={isPackagesChecked}
            setIsChecked={setIsPackagesChecked}
          />
          <PackageInfo show={isPackagesChecked} />
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
