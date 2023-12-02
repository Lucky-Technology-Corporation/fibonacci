import { Dispatch, SetStateAction, createContext, useState } from "react";
import { ProjectResponse } from "../API/DatabaseAPI";
import { ProjectDeploymentStatus } from "../API/DeploymentAPI";

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
  const [activeEndpoint, setActiveEndpoint] = useState("backend/user-dependencies/get..ts");
  const [activeFile, setActiveFile] = useState("frontend/src/pages/SwizzleHomePage.tsx");
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
  const [selectedText, setSelectedText] = useState("")

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
        setSelectedText
      }}
    >
      {children}
    </SwizzleContext.Provider>
  );
};
