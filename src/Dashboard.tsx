import Lottie from "lottie-react";
import { initIntercomWindow } from 'next-intercom';
import { useContext, useEffect, useState } from "react";
import { useAuthUser, useIsAuthenticated } from "react-auth-kit";
import toast, { Toaster } from "react-hot-toast";
import dog from "../public/dog.json";
import useDatabaseApi from "./API/DatabaseAPI";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import CenterContent from "./MainContent/CenterContent";
import RightSidebar from "./RightSidebar/RightSidebar";
import SignIn from "./SignIn";
import { SwizzleContext } from "./Utilities/GlobalContext";
import InProgressDeploymentModal from "./Utilities/InProgressDeploymentModal";
import { Page } from "./Utilities/Page";

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
  //Loading Modal handler
  const [isModalOpen, setIsModalOpen] = useState(false);

  //Initialization code...
  const { isFree, projects, setProjects, activeProject, testDomain, setMousePosition } = useContext(SwizzleContext);
  const { getProjects } = useDatabaseApi();
  const auth = useAuthUser()


  const handleMouseMove = (event) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    initIntercomWindow({ appId: 'cxvvsphp', name: (auth() || {"user": "unknown"}).user, projectId: activeProject, testDomain: testDomain })
  }, [auth, activeProject, testDomain])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();

        if (!data || data.length === 0) {
          setProjects([]);
          return;
        }

        // Initialize the project list to an empty array.
        setProjects(data);
        return;
      } catch (e) {
        toast.error("Error fetching projects");
        console.error(e);
      }
    };
    fetchProjects();
  }, []);

  if (isAuthenticated()) {
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
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />

            <CenterContent
              selectedTab={selectedTab}
              currentFileProperties={currentFileProperties}
              setCurrentFileProperties={setCurrentFileProperties}
              activeCollection={activeCollection}
              activeLogsPage={activeLogsPage}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />

            <RightSidebar selectedTab={selectedTab} currentFileProperties={currentFileProperties} setCurrentFileProperties={setCurrentFileProperties}/>

            <InProgressDeploymentModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)} />
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
