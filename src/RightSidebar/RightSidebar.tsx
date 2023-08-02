import { useEffect, useState } from "react";
import Checkbox from "../Utilities/Checkbox";
import AuthInfo from "./Sections/AuthInfo";
import DBInfo from "./Sections/DBInfo";
import toast from "react-hot-toast";
import { Page } from "../Utilities/Page";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import RequestInfo from "./Sections/RequestInfo";

const authContent = `if(request.user == null){
    return response.send(401, "Unauthorized")
}
const userId = UID(request.user)
`
const dbContent = `const db = getDb()
`

export default function RightSidebar({selectedTab, setPrependCode, setDidDeploy}: {selectedTab: Page, setPrependCode: (code: string) => void, setDidDeploy: (didDeploy: boolean) => void}){
    const [deployProgress, setDeployProgress] = useState(0);
    const [isDeploymentInProgress, setIsDeploymentInProgress] = useState(false);

    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [isDBChecked, setIsDBChecked] = useState(false)

    useEffect(() => {
        var newPrependCode = isAuthChecked ? authContent : ""
        newPrependCode += isDBChecked ? dbContent : ""
        setPrependCode(newPrependCode)
    }, [isAuthChecked, isDBChecked])

    const teaseDeploy = () => {
        if(!isDeploymentInProgress){ setDeployProgress(8) }
    }
    const resetDeploy = () => {
        if(!isDeploymentInProgress){ setDeployProgress(0) }
    }

    //fake, for demo purposes
    const runDeploy = () => {
        setIsDeploymentInProgress(true)
        const element = document.getElementById("deploy-progress-bar")
        if(element){ element.style.transition = "width 3s ease-in-out" }
        setDeployProgress(79)
        setTimeout(() => {
            if(element){ element.style.transition = "width 0.2s ease-in" }
            setDeployProgress(100)
        }, 3000)
        setTimeout(() => {   
            if(element){ element.style.transition = "width 0.2s ease-out" }
            setDidDeploy(true)
        }, 3200)

        setTimeout(() => {
            setIsDeploymentInProgress(false)
            setDeployProgress(0)
        }, 3500)
    }

    //Command-S deploy trigger
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((window.navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) && event.key === 's') {
                event.preventDefault();
                toast("Deploying...", {icon: "⏳"})
                runDeploy()
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        // Clean up the effect
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className={`w-[200px] text-sm ${selectedTab == Page.Apis ? "" : "hidden"}`}>
          <div className='flex flex-col items-center mt-4 h-screen pr-4 space-y-4'>
            <div className="relative w-full mb-2">
                <div
                    id="deploy-progress-bar"
                    className="absolute inset-0 bg-orange-400 bg-opacity-30 rounded"
                    style={{ width: `${deployProgress}%`, transition: "width 0.2s ease-out" }}
                />
                <button className='border border-orange-400 text-orange-400 w-full py-1.5 rounded' onMouseEnter={teaseDeploy} onMouseLeave={resetDeploy} onClick={runDeploy}>
                    <img src="rocket.svg" alt="rocket" className='w-4 h-4 inline-block mr-2'/>
                    {deployProgress > 8 ? (deployProgress == 100 ? "Deployed!" : "Deploying...") : "Deploy"}
                </button>
            </div>
            
            <div className='text-left w-full space-y-2'>
              <span className="font-bold">Request Info</span>
              <RequestInfo show={true} />
            </div>
            <div className='text-left w-full space-y-2'>
              <Checkbox id="auth" label="Authentication" isChecked={isAuthChecked} setIsChecked={setIsAuthChecked} />
              <AuthInfo show={isAuthChecked} />
            </div>
            <div className='text-left w-full space-y-2'>
              <Checkbox id="db" label="Database" isChecked={isDBChecked} setIsChecked={setIsDBChecked} />
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
    )
}