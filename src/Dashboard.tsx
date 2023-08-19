import toast, { Toaster } from "react-hot-toast";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import { useContext, useEffect, useState } from "react";
import { Page } from "./Utilities/Page";
import {useIsAuthenticated} from 'react-auth-kit';
import SignIn from "./SignIn";
import CenterContent from "./MainContent/CenterContent";
import { SwizzleContext } from "./Utilities/GlobalContext";
import Lottie from "lottie-react";
import dog from "../public/dog.json";
import useApi from "./API/DatabaseAPI";
import Lobby from "./Blockrain/Lobby";

export default function Dashboard(){
    const isAuthenticated = useIsAuthenticated()
    //Content handler
    const [selectedTab, setSelectedTab] = useState<Page>(Page.Logs)
    //Auth checkbox handler
    const [prepndCode, setPrependCode] = useState("")
    //Deploy state handler
    const [didDeploy, setDidDeploy] = useState(false)
    //Active collection handler
    const [activeCollection, setActiveCollection] = useState<string>("");
    //Active logs page handler
    const [activeLogsPage, setActiveLogsPage] = useState<string>("analytics");

    //Initialization code...
    const {isFree, projects, activeProject, setProjects, isCreatingProject} = useContext(SwizzleContext);
    const { getProjects } = useApi();
    
    useEffect(() => {  
        console.log("Getting projects...")
        getProjects().then((data) => {
            console.log("projects")
            console.log(data)
            if(data.length == 0){
                setProjects([])
                return
            }
            var flexibleData = data
            for(var i = 0; i < flexibleData.length; i++){
                //TODO: Add the production domain!
                if(flexibleData[i].edges.project_vm && flexibleData[i].edges.project_vm.length > 0){
                    flexibleData[i].test_domain = flexibleData[i].edges.project_vm[0].domain
                }
            }

            // Move active project to the top, if it exists
            if(activeProject != null && activeProject != ""){
                const projectIndex = flexibleData.findIndex((project: any) => project.id == activeProject)
                if(projectIndex != -1){
                    const project = flexibleData[projectIndex]
                    flexibleData.splice(projectIndex, 1)
                    flexibleData.unshift(project)
                }
            }
            setProjects(flexibleData);
        }).catch((e) => {
            toast.error("Error fetching projects")
            console.log(e)
        })
    }, [])
    
    if(isAuthenticated()){
        if(isCreatingProject){ 
            return ( <Lobby />)
        }
        if(projects){
            return (
                <div className="page-wrapper" style={{transform: (isFree ? "rotate(1.5deg)" : "rotate(0deg)"), transition: "transform 0.5s"}}> 
                    <div><Toaster/></div>
                    <div className="grid grid-cols-[auto,1fr,auto] gap-0">
                        <LeftSidebar 
                            selectedTab={selectedTab} 
                            setSelectedTab={setSelectedTab} 
                            activeCollection={activeCollection}
                            setActiveCollection={setActiveCollection} 
                            activeLogsPage={activeLogsPage}
                            setActiveLogsPage={setActiveLogsPage} />

                        <CenterContent 
                            selectedTab={selectedTab} 
                            prependCode={prepndCode} 
                            didDeploy={didDeploy} 
                            setDidDeploy={setDidDeploy}
                            activeCollection={activeCollection} 
                            activeLogsPage={activeLogsPage} />

                        <RightSidebar 
                            selectedTab={selectedTab} 
                            setPrependCode={setPrependCode} 
                            setDidDeploy={setDidDeploy} />
                    </div>
                </div>
            )
        } else{
            return (
                <div className="w-full mt-12 text-center">
                    <Lottie animationData={dog} loop={true} className="w-48 h-48 m-auto" />
                    <div className="mt-[-32px]">Preparing your dashboard...</div>
                </div>
            )
        }
    } else {
        return (
            <SignIn />
        )
    }
}