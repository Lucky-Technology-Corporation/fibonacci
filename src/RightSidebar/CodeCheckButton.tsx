import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useApi from "../API/EndpointAPI";

export default function CodeCheckButton({}: {}) {
  const [deployProgress, setDeployProgress] = useState(0);
  const [isDeploymentInProgress, setIsDeploymentInProgress] = useState(false);
  const { deploy } = useApi();

  const teaseDeploy = () => {
    if (!isDeploymentInProgress) {
      setDeployProgress(8);
    }
  };
  const resetDeploy = () => {
    if (!isDeploymentInProgress) {
      setDeployProgress(0);
    }
  };

  //fake, for demo purposes
  const runDeploy = () => {
    deploy();

    setIsDeploymentInProgress(true);

    const element = document.getElementById("deploy-progress-bar");
    if (element) {
      element.style.transition = "width 3s ease-in-out";
    }

    setDeployProgress(79);

    setTimeout(() => {
      if (element) {
        element.style.transition = "width 0.2s ease-in";
      }
      setDeployProgress(100);
    }, 3000);

    setTimeout(() => {
      if (element) {
        element.style.transition = "width 0.2s ease-out";
      }
      toast.success("Deployed!", {
        icon: "🫡",
      });
    }, 3200);

    setTimeout(() => {
      setIsDeploymentInProgress(false);
      setDeployProgress(0);
    }, 3500);
  };

  return (
    <div className="relative w-full mb-1">
      <div
        id="check-progress-bar"
        className="absolute inset-0 bg-green-400 bg-opacity-30 rounded"
        style={{
          width: `${deployProgress}%`,
          transition: "width 0.2s ease-out",
        }}
      />
      <button
        className="border border-green-400 text-green-400 w-full py-1.5 rounded"
        onMouseEnter={teaseDeploy}
        onMouseLeave={resetDeploy}
        onClick={runDeploy}
      >
        <img src="rocket.svg" alt="rocket" className="w-4 h-4 inline-block mr-2" />
        {deployProgress > 8 ? (deployProgress == 100 ? "Deployed!" : "Deploying...") : "Code Check"}
      </button>
    </div>
  );
}
