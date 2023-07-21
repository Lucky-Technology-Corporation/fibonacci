import { useEffect, useState } from "react";
import Checkbox from "../Utilities/Checkbox";
import AuthInfo from "./Sections/AuthInfo";
import DBInfo from "./Sections/DBInfo";
import RequestInfo from "./Sections/RequestInfo";

const functionContent = `if(user == null){
    return status(401, "Unauthorized")
}
`
export default function RightSidebar({setPrependCode, setDidDeploy}: {setPrependCode: (code: string) => void, setDidDeploy: (didDeploy: boolean) => void}){
    const [deployProgress, setDeployProgress] = useState(0);
    const [isDeploymentInProgress, setIsDeploymentInProgress] = useState(false);

    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [isDBChecked, setIsDBChecked] = useState(false)

    useEffect(() => {
        if(isAuthChecked) {
            setPrependCode(functionContent)
        } else {
            setPrependCode("")
        }
    }, [isAuthChecked])

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

    return (
        <div className='w-[200px]'>
          <div className='flex flex-col items-center mt-4 h-screen pr-4 space-y-6'>
            <div className="relative w-full">
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
          </div>
        </div>
    )
}