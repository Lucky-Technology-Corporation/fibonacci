import { faBox, faFlask } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, SetStateAction, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import Switch from "react-switch";
import useApi from "../API/DeploymentAPI";
import UserDropdown from "../UserDropdown";
import { endpointToFilename, filenameToEndpoint } from "../Utilities/EndpointParser";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { Page } from "../Utilities/Page";
import EndpointList from "./APIs/EndpointList";
import FilesList from "./APIs/FilesList";
import AuthSettings from "./Auth/AuthSettings";
import CollectionList from "./Database/CollectionList";
import LogsList from "./Monitoring/LogsList";
import ProjectSelector from "./ProjectSelector";
import SectionTitle from "./SectionTitle";

type LeftSidebarProps = {
  selectedTab: Page;
  setSelectedTab: Dispatch<SetStateAction<Page>>;
  activeCollection: string;
  setActiveCollection: Dispatch<SetStateAction<string>>;
  activeLogsPage: string;
  setActiveLogsPage: Dispatch<SetStateAction<string>>;
  currentFileProperties: any;
  isModalOpen: any;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function LeftSidebar({
  selectedTab,
  setSelectedTab,
  activeCollection,
  setActiveCollection,
  activeLogsPage,
  setActiveLogsPage,
  currentFileProperties,
  isModalOpen, 
  setIsModalOpen,
}: LeftSidebarProps) {
  const { setEnvironment, environment, setActiveEndpoint, setActiveFile, activeEndpoint, activeFile, setPostMessage, activeProject, ideReady } =
    useContext(SwizzleContext);


  const { getProjectDeploymentStatus } = useApi()
  
  useEffect(() => {
    openActiveEndpoint();
  }, [activeEndpoint]);

  useEffect(() => {
    openActiveFile();
  }, [activeFile]);

  useEffect(() => {
    if (selectedTab == Page.Hosting) {
      openActiveFile();
    } else if (selectedTab == Page.Apis) {
      openActiveEndpoint();
    }
  }, [selectedTab]);


  const openActiveFile = () => {
    if (currentFileProperties && currentFileProperties.fileUri) {
      const currentFile = currentFileProperties.fileUri.replace("file:///swizzle/code/", "");
      if (currentFile == activeFile) {
        return
      };
    }
    setPostMessage({
      type: "openFile",
      fileName: `/${activeFile}`,
    });
  };

  const openActiveEndpoint = () => {
    if (activeEndpoint == undefined || activeEndpoint == "") return;
    var fileName = endpointToFilename(activeEndpoint)

    if (fileName.startsWith("!helper!")) {
      //Check if we're already on the helper
      fileName = fileName.replace("!helper!", "");
      if (currentFileProperties && currentFileProperties.fileUri) {
        const currentFile = currentFileProperties.fileUri.replace("file:///swizzle/code/", "");
        if (currentFile == `backend/helpers/${fileName}`) return;
      }
      //Open the helper
      setPostMessage({
        type: "openFile",
        fileName: `/backend/helpers/${fileName}`,
      });
      setActiveEndpoint(activeEndpoint.replace("!helper!", ""));
    } else {
      //Check if we're already on the endpoint
      if (currentFileProperties && currentFileProperties.fileUri) {
        const currentFile = currentFileProperties.fileUri.replace("file:///swizzle/code/", "");
        const currentEndpoint = filenameToEndpoint(currentFile)
        if (currentEndpoint.replace("backend/user-dependencies/", "") == activeEndpoint) {
          return
        };
      }
      //Open the endpoint
      setPostMessage({
        type: "openFile",
        fileName: `/backend/user-dependencies/${fileName}`,
      });
    }
  };

  useEffect(() => {
    console.log("currentFileProperties", currentFileProperties)
    if (currentFileProperties == undefined || currentFileProperties.fileUri == undefined || !currentFileProperties.fileUri.startsWith("file:///")) {
      return;
    }
    if (currentFileProperties.fileUri.includes("backend")) {
      if(selectedTab != Page.Apis){
        setSelectedTab(Page.Apis)
      }
      if (currentFileProperties.fileUri.includes("backend/helpers/")) {
        const newEndpoint = filenameToEndpoint(currentFileProperties.fileUri.split("helpers/")[1])
        setActiveEndpoint("!helper!"+newEndpoint);
      } else if(currentFileProperties.fileUri.includes("user-dependencies/")){
        const newEndpoint = filenameToEndpoint(currentFileProperties.fileUri.split("user-dependencies/")[1])
        setActiveEndpoint(newEndpoint);
      } else{
        setActiveEndpoint(null)
      }
    }

    if (currentFileProperties.fileUri.includes("frontend")) {
      if(selectedTab != Page.Hosting){
        setSelectedTab(Page.Hosting)
      }
      const newFile = currentFileProperties.fileUri.replace("file:///swizzle/code/", "");
      setActiveFile(newFile);
    }
  }, [currentFileProperties]);

  useEffect(() => {
    if(currentFileProperties == undefined || currentFileProperties.fileUri == undefined){
      if(selectedTab == Page.Hosting){
        setActiveFile("frontend/src/pages/Home.tsx")
      } else {
        setActiveFile("backend/user-dependencies/get..ts")
      }
    }
  }, [ideReady])

  const changeEnvironment = async (env) => {
    const status = await getProjectDeploymentStatus(activeProject, env)
    if (status == "DEPLOYMENT_SUCCESS") {
      setEnvironment(env);
      return Promise.resolve()
    } else {
      return Promise.reject("Still deploying to " + (env == 'test' ? "test" : "production"));
    }
  }

  return (
    <div className="min-w-[240px] border-r border-[#4C4F6B] bg-[#191A23] overflow-scroll">
      <div className="flex flex-col items-center pt-4 h-screen">
        <div className="flex">
          <img src="/logo_offwhite.png" className="w-4 h-4 m-auto mr-1.5" />
          <h1 className="font-bold text-md">Swizzle</h1>
        </div>
        <div className="flex mt-2">
          {environment == "test" ? (
            <div className="text-sm font-bold m-auto text-[#f39c12]">Test View</div>
          ) : (
            <div className="text-sm font-bold m-auto">Production View</div>
          )}
          <Switch
            className="ml-1 scale-75"
            onChange={() => {
              toast.promise(changeEnvironment(environment == "test" ? "prod" : "test"), {
                loading: "Switching environment...",
                success: () => {
                  return "Switched to " + (environment == 'test' ? "production" : "test");
                },
                error: (e) => {
                  return e
                }
              })
            }}
            checked={environment == "test"}
            uncheckedIcon={<FontAwesomeIcon icon={faBox} className="ml-1.5" />}
            checkedIcon={<FontAwesomeIcon icon={faFlask} className="ml-2.5" color="#ffffff" />}
            offColor="#474752"
            onColor="#f39c12"
            onHandleColor="#d2d3e0"
            offHandleColor="#d2d3e0"
          />
        </div>

        <div className="flex">
          <ProjectSelector
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen} />
        </div>

        <SectionTitle
          icon="/monitor.svg"
          text="Monitoring"
          active={selectedTab == Page.Logs}
          onClick={() => {
            if(selectedTab == Page.Logs){ setSelectedTab(null) }
            else { setSelectedTab(Page.Logs); }
          }}
        />
        <LogsList active={selectedTab == Page.Logs} activePage={activeLogsPage} setActivePage={setActiveLogsPage} />

        <div className="py-1 w-full">
          <div className="h-[1px] bg-gray-700 w-full mt-4"></div>
        </div>
        <div className={!ideReady ? "w-full opacity-50 pointer-events-none" : "w-full"}>
          <SectionTitle
            icon="/cloud.svg"
            text="Backend"
            active={selectedTab == Page.Apis}
            onClick={() => {
              if(selectedTab == Page.Apis){ setSelectedTab(null) }
              else { setSelectedTab(Page.Apis); }
            }}
          />
        </div>
        <EndpointList active={selectedTab == Page.Apis} />

        <SectionTitle
          icon="/database.svg"
          text="Database"
          active={selectedTab == Page.Db}
          onClick={() => {
            if(selectedTab == Page.Db){ setSelectedTab(null) }
            else { setSelectedTab(Page.Db); }
          }}
        />
        <CollectionList
          active={selectedTab == Page.Db}
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
        />

        <SectionTitle
          icon="/files.svg"
          text="Storage"
          active={selectedTab == Page.Storage}
          onClick={() => {
            if(selectedTab == Page.Storage){ setSelectedTab(null) }
            else { setSelectedTab(Page.Storage); }
          }}
        />

        <SectionTitle
          icon="/auth.svg"
          text="Users"
          active={selectedTab == Page.Auth}
          onClick={() => {
            if(selectedTab == Page.Auth){ setSelectedTab(null) }
            else { setSelectedTab(Page.Auth); }
          }}
        />
        <AuthSettings active={selectedTab == Page.Auth} />

        <div className="py-1 w-full">
          <div className="h-[1px] bg-gray-700 w-full mt-4"></div>
        </div>

        {/* <SectionTitle
          icon="/paintbrush.svg"
          text="Frontend"
          active={selectedTab == Page.AppCode}
          onClick={() => {
            setSelectedTab(Page.AppCode);
          }}
        /> */}

        <div className={!ideReady ? "w-full opacity-50 pointer-events-none" : "w-full"}>
          <SectionTitle
            icon="/world.svg"
            text="Frontend"
            active={selectedTab == Page.Hosting}
            onClick={() => {
              if(selectedTab == Page.Hosting){ setSelectedTab(null) }
              else { setSelectedTab(Page.Hosting); }
            }}
        />
        </div>
        <FilesList active={selectedTab == Page.Hosting} />

        {/* Working, but temporarily hidden */}
        {/* <SectionTitle
          icon="/bell.svg"
          text="Notifications"
          active={selectedTab == Page.Notifications}
          onClick={() => {
            setSelectedTab(Page.Notifications);
          }}
        /> */}

        <div className="h-36 w-full flex-row">
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
        </div>

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
