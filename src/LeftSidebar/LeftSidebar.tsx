import { Dispatch, SetStateAction, useContext, useState } from "react";
import { Page } from "../Utilities/Page";
import SectionTitle from "./SectionTitle";
import CollectionList from "./Database/CollectionList";
import ProjectSelector from "./ProjectSelector";
import UserDropdown from "../UserDropdown";
import EndpointList from "./APIs/EndpointList";
import AuthSettings from "./Auth/AuthSettings";
import LogsList from "./Monitoring/LogsList";
import Switch from "react-switch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faFlask } from "@fortawesome/free-solid-svg-icons";
import { SwizzleContext } from "../Utilities/GlobalContext";

type LeftSidebarProps = {
  selectedTab: Page;
  setSelectedTab: Dispatch<SetStateAction<Page>>;
  activeCollection: string;
  setActiveCollection: Dispatch<SetStateAction<string>>;
  activeLogsPage: string;
  setActiveLogsPage: Dispatch<SetStateAction<string>>;
  currentFileProperties: any;
};

export default function LeftSidebar({
  selectedTab,
  setSelectedTab,
  activeCollection,
  setActiveCollection,
  activeLogsPage,
  setActiveLogsPage,
  currentFileProperties,
}: LeftSidebarProps) {

  const {environment, setEnvironment} = useContext(SwizzleContext);

  return (
    <div className="min-w-[240px] border-r border-[#4C4F6B] bg-[#191A23] max-h-[100vh] overflow-hidden">
      <div className="flex flex-col items-center pt-4 h-screen">
        <div className="flex">
          <img src="/logo_offwhite.png" className="w-4 h-4 m-auto mr-1.5" />
          <h1 className="font-bold text-md">Swizzle</h1>
        </div>
        <div className="flex mt-2">
          {/* <Switch
            className="m-auto mr-0.5 scale-75"
            onChange={() => { setEnvironment(environment == "test" ? "prod" : "test") }}
            checked={environment == 'test'}
            uncheckedIcon={<FontAwesomeIcon icon={faBox} className="ml-1.5" />}
            checkedIcon={<FontAwesomeIcon icon={faFlask} className="ml-2.5" color="#ffffff" />}
            offColor="#474752"
            onColor="#f39c12"
            onHandleColor="#d2d3e0"
            offHandleColor="#d2d3e0"
          /> */}
          {environment == "test" ? <div className="text-sm font-bold m-auto text-[#f39c12]">Test View</div> : <div className="text-sm font-bold m-auto">Production View</div>}
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
        <EndpointList active={selectedTab == Page.Apis} currentFileProperties={currentFileProperties} />
        
        {/* <SectionTitle
          icon="world.svg"
          text="Hosting"
          active={selectedTab == Page.Storage}
          onClick={() => {
            setSelectedTab(Page.Storage);
          }}
        /> */}

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


        {/* <SectionTitle
          icon="brain.svg"
          text="Models"
          active={selectedTab == Page.Storage}
          onClick={() => {
            setSelectedTab(Page.Storage);
          }}
        /> */}

        <UserDropdown />
      </div>
    </div>
  );
}
