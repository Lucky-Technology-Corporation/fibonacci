import { Dispatch, SetStateAction } from "react";
import { Page } from "../Utilities/Page";
import EndpointList from "./APIs/EndpointList";
import SectionHeader from "./SectionHeader";
import CollectionList from "./Database/CollectionList";

export default function LeftSidebar({selectedTab, setSelectedTab}: {selectedTab: Page, setSelectedTab: Dispatch<SetStateAction<Page>>}){
    return (
        <div className='min-w-[220px] border-r border-[#4C4F6B] bg-[#191A23]'>
            <div className='flex flex-col items-center mt-4 h-screen'>
                <img src="/logo_white.png" className="w-8 h-8" />
                <div className="flex"><h1 className="font-bold text-md">Silverback</h1></div>
                
                <SectionHeader icon="logs.svg" text="Logs" active={selectedTab == Page.Logs} onClick={() => {setSelectedTab(Page.Logs)}} />
                
                <SectionHeader icon="database.svg" text="Database" active={selectedTab == Page.Db} onClick={() => {setSelectedTab(Page.Db)}} />
                <CollectionList active={selectedTab == Page.Db}/>
                
                <SectionHeader icon="gear.svg" text="Functions" active={selectedTab == Page.Functions} onClick={() => {setSelectedTab(Page.Functions)}} />
                
                <SectionHeader icon="cloud.svg" text="APIs" active={selectedTab == Page.Apis} onClick={() => {setSelectedTab(Page.Apis)}} />
                <EndpointList active={selectedTab == Page.Apis} />
            </div>
        </div>
    )
}