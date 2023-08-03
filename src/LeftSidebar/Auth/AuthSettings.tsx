import { useState } from "react";
import { Method } from "../../Utilities/Method";
import SectionAction from "../SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import toast from "react-hot-toast";
import useApi from "../../API/EndpointAPI";

export default function AuthSettings({active}: {active: boolean}) {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const { createAPI } = useApi();

    const createNewAPI = (apiName: string) => {
        toast.promise(
            createAPI(apiName),
            {
                loading: "Creating API...",
                success: () => {
                    window.location.reload()
                    return "Created API!"
                },
                error: <b>Failed to create API</b>
            }
        );
    }
    
    //Fetch from backend and populate it here.
    return(
        <div className={`flex-col w-full px-2 mt-2 text-sm ${active ? "" : "hidden"}`} >
            <SectionAction text="Auth Settings" onClick={() => {setIsVisible(true)}} />
            <FullPageModal isVisible={isVisible} setIsVisible={setIsVisible} modalDetails={{
                title:  "Auth Settings",
                description: <>Auth settings are not ready for use yet.</>,
                placeholder: "Nothing to do here...",
                confirmText: "Okay",
                confirmHandler: () => {},
                shouldShowInput: true
            }} />
        </div>
    )
}
