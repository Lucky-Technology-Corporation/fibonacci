import React, { createContext, useContext, useState } from 'react';

export const SwizzleContext = createContext(undefined);

export const GlobalContextProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState("");
    const [activeProjectName, setActiveProjectName] = useState("");

    return (
      <SwizzleContext.Provider value={{ projects, setProjects, activeProject, setActiveProject, activeProjectName, setActiveProjectName }}>
        {children}
      </SwizzleContext.Provider>
    );
};