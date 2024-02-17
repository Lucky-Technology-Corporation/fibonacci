import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import useDatabaseApi from "../API/DatabaseAPI";
import useDeploymentApi from "../API/DeploymentAPI";
import useEndpointApi from "../API/EndpointAPI";
import useSettingsApi from "../API/SettingsAPI";
import Dropdown from "../Utilities/Dropdown";
import FullPageModal from "../Utilities/FullPageModal";
import { SwizzleContext } from "../Utilities/GlobalContext";

export default function ProjectSelector({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: any;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { refreshFermatJwt } = useEndpointApi();
  const deploymentApi = useDeploymentApi();
  const { addEmailToAccount, hasAddedPaymentMethod } = useSettingsApi();
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
    setIdeReady,
    hasPaymentMethod,
    setHasPaymentMethod,
    setProjectDeploymentFailure
  } = useContext(SwizzleContext);

  const startPolling = async (projectId) => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      const deploymentStatus = await checkDeploymentStatus(projectId);
      if (deploymentStatus === "DEPLOYMENT_SUCCESS") {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsModalOpen(false);
        setIsCreatingProject(false);
        await setCurrentProject(projectId);
        setTimeout(() => {
          location.reload();
        }, 7000)
      } else if (deploymentStatus === "DEPLOYMENT_FAILURE") {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsModalOpen(false);
        setIsCreatingProject(false);
        setProjectDeploymentFailure(true)
        // toast.error("There's an issue with this project. Please email support@swizzle.co");
        // setTimeout(() => {
        //   location.reload();
        // }, 250);
      }
    }, POLLING_INTERVAL);
  };

  const [didSave, setDidSave] = useState(false);

  const saveEmail = async (email: string) => {
    if (email == "") {
      toast.error("Please enter an email");
      return;
    }

    try {
      if (didSave) {
        toast("😎");
        return;
      }
      setDidSave(true);
      await addEmailToAccount(email);
      toast.success("We'll let you know when we're ready for you!");
      setTimeout(() => {
        setIsVisible(true);
      }, 250);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add email to waitlist");
    }
  };

  const gtagReportConversion = () => {
    const callback = () => {
      console.log("Conversion reported");
    };

    // Send a conversion event to Google Analytics
    (window as any).gtag("event", "conversion", {
      send_to: "AW-1031579973/QuwbCIHgyoAYEMXS8usD",
      event_callback: callback,
    });
  };

  const createNewProject = (projectName: string) => {
    if (projectName.includes("_") || projectName.includes("-")) {
      toast.error("Project name cannot contain underscores or dashes");
      return;
    }
    setIsCreatingProject(true);
    toast.promise(createProject(projectName), {
      loading: "Provisioning resources...",
      success: () => {
        gtagReportConversion();
        //play sound
        var audio = new Audio("/deploy.mp3");
        audio.play();
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        return "Kicked off project creation!";
      },
      error: () => {
        setIsCreatingProject(false);
        return "Failed to create project. You can only have 1 project at a time.";
      },
    });
  };

  const setCurrentProject = async (id: string) => {
    var project = projects.filter((p) => p.id == id)[0];
    if (project == null) {
      project = projects[0];
    }
    setIdeReady(false);
    const deploymentStatus = await checkDeploymentStatus(project.id);
    switch (deploymentStatus) {
      case "DEPLOYMENT_FAILURE":
        toast.error("Deployment failed");
        return;
      case "DEPLOYMENT_SUCCESS":
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
        setIsCreatingProject(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return true;
      // @ts-expect-error
      case "DEPLOYMENT_SUSPENDED":
        try {
          // For the fall-through case
          project.test_deployment_status = await deploymentApi.restoreProject(project.id);
        } catch (e) {
          console.error(e);
          toast.error("Failed to restore project from suspended state");
          return;
        }
      // FALLS THROUGH
      default:
        setIsModalOpen(true);
        setIsCreatingProject(true);
        startPolling(project.id);
        sessionStorage.setItem("activeProject", project.id);
        sessionStorage.setItem("activeProjectName", project.name);
        setActiveProjectName(project.name);
        setTestDomain(undefined);
        setProdDomain(undefined);
        setTestDeployStatus(project.test_deployment_status);
        setProdDeployStatus(project.prod_deployment_status);
        return false;
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

  const checkIfHasPaymentMethod = async () => {
    const hasPaymentMethod = await hasAddedPaymentMethod();
    setHasPaymentMethod(hasPaymentMethod);
  };

  useEffect(() => {
    if (projects && activeProject == "" && projects.length > 0) {
      var storedActiveProject = sessionStorage.getItem("activeProject");
      if (storedActiveProject != undefined && storedActiveProject != "") {
        setCurrentProject(storedActiveProject);
      } else {
        setCurrentProject(projects[0].id);
      }
      setIsVisible(false);
    } else {
      if (projects.length == 0) {
        setIsVisible(true);
      }
    }
  }, [projects]);

  useEffect(() => {
    if (projects && projects.length > 0 && activeProject != "") {
      if (hasPaymentMethod == null) {
        checkIfHasPaymentMethod();
      }
    }
  }, [activeProject]);

  if (projects == null) return <div className="text-sm mt-3">Loading...</div>;

  return (
    <>
      <Helmet>
        {/* Add AdWords tracking script to the head */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-1031579973"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag() {
              window.dataLayer.push(arguments);
            }
            gtag('js', new Date());

            gtag('config', 'AW-1031579973');
          `}
        </script>
      </Helmet>
      <div className="mx-2 flex flex-nowrap items-center">
        <Dropdown
          children={projects}
          onSelect={(id: string) => {
            sessionStorage.setItem("activeProject", id);
            location.reload();
          }}
          lastChild={{
            id: "_create_new_project",
            name: "+ New Project",
          }}
          lastOnSelect={() => {
            // if (isCreatingProject) {
            //   alert("A project is already being created for you now!");
            //   return;
            // }
            setIsVisible(true);
          }}
          title={activeProjectName}
          direction="center"
          className="fixed"
        />
      </div>

      <FullPageModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        modalDetails={{
          title: "New project",
          description: "Let's get started! What would you like to name your project?",
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
