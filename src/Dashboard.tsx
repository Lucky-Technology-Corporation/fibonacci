import { Toaster } from "react-hot-toast";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import { useContext, useState } from "react";
import { Page } from "./Utilities/Page";
import {useIsAuthenticated} from 'react-auth-kit';
import SignIn from "./SignIn";
import CenterContent from "./MainContent/CenterContent";
import { SwizzleContext } from "./Utilities/GlobalContext";

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

    const {isFree} = useContext(SwizzleContext);

    if(isAuthenticated()){
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
    } else {
        return (
            <SignIn />
        )
    }
}