import { Dispatch, SetStateAction } from "react";
import { Page } from "../Utilities/Page";
import SectionHeader from "./SectionHeader";
import CollectionList from "./Database/CollectionList";
import ProjectSelector from "../ProjectSelector";
import UserDropdown from "../UserDropdown";

export default function LeftSidebar({selectedTab, setSelectedTab, setIsProjectCreatorOpen}: {selectedTab: Page, setSelectedTab: Dispatch<SetStateAction<Page>>, setIsProjectCreatorOpen: Dispatch<SetStateAction<boolean>>}){
    return (
        <div className='min-w-[220px] border-r border-[#4C4F6B] bg-[#191A23]'>
            <div className='flex flex-col items-center mt-4 h-screen'>
                
                <div className="flex"><img src="/logo_offwhite.png" className="w-4 h-4 m-auto mr-1.5" /><h1 className="font-bold text-md">Swizzle</h1></div>
                <div className="flex"><ProjectSelector setIsProjectCreatorOpen={setIsProjectCreatorOpen} /></div>

                {/* <SectionHeader icon="logs.svg" text="Logs" active={selectedTab == Page.Logs} onClick={() => {setSelectedTab(Page.Logs)}} /> */}
                
                <SectionHeader icon="database.svg" text="Database" active={selectedTab == Page.Db} onClick={() => {setSelectedTab(Page.Db)}} />
                <CollectionList active={selectedTab == Page.Db}/>
                
                {/* <SectionHeader icon="gear.svg" text="Functions" active={selectedTab == Page.Functions} onClick={() => {setSelectedTab(Page.Functions)}} /> */}
                
                {/* <SectionHeader icon="cloud.svg" text="APIs" active={selectedTab == Page.Apis} onClick={() => {setSelectedTab(Page.Apis)}} />
                <EndpointList active={selectedTab == Page.Apis} /> */}
                <UserDropdown />
            </div>
        </div>
    )
}