import { useState } from "react";
import EndpointHeader from "./EndpointHeader";
import EndpointItem from "./EndpointItem";
import NewItem from "./NewItem";
import { Method } from "../../Utilities/Method";
import NewAPIInput from "../../NewAPIInput";

export default function EndpointList({active}: {active: boolean}) {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [lastClickedPlusButton, setLastClickedPlusButton] = useState<HTMLDivElement | undefined>(undefined);
    
    const didClickPlusButton = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsVisible(true)
    }
    
    //Fetch from backend and populate it here.
    return(
        <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"}`} >
            <EndpointHeader didClickPlusButton={didClickPlusButton} />
            <EndpointItem path={"/"} method={Method.GET} active={true} />
            <EndpointItem path={"/"} method={Method.POST} active={false} />
            <EndpointItem path={"/admin"} method={Method.GET} active={false} />
            <EndpointItem path={"/admin/:id"} method={Method.GET} active={false} />
            <NewAPIInput isVisible={isVisible} setIsVisible={setIsVisible}/>
        </div>
    )
}
