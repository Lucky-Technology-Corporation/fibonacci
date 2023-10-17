import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useDatabaseApi from "../API/DatabaseAPI";
import useApi from "../API/DeploymentAPI";
import useEndpointApi from "../API/EndpointAPI";
import Dropdown from "../Utilities/Dropdown";
import FullPageModal from "../Utilities/FullPageModal";
import { SwizzleContext } from "../Utilities/GlobalContext";

export default function ProjectSelector({ isModalOpen, setIsModalOpen }: { isModalOpen: any, setIsModalOpen: Dispatch<SetStateAction<boolean>> }){
  const [isVisible, setIsVisible] = useState(false);
  const { refreshFermatJwt } = useEndpointApi();
  const deploymentApi = useApi();
  const POLLING_INTERVAL = 5000;
  const pollingRef = useRef(null);
  const { createProject } = useDatabaseApi();
  const {
    projects,
    activeProject,
    setActiveProject,
    activeProjectName,
    setActiveProjectName,
    setDomain,
    setTestDomain,
    testDomain,
    setProdDomain,
    prodDomain,
    setIsCreatingProject,
    isCreatingProject,
    environment,
    setTestDeployStatus,
    setProdDeployStatus,
    setFermatJwt,
  } = useContext(SwizzleContext);

  const startPolling = async (projectId) => {
    if (pollingRef.current) return; 
    pollingRef.current = setInterval(async () => {
      const deploymentStatus = await checkDeploymentStatus(projectId);
      if (deploymentStatus === "DEPLOYMENT_SUCCESS") {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsModalOpen(false);
        await setCurrentProject(projectId)
        location.reload()
      }
    }, POLLING_INTERVAL);
  };

  const createNewProject = (projectName: string) => {
    setIsCreatingProject(true);
    toast.promise(createProject(projectName), {
      loading: "Creating project...",
      success: () => {
        window.location.reload();
        return "Created project!";
      },
      error: () => {
        setIsCreatingProject(false);
        return "Failed to create project";
      },
    });
  };

  const setCurrentProject = async (id: string) => {
    const project = projects.filter((p) => p.id == id)[0];
    if (project == null) return;

    const deploymentStatus = await checkDeploymentStatus(project.id);
    if (deploymentStatus !== "DEPLOYMENT_SUCCESS") {
      setIsModalOpen(true);
      startPolling(project.id);
      sessionStorage.setItem("activeProject", project.id);
      sessionStorage.setItem("activeProjectName", project.name);
      setActiveProjectName(project.name);
      return false
    } else {
      setActiveProjectName(project.name);
      setActiveProject(project.id);
  
      // Update the context values only if the deployment was successful
      setTestDeployStatus(project.test_deployment_status);
      setProdDeployStatus(project.prod_deployment_status);
  
      await refreshFermatJwt(project.id);
  
      sessionStorage.setItem("activeProject", project.id);
      sessionStorage.setItem("activeProjectName", project.name);
  
      setTestDomain(project.test_swizzle_domain);
      setProdDomain(project.prod_swizzle_domain);
  
      if (environment == "test") {
        setDomain(project.test_swizzle_domain);
      } else {
        setDomain(project.prod_swizzle_domain);
      }
  
      setIsModalOpen(false);
      if (pollingRef.current) {
        clearInterval(pollingRef.current); 
        pollingRef.current = null;
      }
      return true
    }
  };  

  useEffect(() => {
    if (environment == "test") {
      setDomain(testDomain);
    } else {
      setDomain(prodDomain);
    }
  }, [environment]);

  useEffect(() => { 
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const checkDeploymentStatus = async (projectId) => {
    try {
      const response = await deploymentApi.getProjectDeploymentStatus(projectId);
      return response;
    } catch (error) {
      console.error(`Failed to get deployment status for project ${projectId}`, error);
      return null;
    }
  };
  

  useEffect(() => {
    if (projects && activeProject == "" && projects.length > 0) {
      var storedActiveProject = sessionStorage.getItem("activeProject");
      if (storedActiveProject != undefined && storedActiveProject != "") {
        setCurrentProject(storedActiveProject);
      } else {
        setCurrentProject(projects[0].id);
      }
    } else {
      if (projects.length == 0) {
        setIsVisible(true);
      }
    }
  }, [projects]);

  if (projects == null) return <div className="text-sm mt-3">Loading...</div>;

  return (
    <>
      <div className="mx-2 mt-2 max-w-full flex flex-nowrap items-center">
        <Dropdown
          children={projects}
          onSelect={(id: string) => {
            setCurrentProject(id);
          }}
          lastChild={{
            id: "_create_new_project",
            name: "+ New Project",
          }}
          lastOnSelect={() => {
            if (isCreatingProject) {
              alert("A project is already being created for you now!");
              return;
            }
            setIsVisible(true);
          }}
          title={activeProjectName}
          direction="center"
        />
      </div>
      

      <FullPageModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        regexPattern={/^[a-zA-Z][a-zA-Z0-9\s]{1,64}$/}
        errorMessage="Names must start a letter and not contain special characters."
        modalDetails={{
          title: "🥋 New project",
          description: (<></>),
          placeholder: "My awesome project",
          confirmText: "Create",
          confirmHandler: createNewProject,
          shouldShowInput: true,
          shouldHideCancel: projects.length == 0,
        }}
      />
    </>
  );
}
