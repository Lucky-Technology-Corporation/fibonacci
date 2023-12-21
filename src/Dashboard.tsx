import { Position, TourProvider, useTour } from "@reactour/tour";
import Lottie from "lottie-react";
// import { initIntercomWindow } from "next-intercom";
import { useContext, useEffect, useState } from "react";
import { useAuthUser, useIsAuthenticated } from "react-auth-kit";
import toast, { Toaster } from "react-hot-toast";
import dog from "../public/dog.json";
import useDatabaseApi from "./API/DatabaseAPI";
import useSettingsApi from "./API/SettingsAPI";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import CenterContent from "./MainContent/CenterContent";
import RightSidebar from "./RightSidebar/RightSidebar";
import SignIn from "./SignIn";
import AddEmailModal from "./Utilities/AddEmailModal";
import { SwizzleContext } from "./Utilities/GlobalContext";
import InProgressDeploymentModal from "./Utilities/InProgressDeploymentModal";
import { Page } from "./Utilities/Page";

export default function Dashboard() {
  const isAuthenticated = useIsAuthenticated();
  //Active logs page handler
  const [activeLogsPage, setActiveLogsPage] = useState<string>("analytics");
  //Loading Modal handler
  const [isModalOpen, setIsModalOpen] = useState(false);
  //Add email modal handler
  const [needsEmail, setNeedsEmail] = useState(false);

  const { setSelectedTab } = useContext(SwizzleContext);

  //Initialization code...
  const { isFree, projects, setProjects, activeProject, testDomain, ideReady } = useContext(SwizzleContext);
  const { getProjects } = useDatabaseApi();
  const { checkIfAccountNeedsEmail } = useSettingsApi()
  const auth = useAuthUser();

  const onboardingSteps = [
    {
      selector: ".env-toggle",
      title: "Environment",
      position: "right" as Position,
      content: (
        <div className="text-left text-sm">
          Your project has two environments: <span className="text-[#f39c12] font-bold">test</span> and{" "}
          <span className="font-bold">production</span>. Use test environment to develop and the production environment
          to serve your users.
          <br />
          <br />
          All resources (database, storage, code, etc) are DIFFERENT between the two environments.
        </div>
      ),
    },
    {
      selector: ".logs-tab",
      title: "Logs",
      position: "right" as Position,
      content: <div className="text-left text-sm">Browse logs for past requests here.</div>,
    },
    {
      selector: ".autofix-button",
      title: "Autofix",
      position: "right" as Position,
      content: <div className="text-left text-sm">Click this button on broken requests.
      <br/><br/>AI will automatically analyze your code & error logs to find the issue for you.</div>,
    },
    {
      selector: ".templates-tab",
      title: "Templates",
      position: "right" as Position,
      content: <div className="text-left text-sm">Add common templates to your project quickly.</div>,
    },
    {
      selector: ".user-tab",
      title: "Users",
      position: "right" as Position,
      content: <div className="text-left text-sm">Manage your users here.</div>,
    },
    {
      selector: ".auth-method",
      title: "Authentication",
      position: "right" as Position,
      content: (
        <div className="text-left text-sm">
          Click the + New button to drop in authentication methods like Email/Password, Google, etc.
        </div>
      ),
    },
    {
      selector: ".backend-tab",
      title: "Backend",
      position: "right" as Position,
      content: <div className="text-left text-sm">This where you add your backend code.</div>,
    },
    {
      selector: ".endpoints-list",
      title: "Endpoints",
      position: "right" as Position,
      content: (
        <div className="text-left text-sm">Endpoints are publicly accessible functions that the frontend can call.</div>
      ),
    },
    {
      selector: ".helpers-list",
      title: "Helpers",
      position: "right" as Position,
      content: (
        <div className="text-left text-sm">
          Helpers are private functions that can be called by other endpoints or helpers.
          <br />
          <br />
          You can use helpers to organize your code and avoid repetition.
        </div>
      ),
    },
    {
      selector: ".magic-bar",
      title: "Magic Bar",
      position: "bottom" as Position,
      content: (
        <div className="text-left text-sm">
          Ask for <b>anything you need</b> here.
          <br />
          <br />
          You can generate code with AI, import helpers/components, search for documentation, and more.
        </div>
      ),
    },
    {
      selector: ".tester-button",
      title: "Tests",
      position: "left" as Position,
      content: (
        <div className="text-left text-sm">
          <b>Tests</b>
          <br />
          <br />
          Simulate endpoint requests with different parameters or users.
        </div>
      ),
    },
    {
      selector: ".autocheck-button",
      title: "Autocheck",
      position: "left" as Position,
      content: (
        <div className="text-left text-sm">
          <b>AI Autocheck</b>
          <br />
          <br />
          Run your code through an AI to check for bugs, security issues, and more.
        </div>
      ),
    },
    {
      selector: ".secrets-button",
      title: "Secrets",
      position: "left" as Position,
      content: (
        <div className="text-left text-sm">
          <b>Secrets</b>
          <br />
          <br />
          Add API keys and other secrets here. You can access them in your code with the secrets variable (
          <span className="font-mono">process.env.SECRET_NAME</span>). You can have different secret values in test and
          production.
        </div>
      ),
    },
    {
      selector: ".packages-button",
      title: "Packages",
      position: "left" as Position,
      content: (
        <div className="text-left text-sm">
          <b>Packages</b>
          <br />
          <br />
          Add NPM packages to your backend here.
        </div>
      ),
    },
    {
      selector: ".restart-button",
      title: "Restart",
      position: "left" as Position,
      content: (
        <div className="text-left text-sm">
          <b>Restart</b>
          <br />
          <br />
          Manually restart your backend server here (your server also automatically restarts when you save a file).
        </div>
      ),
    },
    {
      selector: ".frontend-tab",
      title: "Frontend",
      content: <div className="text-left text-sm">Build your user-facing website here with ReactJS.</div>,
    },
    {
      selector: ".pages-list",
      title: "Pages",
      content: (
        <div className="text-left text-sm">A page contains the code for a specific URL (like yourdomain.com/about)</div>
      ),
    },
    {
      selector: ".components-list",
      title: "Components",
      content: (
        <div className="text-left text-sm">
          A component contains code which can be reused in pages or other components.
        </div>
      ),
    },
    {
      selector: ".database-tab",
      title: "Database",
      content: (
        <div className="text-left text-sm">
          This is your database. A collection is a list of documents (JSON). You can quickly add, edit, and delete
          documents from your backend with a MongoDB query
        </div>
      ),
    },
    {
      selector: ".files-tab",
      title: "Files",
      content: (
        <div className="text-left text-sm">
          This is where you can manage large files like images and video. Your backend can read and write to this.
        </div>
      ),
    },
    {
      selector: ".deploy-button",
      title: "Deploy",
      content: (
        <div className="text-left text-sm">
          Deploy your project to Production here.
          <br />
          <br />
          The production environment is scalable and always ready to accept new requests.
        </div>
      ),
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const { setIsOpen } = useTour();

  const handleStepChange = (step: number) => {
    prepareNextStep(step);
    setCurrentStep(step);
  };

  const prepareNextStep = (nextStep: number) => {
    if(nextStep == 1){
      setActiveLogsPage("logs")
    } else if (nextStep == 4) {
      setSelectedTab(Page.Auth);
    } else if (nextStep == 6) {
      setSelectedTab(Page.Apis);
    } else if (nextStep == 15) {
      setSelectedTab(Page.Hosting);
    }
  };

  // useEffect(() => {
  //   initIntercomWindow({
  //     appId: "cxvvsphp",
  //     name: (auth() || { user: "unknown" }).user,
  //     projectId: activeProject,
  //     testDomain: testDomain,
  //   });
  // }, [auth, activeProject, testDomain]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (e) {
        toast.error("Error fetching projects");
        console.error(e);
      }
    };
    
    checkIfAccountNeedsEmail().then((needsEmail) => {
      if(!needsEmail || !needsEmail.email || needsEmail.email == ""){
        setNeedsEmail(true);
      }
    })

    fetchProjects();
  }, []);

  if (isAuthenticated()) {
    if (projects) {
      return (
        <TourProvider
          steps={onboardingSteps}
          styles={{
            popover: (base) => ({
              ...base,
              backgroundColor: "#32333b",
            }),
            arrow: (base, { disabled }) => ({
              ...base,
              color: disabled ? "#777" : "#ddd",
              margin: "2px",
            }),
            badge: (base) => ({
              display: "none",
            }),
            dot: (base) => ({
              ...base,
              display: "none",
            }),
          }}
          currentStep={currentStep}
          setCurrentStep={handleStepChange}
        >
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
                activeLogsPage={activeLogsPage}
                setActiveLogsPage={setActiveLogsPage}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
              />

              <CenterContent
                activeLogsPage={activeLogsPage}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
              />

              <RightSidebar />

              <InProgressDeploymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

              <AddEmailModal isOpen={needsEmail} onClose={() => setNeedsEmail(false)} />
            </div>
          </div>
        </TourProvider>
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
