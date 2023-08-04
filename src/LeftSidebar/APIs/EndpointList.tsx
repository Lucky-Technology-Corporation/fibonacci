import { useState } from "react";
import EndpointItem from "./EndpointItem";
import { Method } from "../../Utilities/Method";
import SectionAction from "../SectionAction";
import APIWizard from "./APIWizard";

export default function EndpointList({active}: {active: boolean}) {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    
    //Fetch from backend and populate it here.
    return(
        <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"}`} >
            <SectionAction text="+ New API" onClick={() => {setIsVisible(true)}} />
            <EndpointItem path={"/"} method={Method.GET} active={true} />
            <EndpointItem path={"/"} method={Method.POST} active={false} />
            <EndpointItem path={"/admin"} method={Method.GET} active={false} />
            <EndpointItem path={"/admin/:id"} method={Method.GET} active={false} />
            <APIWizard isVisible={isVisible} setIsVisible={setIsVisible} />
        </div>
    )
}
