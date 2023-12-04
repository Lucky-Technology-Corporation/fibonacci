import { faRocket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../API/EndpointAPI";
import useSettingsApi from "../API/SettingsAPI.tsx";
import Button from "../Utilities/Button.tsx";
import { SwizzleContext } from "../Utilities/GlobalContext.tsx";
import PaymentRequestModal from "../Utilities/PaymentRequestModal.tsx";
import DeployInfo from "./DeployInfo.tsx";

export default function DeployButton({}: {}) {
  const [deployProgress, setDeployProgress] = useState(0);
  const [isDeploymentInProgress, setIsDeploymentInProgress] = useState(false);
  const [showDeployInfo, setShowDeployInfo] = useState(false);
  const [shouldCancelHide, setShouldCancelHide] = useState(false);
  const [showStripeView, setShowStripeView] = useState(false);

  const { deploy } = useEndpointApi();
  const { hasAddedPaymentMethod } = useSettingsApi()
  const { environment } = useContext(SwizzleContext)

  const fetchPaymentMethod = async () => {
    const hasPaymentMethod = await hasAddedPaymentMethod();
    return hasPaymentMethod;
  }
  
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

  const runDeploy = async () => {
    if (isDeploymentInProgress) return;
    const hasPaymentMethod = await fetchPaymentMethod();
    if(!hasPaymentMethod){
      setShowStripeView(true);
      return;
    }

    if(environment == "prod"){
      toast.error("Switch to Test to deploy your updated code")
      return
    }

    toast.promise(deploy(), {
      loading: "Sending...",
      success: "Project is building and will be deployed in a few minutes",
      error: "Error deploying",
    });

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
    }, 3200);

    setTimeout(() => {
      setIsDeploymentInProgress(false);
      setDeployProgress(0);
    }, 3500);
  };


  useEffect(() => {
    console.log("shouldCancelHide", shouldCancelHide)
    if(!shouldCancelHide){
      setTimeout(() => {
        setShowDeployInfo(false);
      }, 100);
    }
  }, [shouldCancelHide])

  const tryToClose = () => { //TODO: this isn't picking up the shouldCancelHide state correctly. Fix it to keep the deployment details open on mouse over
    if(!shouldCancelHide){ setShowDeployInfo(false) }
  }

  return (
    <>
      <div className="relative w-10 my-auto mr-2 min-w-10 flex-shrink-0 deploy-button">
        <div
          id="deploy-progress-bar"
          className="absolute inset-0 bg-orange-400 bg-opacity-30 rounded"
          style={{
            width: `${deployProgress}%`,
            transition: "width 0.2s ease-out",
          }}
        />
        {/* <button
          className="border border-orange-400 text-orange-400 w-full rounded py-1"
          onMouseEnter={() => {if(environment == "test"){ setShowDeployInfo(true)}}}
          onMouseLeave={() => {setTimeout(() => { tryToClose() }, 100); }}
          onClick={runDeploy}
          // style={{paddingTop: "0.33rem", paddingBottom: "0.33rem"}}
        >
          <img src="/rocket.svg" alt="rocket" className="w-4 h-4 my-1 mx-auto" />
        </button> */}

        <Button
          className={`text-sm py-1.5 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869877] border-[#525363] border`}
          children={<FontAwesomeIcon icon={faRocket} className="py-1"/>}
          onClick={() => {
            runDeploy()
          }}
          onMouseEnter={() => {if(environment == "test"){ setShowDeployInfo(true)}}}
          onMouseLeave={() => {setTimeout(() => { tryToClose() }, 100); }}
        />


        <div className={`fixed left-2 mt-2 ${showDeployInfo ? "" : "pointer-events-none"}`} style={{zIndex: 51}}>
          <DeployInfo setShouldShowDeployInfo={setShowDeployInfo} shouldShowDeployInfo={showDeployInfo} setShouldCancelHide={setShouldCancelHide} />
        </div>
      </div>
      <PaymentRequestModal 
        isVisible={showStripeView}
        setIsVisible={setShowStripeView}
      />
    </>
  );
}
