import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DeployButton({}: {}){
    const [deployProgress, setDeployProgress] = useState(0);
    const [isDeploymentInProgress, setIsDeploymentInProgress] = useState(false);
    
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
            toast.success("Deployed to test environment", {
                icon: "🧪",
            });
        }, 3200);
        
        setTimeout(() => {
            setIsDeploymentInProgress(false);
            setDeployProgress(0);
        }, 3500);
    };

   //Command-S deploy trigger
   useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
        if (
            (window.navigator.platform.match("Mac")
                ? event.metaKey
                : event.ctrlKey) &&
            event.key === "s"
        ) {
            event.preventDefault();
            if (window.navigator.platform.match("Mac")) {
                toast(
                    "Reloading test environment (Shift-⌘-S to deploy to production)",
                    { icon: "⏳" },
                );
            } else {
                toast(
                    "Reloading test environment (Shift-Ctrl-S to deploy to production)",
                    { icon: "⏳" },
                );
            }
            runDeploy();
        }
        };
        window.addEventListener("keydown", handleKeyDown);
        
        // Clean up the effect
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, []);

    
    return (
        <div className="relative w-full mb-1">
        <div
        id="deploy-progress-bar"
        className="absolute inset-0 bg-orange-400 bg-opacity-30 rounded"
        style={{
            width: `${deployProgress}%`,
            transition: "width 0.2s ease-out",
        }}
        />
        <button
        className="border border-orange-400 text-orange-400 w-full py-1.5 rounded"
        onMouseEnter={teaseDeploy}
        onMouseLeave={resetDeploy}
        onClick={runDeploy}
        >
        <img
        src="rocket.svg"
        alt="rocket"
        className="w-4 h-4 inline-block mr-2"
        />
        {deployProgress > 8
            ? deployProgress == 100
            ? "Deployed!"
            : "Deploying..."
            : "Deploy"}
            </button>
            </div>
            )
        }