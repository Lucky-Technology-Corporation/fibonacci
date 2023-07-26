import { useState } from "react";
import EndpointHeader from "./EndpointHeader";
import EndpointItem from "./EndpointItem";
import { Method } from "../../Utilities/Method";
import NewAPIInput from "../../NewResourceModals/NewAPIInput";

export default function EndpointList({active}: {active: boolean}) {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    
    //Fetch from backend and populate it here.
    return(
        <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"}`} >
            <EndpointHeader didClickPlusButton={() => {setIsVisible(true)}} />
            <EndpointItem path={"/"} method={Method.GET} active={true} />
            <EndpointItem path={"/"} method={Method.POST} active={false} />
            <EndpointItem path={"/admin"} method={Method.GET} active={false} />
            <EndpointItem path={"/admin/:id"} method={Method.GET} active={false} />
            <NewAPIInput isVisible={isVisible} setIsVisible={setIsVisible}/>
        </div>
    )
}
