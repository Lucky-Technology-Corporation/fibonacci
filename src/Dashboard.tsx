import Lottie from "lottie-react";
import { initIntercomWindow } from 'next-intercom';
import { useContext, useEffect, useState } from "react";
import { useAuthUser, useIsAuthenticated } from "react-auth-kit";
import toast, { Toaster } from "react-hot-toast";
import Joyride, { ACTIONS, EVENTS, Placement, STATUS } from 'react-joyride';
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


  const onboardingSteps = [
    {
      target: '.env-toggle',
      title: 'Environment',
      placement: 'right' as Placement,
      content: 'Your project has two environments: test and production. Use test environment to develop and the production environment to serve your users. All resources (database, storage, etc) are DIFFERENT between the two environments.',
    },
    {
      target: '.user-tab',
      title: 'Users',
      placement: 'right' as Placement,
      content: 'Manage your users here. The frontend keeps track of users automatically and passes user objects to the backend under the request.user object.',
    },
    {
      target: '.auth-method',
      title: 'Authentication',
      placement: 'right' as Placement,
      content: 'This is where you can drop in authentication methods like Email/Password, Google, etc.',
    },
    {
      target: '.backend-tab',
      title: 'Backend',
      placement: 'right' as Placement,
      content: 'This where you add your server endpoints: functions that the frontend can call.',
    },
    {
      target: '.endpoints-list',
      title: 'Endpoints',
      placement: 'right' as Placement,
      content: 'These are publicly accessible functions that the frontend can call.',
    },
    {
      target: '.helpers-list',
      title: 'Helpers',
      placement: 'right' as Placement,
      content: 'These are private functions that can be called by other endpoints or helpers. You can use helpers to organize your code and avoid repetition.',
    },
    {
      target: '.magic-bar',
      title: 'Magic Bar',
      placement: 'bottom' as Placement,
      content: 'Ask for anything you need here. You can use the Magic Bar to generate code with AI, quickly import components, search for documentation, and more.',
    },
    {
      target: '.auth-toggle',
      title: 'Require Authentication',
      placement: 'left' as Placement,
      content: 'Toggle this to require users to be logged in to access this endpoint. This guarantees that the request.user object will be populated with a user object.',
    },
    {
      target: '.db-toggle',
      title: 'Import Database',
      placement: 'left' as Placement,
      content: 'Toggle this to quickly import the db variable. You can use db to query your database (for example: db.collections("messages").find({"sender": "John"})).',
    },
    {
      target: '.tester-button',
      title: 'Tests',
      placement: 'left' as Placement,
      content: 'Opens a window where you can test your endpoints. You\'ll be able to simulate requests with different parameters, users, etc and see the response.',
    },
    {
      target: '.autocheck-button',
      title: 'Autocheck',
      placement: 'left' as Placement,
      content: 'Runs your code (along with helpers, your database, etc) through an AI engine to check for bugs, security issues, and more.',
    },
    {
      target: '.secrets-button',
      title: 'Secrets',
      placement: 'left' as Placement,
      content: 'Add your API keys and other secrets here. You can access them in your code with the secrets variable (process.env.SECRET_NAME). You can have different secret values in test and production.',
    },
    {
      target: '.packages-button',
      title: 'Packages',
      placement: 'left' as Placement,
      content: 'Add NPM packages to your backend here.',
    },
    {
      target: '.restart-button',
      title: 'Restart',
      placement: 'left' as Placement,
      content: 'Restart your backend server here. Your server will automatically restart when you save a file, but you can also restart it manually here.',
    },
    {
      target: '.frontend-tab',
      title: 'Frontend',
      content: 'Build your user-facing website here. ',
    },
    {
      target: '.database-tab',
      title: 'Database',
      content: 'This is your database. A collection contains a list of documents (JSON objects). You can quickly add, edit, and delete documents from your backend with a MongoDB query',
    },
  ]

  const [stepIndex, setStepIndex] = useState(0)
  const [runState, setRunState] = useState(true)
  
  const handleJoyrideCallback = (data: any) => {
    const { action, index, status, type } = data
    console.log(data)
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      
      if(index == 1 && action == ACTIONS.NEXT){
        setSelectedTab(Page.Auth)
      } else if(index == 2 && action == ACTIONS.NEXT){
        setSelectedTab(Page.Apis)
      }

      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1) )
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunState(false)
    }
  }

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
          <Joyride
            callback={handleJoyrideCallback}
            steps={onboardingSteps}
            stepIndex={stepIndex}
            run={runState}
            continuous={true}
            debug={true}
            spotlightClicks={true}
          />
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
