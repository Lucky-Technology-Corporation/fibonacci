import { createContext, useState } from "react";

export interface SwizzleContextType {
  projects;
  setProjects;
  activeProject;
  setActiveProject;
  activeProjectName;
  setActiveProjectName;
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
  setActiveEndpoint;
  environment;
  setEnvironment;
  ideReady;
  setIdeReady;
  activeFile;
  setActiveFile;
  testDeployStatus;
  setTestDeployStatus;
  prodDeployStatus;
  setProdDeployStatus;
  fermatJwt;
  setFermatJwt;
  figmaToken;
  setFigmaToken;
  activeHelper;
  setActiveHelper;
  shouldRefreshList;
  setShouldRefreshList;
  packageToInstall;
  setPackageToInstall;
  mousePosition;
  setMousePosition;
  shouldOverlay;
  setShouldOverlay;
  hasPaymentMethod;
  setHasPaymentMethod;
}

export const SwizzleContext = createContext<SwizzleContextType>(undefined);

export const GlobalContextProvider = ({ children }) => {
  const [environment, setEnvironment] = useState("test"); // ["test", "prod"]
  const [projects, setProjects] = useState(null);
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
  const [activeHelper, setActiveHelper] = useState(null);
  const [ideReady, setIdeReady] = useState(false);
  const [testDeployStatus, setTestDeployStatus] = useState("DEPLOYMENT_IN_PROGRESS");
  const [prodDeployStatus, setProdDeployStatus] = useState("DEPLOYMENT_IN_PROGRESS");
  const [fermatJwt, setFermatJwt] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [shouldRefreshList, setShouldRefreshList] = useState(false);
  const [packageToInstall, setPackageToInstall] = useState("");
  const [shouldOverlay, setShouldOverlay] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        packageToInstall,
        setPackageToInstall,
        mousePosition,
        setMousePosition,
        shouldOverlay,
        setShouldOverlay,
        hasPaymentMethod,
        setHasPaymentMethod,
      }}
    >
      {children}
    </SwizzleContext.Provider>
  );
};
