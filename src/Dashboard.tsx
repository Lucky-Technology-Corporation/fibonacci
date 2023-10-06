import toast, { Toaster } from "react-hot-toast";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import { useContext, useEffect, useState } from "react";
import { Page } from "./Utilities/Page";
import { useIsAuthenticated } from "react-auth-kit";
import SignIn from "./SignIn";
import CenterContent from "./MainContent/CenterContent";
import { SwizzleContext } from "./Utilities/GlobalContext";
import Lottie from "lottie-react";
import dog from "../public/dog.json";
import useDatabaseApi from "./API/DatabaseAPI";
import Lobby from "./Blockrain/Lobby";
import useApi from "./API/DeploymentAPI";

export default function Dashboard() {
  const isAuthenticated = useIsAuthenticated();
  //Content handler
  const [selectedTab, setSelectedTab] = useState<Page>(Page.Logs);
  //Current file properties handler
  const [currentFileProperties, setCurrentFileProperties] = useState<any>({});
  //Deploy state handler
  const [didDeploy, setDidDeploy] = useState(false);
  //Active collection handler
  const [activeCollection, setActiveCollection] = useState<string>("");
  //Active logs page handler
  const [activeLogsPage, setActiveLogsPage] = useState<string>("analytics");

  const deploymentApi = useApi();

  //Initialization code...
  const { isFree, projects, activeProject, setProjects, isCreatingProject } = useContext(SwizzleContext);
  const { getProjects } = useDatabaseApi();


useEffect(() => {
  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      
      if (!data || data.length === 0) {
        setProjects([]);
        return;
      }
      
      // Initialize the project list to an empty array.
      setProjects([]);

      // Check deployment status for each project
      data.forEach(async project => {
        if (await waitForSuccessfulDeployment(project.ProjectId)) {
          setProjects(prevProjects => [...prevProjects, project]);
        }
      });

    } catch (e) {
      toast.error("Error fetching projects");
      console.error(e);
    }
  };

  fetchProjects();
}, []);

const waitForSuccessfulDeployment = async (projectId, delay = 5000) => {
  try {
    const response = await deploymentApi.getProjectDeploymentStatus(projectId);

    if (response.Status === "DEPLOYMENT_SUCCESS") {
      return true;
    } else {
      // Wait for a while and try again
      await new Promise(res => setTimeout(res, delay));
      return await waitForSuccessfulDeployment(projectId);
    }
  } catch (error) {
    console.error(`Failed to get deployment status for project ${projectId}`, error);
    return false;
  }
};



  if (isAuthenticated()) {
    if (isCreatingProject) {
      return <Lobby />;
    }
    if (projects) {
      return (
        <div
          className="page-wrapper"
          style={{
            transform: isFree ? "rotate(1.5deg)" : "rotate(0deg)",
            transition: "transform 0.5s",
          }}
        >
          <div>
            <Toaster />
          </div>
          <div className="grid grid-cols-[auto,1fr,auto] gap-0">
            <LeftSidebar
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              activeCollection={activeCollection}
              setActiveCollection={setActiveCollection}
              activeLogsPage={activeLogsPage}
              setActiveLogsPage={setActiveLogsPage}
              currentFileProperties={currentFileProperties}
            />

            <CenterContent
              selectedTab={selectedTab}
              setCurrentFileProperties={setCurrentFileProperties}
              didDeploy={didDeploy}
              setDidDeploy={setDidDeploy}
              activeCollection={activeCollection}
              activeLogsPage={activeLogsPage}
            />

            <RightSidebar selectedTab={selectedTab} currentFileProperties={currentFileProperties} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full mt-12 text-center">
          <Lottie animationData={dog} loop={true} className="w-48 h-48 m-auto" />
          <div className="mt-[-32px]">Preparing your dashboard...</div>
        </div>
      );
    }
  } else {
    return <SignIn />;
  }
}
