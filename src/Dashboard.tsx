import { Toaster } from "react-hot-toast";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import { useState } from "react";
import { Page } from "./Utilities/Page";
import {useIsAuthenticated} from 'react-auth-kit';
import SignIn from "./SignIn";
import CenterContent from "./MainContent/CenterContent";

export default function Dashboard(){
    const isAuthenticated = useIsAuthenticated()
    //Content handler
    const [selectedTab, setSelectedTab] = useState<Page>(Page.Apis)
    //Auth checkbox handler
    const [prepndCode, setPrependCode] = useState("")
    //Deploy state handler
    const [didDeploy, setDidDeploy] = useState(false)
    //Active collection handler
    const [activeCollection, setActiveCollection] = useState<string>("");

    if(isAuthenticated()){
        return (
            <>
                <div><Toaster/></div>
                <div className="grid grid-cols-[auto,1fr,auto] gap-0">
                    <LeftSidebar 
                        selectedTab={selectedTab} 
                        setSelectedTab={setSelectedTab} 
                        activeCollection={activeCollection}
                        setActiveCollection={setActiveCollection} />

                    <CenterContent 
                        selectedTab={selectedTab} 
                        prependCode={prepndCode} 
                        didDeploy={didDeploy} 
                        setDidDeploy={setDidDeploy}
                        activeCollection={activeCollection} />

                    <RightSidebar 
                        selectedTab={selectedTab} 
                        setPrependCode={setPrependCode} 
                        setDidDeploy={setDidDeploy} />
                </div>
            </>
        )
    } else {
        return (
            <SignIn />
        )
    }
}