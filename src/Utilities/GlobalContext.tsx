import React, { createContext, useContext, useState } from "react";

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
  const [activeEndpoint, setActiveEndpoint] = useState("");
  const [activeFile, setActiveFile] = useState("");
  const [ideReady, setIdeReady] = useState(false); 

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
        setActiveFile
      }}
    >
      {children}
    </SwizzleContext.Provider>
  );
};
