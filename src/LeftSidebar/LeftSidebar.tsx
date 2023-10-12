import { faBox, faFlask } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, SetStateAction, useContext, useEffect, useRef } from "react";
import Switch from "react-switch";
import UserDropdown from "../UserDropdown";
import { SwizzleContext } from "../Utilities/GlobalContext";
import { Page } from "../Utilities/Page";
import EndpointList from "./APIs/EndpointList";
import FilesList from "./APIs/FilesList";
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
  const { setEnvironment, environment, setActiveEndpoint, setActiveFile, activeEndpoint, activeFile, setPostMessage } =
    useContext(SwizzleContext);

  //File management + sidebar management code
  const programmatiFileUpdateRef = useRef(false);

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
    if (programmatiFileUpdateRef.current) {
      programmatiFileUpdateRef.current = false;
      return;
    }
    console.log("open activeFile", activeFile);
    if (currentFileProperties && currentFileProperties.fileUri) {
      const currenfFile = currentFileProperties.fileUri.replace("file:///swizzle/code/", "");
      if (currenfFile == activeFile) return;
    }
    if (activeFile == undefined || activeFile == ""){
      setPostMessage({
        type: "openFile",
        fileName: `frontend/src/App.js`,
      });
      return
    } else{
      setPostMessage({
        type: "openFile",
        fileName: `frontend/src/${activeFile}`,
      });
    }
  };

  const openActiveEndpoint = () => {
    if (programmatiFileUpdateRef.current) {
      programmatiFileUpdateRef.current = false;
      return;
    }
    if (activeEndpoint == undefined || activeEndpoint == "") return;
    console.log("open activeEndpoint", activeEndpoint);
    var fileName = activeEndpoint.replace(/\//g, "-").replace(/:/g, "_");

    if (fileName.startsWith("!helper!")) {
      fileName = fileName.replace("!helper!", "");
      if (currentFileProperties && currentFileProperties.fileUri) {
        const currentFile = currentFileProperties.fileUri.replace("file:///swizzle/code/", "");
        if (currentFile == `user-helpers/${fileName}.js`) return;
      }

      setPostMessage({
        type: "openFile",
        fileName: `backend/user-helpers/${fileName}.js`,
      });

      programmatiFileUpdateRef.current = true;
      setActiveEndpoint(activeEndpoint.replace("!helper!", ""));
    } else {
      if (currentFileProperties && currentFileProperties.fileUri) {
        const currentFile = currentFileProperties.fileUri.replace("file:///swizzle/code/", "");
        if (currentFile == `backend/user-dependencies/${fileName}.js`) return;
      }

      setPostMessage({
        type: "openFile",
        fileName: `backend/user-dependencies/${fileName}.js`,
      });
    }
  };

  useEffect(() => {
    if (currentFileProperties == undefined || currentFileProperties.fileUri == undefined) {
      return;
    }

    if (currentFileProperties.fileUri.includes("user-dependencies")) {
      const newEndpoint = currentFileProperties.fileUri
        .split("user-dependencies/")[1]
        .replace(".js", "")
        .replace(/-/g, "/")
        .replace(/_/g, ":");
      if (newEndpoint == activeEndpoint) return;
      programmatiFileUpdateRef.current = true;
      setActiveEndpoint(newEndpoint);
    }

    if (currentFileProperties.fileUri.includes("user-hosting")) {
      const newFile = currentFileProperties.fileUri.split("user-hosting/")[1];
      if (newFile == activeFile) return;
      programmatiFileUpdateRef.current = true;
      setActiveFile(newFile);
    }
  }, [currentFileProperties]);

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
              setEnvironment(environment == "test" ? "prod" : "test");
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
          <ProjectSelector />
        </div>

        <SectionTitle
          icon="/monitor.svg"
          text="Monitoring"
          active={selectedTab == Page.Logs}
          onClick={() => {
            setSelectedTab(Page.Logs);
          }}
        />
        <LogsList active={selectedTab == Page.Logs} activePage={activeLogsPage} setActivePage={setActiveLogsPage} />

        <div className="py-1 w-full">
          <div className="h-[1px] bg-gray-700 w-full mt-4"></div>
        </div>
        <SectionTitle
          icon="/cloud.svg"
          text="Backend"
          active={selectedTab == Page.Apis}
          onClick={() => {
            setSelectedTab(Page.Apis);
          }}
        />
        <EndpointList active={selectedTab == Page.Apis} />

        <SectionTitle
          icon="/database.svg"
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
          icon="/files.svg"
          text="Storage"
          active={selectedTab == Page.Storage}
          onClick={() => {
            setSelectedTab(Page.Storage);
          }}
        />

        <SectionTitle
          icon="/auth.svg"
          text="Users"
          active={selectedTab == Page.Auth}
          onClick={() => {
            setSelectedTab(Page.Auth);
          }}
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

        <SectionTitle
          icon="/world.svg"
          text="Frontend"
          active={selectedTab == Page.Hosting}
          onClick={() => {
            setSelectedTab(Page.Hosting);
          }}
        />
        <FilesList active={selectedTab == Page.Hosting} />

        <SectionTitle
          icon="/bell.svg"
          text="Notifications"
          active={selectedTab == Page.Notifications}
          onClick={() => {
            setSelectedTab(Page.Notifications);
          }}
        />

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
