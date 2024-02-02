import { Dispatch, SetStateAction, createContext, useState } from "react";
import { ProjectResponse } from "../API/DatabaseAPI";
import { ProjectDeploymentStatus } from "../API/DeploymentAPI";
import { Page } from "./Page";

export type ProjectEnvironment = "test" | "prod";

export interface SwizzleContextType {
  projects: ProjectResponse[] | null;
  setProjects: Dispatch<SetStateAction<ProjectResponse[] | null>>;
  activeProject: string;
  setActiveProject: Dispatch<SetStateAction<string>>;
  activeProjectName: string;
  setActiveProjectName: Dispatch<SetStateAction<string>>;
  isFree;
  setIsFree;
  domain: string;
  setDomain: React.Dispatch<React.SetStateAction<string>>;
  testDomain;
  setTestDomain;
  prodDomain;
  setProdDomain;
  isCreatingProject;
  setIsCreatingProject;
  activeToast;
  setActiveToast;
  postMessage;
  setPostMessage;
  activeEndpoint: string;
  setActiveEndpoint: Dispatch<SetStateAction<string>>;
  environment: ProjectEnvironment;
  setEnvironment: Dispatch<SetStateAction<ProjectEnvironment>>;
  ideReady;
  setIdeReady;
  activeFile;
  setActiveFile;
  testDeployStatus: ProjectDeploymentStatus;
  setTestDeployStatus: Dispatch<SetStateAction<ProjectDeploymentStatus>>;
  prodDeployStatus: ProjectDeploymentStatus;
  setProdDeployStatus: Dispatch<SetStateAction<ProjectDeploymentStatus>>;
  fermatJwt;
  setFermatJwt;
  figmaToken;
  setFigmaToken;
  activeHelper;
  setActiveHelper;
  shouldRefreshList;
  setShouldRefreshList;
  mousePosition;
  setMousePosition;
  shouldOverlay;
  setShouldOverlay;
  hasPaymentMethod;
  setHasPaymentMethod;
  fullEndpointList;
  setFullEndpointList;
  openUri;
  setOpenUri;
  refreshTheia;
  setRefreshTheia;
  selectedText;
  setSelectedText;
  currentDbQuery;
  setCurrentDbQuery;
  selectedTab: Page;
  setSelectedTab: Dispatch<SetStateAction<Page>>;
  currentFileProperties: any;
  setCurrentFileProperties: Dispatch<SetStateAction<any>>;
  activeCollection: string;
  setActiveCollection: Dispatch<SetStateAction<string>>;
  swizzleActionDispatch: any;
  setSwizzleActionDispatch: Dispatch<SetStateAction<any>>;
  fileErrors: string;
  setFileErrors: Dispatch<SetStateAction<string>>;
  activePage: string;
  setActivePage: Dispatch<SetStateAction<string>>;
  taskQueue: any;
  setTaskQueue: Dispatch<SetStateAction<any>>;
  fullTaskQueue: any;
  setFullTaskQueue: Dispatch<SetStateAction<any>>;
  frontendRestarting: boolean;
  setFrontendRestarting: Dispatch<SetStateAction<boolean>>;
  activeAuthPage: string;
  setActiveAuthPage: Dispatch<SetStateAction<string>>;
  shouldRefreshAuth: boolean;
  setShouldRefreshAuth: Dispatch<SetStateAction<boolean>>;
  codeMode: string;
  setCodeMode: Dispatch<SetStateAction<string>>;
  shouldCreateObject: boolean;
  setShouldCreateObject: Dispatch<SetStateAction<boolean>>;
}

export const SwizzleContext = createContext<SwizzleContextType>(undefined);

