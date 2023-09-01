import React, { createContext, useContext, useState } from "react";

export const SwizzleContext = createContext(undefined);

export const GlobalContextProvider = ({ children }) => {
  const [projects, setProjects] = useState(null);
  const [activeProject, setActiveProject] = useState("");
  const [activeProjectName, setActiveProjectName] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [domain, setDomain] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [postMessage, setPostMessage] = useState(null);

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
        isCreatingProject,
        setIsCreatingProject,
        activeToast,
        setActiveToast,
        postMessage,
        setPostMessage,
      }}
    >
      {children}
    </SwizzleContext.Provider>
  );
};
