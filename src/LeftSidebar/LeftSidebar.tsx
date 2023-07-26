import { Dispatch, SetStateAction } from "react";
import { Page } from "../Utilities/Page";
import SectionTitle from "./SectionTitle";
import CollectionList from "./Database/CollectionList";
import ProjectSelector from "./ProjectSelector";
import UserDropdown from "../UserDropdown";
import EndpointList from "./APIs/EndpointList";

type LeftSidebarProps = {
    selectedTab: Page
    setSelectedTab: Dispatch<SetStateAction<Page>>
    activeCollection: string
    setActiveCollection: Dispatch<SetStateAction<string>>
}

export default function LeftSidebar({selectedTab, setSelectedTab, activeCollection, setActiveCollection} : LeftSidebarProps){
    return (
        <div className='min-w-[220px] border-r border-[#4C4F6B] bg-[#191A23]'>
            <div className='flex flex-col items-center mt-4 h-screen'>
                
                <div className="flex"><img src="/logo_offwhite.png" className="w-4 h-4 m-auto mr-1.5" /><h1 className="font-bold text-md">Swizzle</h1></div>
                <div className="flex"><ProjectSelector /></div>

                <SectionTitle icon="auth.svg" text="Auth" active={selectedTab == Page.Auth} onClick={() => {setSelectedTab(Page.Auth)}} />

                <SectionTitle icon="database.svg" text="Database" active={selectedTab == Page.Db} onClick={() => {setSelectedTab(Page.Db)}} />
                <CollectionList active={selectedTab == Page.Db} activeCollection={activeCollection} setActiveCollection={setActiveCollection} />
                
                <SectionTitle icon="cloud.svg" text="APIs" active={selectedTab == Page.Apis} onClick={() => {setSelectedTab(Page.Apis)}} />
                <EndpointList active={selectedTab == Page.Apis} />
                <UserDropdown />
            </div>


        </div>
    )
}