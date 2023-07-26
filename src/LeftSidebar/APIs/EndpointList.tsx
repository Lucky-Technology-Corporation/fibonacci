import { useState } from "react";
import EndpointItem from "./EndpointItem";
import { Method } from "../../Utilities/Method";
import SectionAction from "../SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import toast from "react-hot-toast";
import useApi from "../../API/EndpointAPI";

export default function EndpointList({active}: {active: boolean}) {
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
        <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"}`} >
            <SectionAction text="+ New API" onClick={() => {setIsVisible(true)}} />
            <EndpointItem path={"/"} method={Method.GET} active={true} />
            <EndpointItem path={"/"} method={Method.POST} active={false} />
            <EndpointItem path={"/admin"} method={Method.GET} active={false} />
            <EndpointItem path={"/admin/:id"} method={Method.GET} active={false} />
            <FullPageModal isVisible={isVisible} setIsVisible={setIsVisible} modalDetails={{
                title:  "New API",
                description: <>Enter the path to your new API. Use <span className="font-bold font-mono">:variable</span> to create a variable in your path.</>,
                placeholder: "/path/:variable",
                confirmText: "Create",
                confirmHandler: createNewAPI
            }} />
        </div>
    )
}
