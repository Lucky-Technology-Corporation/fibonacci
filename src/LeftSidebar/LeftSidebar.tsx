import { Dispatch, SetStateAction } from "react";
import { Page } from "../Utilities/Page";
import EndpointList from "./Endpoints/EndpointList";
import SectionHeader from "./SectionHeader";

export default function LeftSidebar({selectedTab, setSelectedTab}: {selectedTab: Page, setSelectedTab: Dispatch<SetStateAction<Page>>}){
    return (
        <div className='min-w-[200px] border-r border-[#4C4F6B]'>
            <div className='flex flex-col items-center mt-4 h-screen'>
                <div className="flex"><h1 className="font-bold text-md">Project Name</h1></div>
                <SectionHeader icon="logs.svg" text="Logs" active={selectedTab == Page.Logs} onClick={() => {setSelectedTab(Page.Logs)}} />
                <SectionHeader icon="database.svg" text="Database" active={selectedTab == Page.Db} onClick={() => {setSelectedTab(Page.Db)}} />
                <SectionHeader icon="gear.svg" text="Functions" active={selectedTab == Page.Functions} onClick={() => {setSelectedTab(Page.Functions)}} />
                <SectionHeader icon="cloud.svg" text="APIs" active={selectedTab == Page.Apis} onClick={() => {setSelectedTab(Page.Apis)}} />
                <EndpointList active={selectedTab == Page.Apis} />
            </div>
        </div>
    )
}