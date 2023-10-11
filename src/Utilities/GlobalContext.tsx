import { createContext, useEffect, useState } from "react";

export const SwizzleContext = createContext(undefined);

export const GlobalContextProvider = ({ children }) => {
  const [environment, setEnvironment] = useState("test"); // ["test", "prod"]
  const [projects, setProjects] = useState(null);
  const [activeProject, setActiveProject] = useState("");
  const [activeProjectName, setActiveProjectName] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [domain, setDomain] = useState("");
  const [testDomain, setTestDomain] = useState("");
  const [prodDomain, setProdDomain] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [postMessage, setPostMessage] = useState(null);
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [activeHelper, setActiveHelper] = useState(null);
  const [ideReady, setIdeReady] = useState(false);
  const [testDeployStatus, setTestDeployStatus] = useState("live");
  const [prodDeployStatus, setProdDeployStatus] = useState("pending");
  const [fermatJwt, setFermatJwt] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [shouldRefreshList, setShouldRefreshList] = useState(false);
  const [packageToInstall, setPackageToInstall] = useState("");
  
  const [mousePosition, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (event) => {
      setPosition({
          x: event.clientX,
          y: event.clientY
      });
  };
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
        mousePosition
      }}
    >
      {children}
    </SwizzleContext.Provider>
  );
};
