import { faBox, faFlask } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, SetStateAction, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import Switch from "react-switch";
import useDeploymentApi from "../API/DeploymentAPI";
import DeployButton from "../RightSidebar/DeployButton";
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


  const { getProjectDeploymentStatus } = useDeploymentApi()
  
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

  // useEffect(() => {
  //   if(currentFileProperties == undefined || currentFileProperties.fileUri == undefined){
  //     if(selectedTab == Page.Hosting){
  //       console.log("Setting active file to frontend/src/pages/SwizzleHomePage.tsx")
  //       setActiveFile("frontend/src/pages/SwizzleHomePage.tsx")
  //     } else {
  //       console.log("Setting active file to backend/user-dependencies/get..ts")
  //       setActiveFile("backend/user-dependencies/get..ts")
  //     }
  //   }
  // }, [ideReady])

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
    <div className="leftSidebar pt-1 min-w-[240px] border-r border-gray-700 bg-[#1e1e1e] !overflow-scroll">
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
            className="ml-1 scale-75 env-toggle"
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

        <div className="flex mt-2">
          <ProjectSelector
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen} />
          <DeployButton />
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
        
        <SectionTitle
          icon="/auth.svg"
          text="Users"
          active={selectedTab == Page.Auth}
          onClick={() => {
            if(selectedTab == Page.Auth){ setSelectedTab(null) }
            else { setSelectedTab(Page.Auth); }
          }}
          className="user-tab"
        />
        <AuthSettings active={selectedTab == Page.Auth} className="auth-method" />
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
            className="backend-tab"
          />
        </div>
        <EndpointList active={selectedTab == Page.Apis} />

        <div className="py-1 w-full">
          <div className="h-[1px] bg-gray-700 w-full mt-4"></div>
        </div>

        <div className={!ideReady ? "w-full opacity-50 pointer-events-none" : "w-full"}>
          <SectionTitle
            icon="/world.svg"
            text="Frontend"
            active={selectedTab == Page.Hosting}
            onClick={() => {
              if(selectedTab == Page.Hosting){ setSelectedTab(null) }
              else { setSelectedTab(Page.Hosting); }
            }}
            className="frontend-tab"
        />
        </div>
        <FilesList active={selectedTab == Page.Hosting} />


        <div className="py-1 w-full">
          <div className="h-[1px] bg-gray-700 w-full mt-4"></div>
        </div>

        <SectionTitle
          icon="/database.svg"
          text="Database"
          active={selectedTab == Page.Db}
          onClick={() => {
            if(selectedTab == Page.Db){ setSelectedTab(null) }
            else { setSelectedTab(Page.Db); }
          }}
          className="database-tab"
        />
        <CollectionList
          active={selectedTab == Page.Db}
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
        />

        <SectionTitle
          icon="/files.svg"
          text="Files"
          active={selectedTab == Page.Storage}
          onClick={() => {
            if(selectedTab == Page.Storage){ setSelectedTab(null) }
            else { setSelectedTab(Page.Storage); }
          }}
          className="storage-tab"
        />


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

        {/* <div className={`h-[500px] flex-row w-full`}>
          <div className="h-[500px]"></div>
        </div> */}

        <UserDropdown />
      </div>
    </div>
  );
}