export const GlobalContextProvider = ({ children }) => {
  const [environment, setEnvironment] = useState<ProjectEnvironment>("test");
  const [projects, setProjects] = useState<ProjectResponse[]>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(null);
  const [activeProject, setActiveProject] = useState("");
  const [activeProjectName, setActiveProjectName] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [domain, setDomain] = useState("");
  const [testDomain, setTestDomain] = useState("");
  const [prodDomain, setProdDomain] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [postMessage, setPostMessage] = useState(null);
  const [activeEndpoint, setActiveEndpoint] = useState(undefined);
  const [activeFile, setActiveFile] = useState(undefined);
  const [openUri, setOpenUri] = useState(null);
  const [activeHelper, setActiveHelper] = useState(null);
  const [ideReady, setIdeReady] = useState(false);
  const [testDeployStatus, setTestDeployStatus] = useState<ProjectDeploymentStatus>("DEPLOYMENT_IN_PROGRESS");
  const [prodDeployStatus, setProdDeployStatus] = useState<ProjectDeploymentStatus>("DEPLOYMENT_IN_PROGRESS");
  const [fermatJwt, setFermatJwt] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [shouldRefreshList, setShouldRefreshList] = useState(false);
  const [shouldOverlay, setShouldOverlay] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [fullEndpointList, setFullEndpointList] = useState<any[]>([]);
  const [refreshTheia, setRefreshTheia] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [currentDbQuery, setCurrentDbQuery] = useState("");
  const [swizzleActionDispatch, setSwizzleActionDispatch] = useState<any>(null);
  const [fileErrors, setFileErrors] = useState<string>("");
  const [activePage, setActivePage] = useState<string>(undefined);
  const [frontendRestarting, setFrontendRestarting] = useState<boolean>(false);
  const [activeAuthPage, setActiveAuthPage] = useState<string>("list");
  const [shouldRefreshAuth, setShouldRefreshAuth] = useState<boolean>(false);
  const [codeMode, setCodeMode] = useState("code");
  const [shouldCreateObject, setShouldCreateObject] = useState<boolean>(false);
  //Content handler
  const [selectedTab, setSelectedTab] = useState<Page>(Page.Logs);
  //Current file properties handler
  const [currentFileProperties, setCurrentFileProperties] = useState<any>({});
  //Active collection handler
  const [activeCollection, setActiveCollection] = useState<string>("");

  //Code generation task list
  const [taskQueue, setTaskQueue] = useState<any>([]);
  const [fullTaskQueue, setFullTaskQueue] = useState<any>([]);

  return (
    <SwizzleContext.Provider
      value={{
        projects,
        setProjects,
        activeProject,
        setActiveProject,
        activeProjectName,
        setActiveProjectName,
        isFree,
        setIsFree,
        domain,
        setDomain,
        testDomain,
        setTestDomain,
        prodDomain,
        setProdDomain,
        isCreatingProject,
        setIsCreatingProject,
        activeToast,
        setActiveToast,
        postMessage,
        setPostMessage,
        activeEndpoint,
        setActiveEndpoint,
        environment,
        setEnvironment,
        ideReady,
        setIdeReady,
        activeFile,
        setActiveFile,
        testDeployStatus,
        setTestDeployStatus,
        prodDeployStatus,
        setProdDeployStatus,
        fermatJwt,
        setFermatJwt,
        figmaToken,
        setFigmaToken,
        activeHelper,
        setActiveHelper,
        shouldRefreshList,
        setShouldRefreshList,
        mousePosition,
        setMousePosition,
        shouldOverlay,
        setShouldOverlay,
        hasPaymentMethod,
        setHasPaymentMethod,
        fullEndpointList,
        setFullEndpointList,
        openUri,
        setOpenUri,
        refreshTheia,
        setRefreshTheia,
        selectedText,
        setSelectedText,
        currentDbQuery,
        setCurrentDbQuery,
        selectedTab,
        setSelectedTab,
        currentFileProperties,
        setCurrentFileProperties,
        activeCollection,
        setActiveCollection,
        swizzleActionDispatch,
        setSwizzleActionDispatch,
        fileErrors,
        setFileErrors,
        activePage,
        setActivePage,
        taskQueue,
        setTaskQueue,
        fullTaskQueue,
        setFullTaskQueue,
        frontendRestarting,
        setFrontendRestarting,
        activeAuthPage,
        setActiveAuthPage,
        shouldRefreshAuth,
        setShouldRefreshAuth,
        codeMode,
        setCodeMode,
        shouldCreateObject,
        setShouldCreateObject
      }}
    >
      {children}
    </SwizzleContext.Provider>
  );
};
