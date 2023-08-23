import { Dispatch, SetStateAction, useState } from "react";
import { Page } from "../Utilities/Page";
import SectionTitle from "./SectionTitle";
import CollectionList from "./Database/CollectionList";
import ProjectSelector from "./ProjectSelector";
import UserDropdown from "../UserDropdown";
import EndpointList from "./APIs/EndpointList";
import AuthSettings from "./Auth/AuthSettings";
import LogsList from "./Monitoring/LogsList";

type LeftSidebarProps = {
   selectedTab: Page;
   setSelectedTab: Dispatch<SetStateAction<Page>>;
   activeCollection: string;
   setActiveCollection: Dispatch<SetStateAction<string>>;
   activeLogsPage: string;
   setActiveLogsPage: Dispatch<SetStateAction<string>>;
};

export default function LeftSidebar({
   selectedTab,
   setSelectedTab,
   activeCollection,
   setActiveCollection,
   activeLogsPage,
   setActiveLogsPage,
}: LeftSidebarProps) {
   return (
      <div className="min-w-[220px] border-r border-[#4C4F6B] bg-[#191A23]">
         <div className="flex flex-col items-center mt-4 h-screen">
            
            <div className="flex">
               <img
                  src="/logo_offwhite.png"
                  className="w-4 h-4 m-auto mr-1.5"
               />
               <h1 className="font-bold text-md">Swizzle</h1>
            </div>
            <div className="flex">
               <ProjectSelector />
            </div>

            <SectionTitle
               icon="monitor.svg"
               text="Monitoring"
               active={selectedTab == Page.Logs}
               onClick={() => {
                  setSelectedTab(Page.Logs);
               }}
            />
            <LogsList
               active={selectedTab == Page.Logs}
               activePage={activeLogsPage}
               setActivePage={setActiveLogsPage}
            />

            <SectionTitle
               icon="cloud.svg"
               text="APIs"
               active={selectedTab == Page.Apis}
               onClick={() => {
                  setSelectedTab(Page.Apis);
               }}
            />
            <EndpointList active={selectedTab == Page.Apis} />

            <SectionTitle
               icon="auth.svg"
               text="Auth"
               active={selectedTab == Page.Auth}
               onClick={() => {
                  setSelectedTab(Page.Auth);
               }}
            />

            <SectionTitle
               icon="database.svg"
               text="Database"
               active={selectedTab == Page.Db}
               onClick={() => {
                  setSelectedTab(Page.Db);
               }}
            />
            <CollectionList
               active={selectedTab == Page.Db}
               activeCollection={activeCollection}
               setActiveCollection={setActiveCollection}
            />

            <SectionTitle
               icon="files.svg"
               text="Storage"
               active={selectedTab == Page.Storage}
               onClick={() => {
                  setSelectedTab(Page.Storage);
               }}
            />

            <UserDropdown />
         </div>
      </div>
   );
}
