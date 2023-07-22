import { useState } from "react";
import EndpointHeader from "./EndpointHeader";
import EndpointItem from "./EndpointItem";
import NewItem from "./NewItem";
import { Method } from "../../Utilities/Method";

export default function EndpointList({active}: {active: boolean}) {
    const [lastClickedPlusButton, setLastClickedPlusButton] = useState<HTMLDivElement | undefined>(undefined);
    
    const didClickPlusButton = (e: React.MouseEvent<HTMLDivElement>) => {
        setLastClickedPlusButton(e.currentTarget);
        setTimeout(() => {
            setLastClickedPlusButton(undefined)
        }, 100)
    }
    
    //Fetch from backend and populate it here.
    return(
        <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"}`} style={{marginTop: "-10px"}}>
            <EndpointHeader path="" level={0} didClickPlusButton={didClickPlusButton} />
            <EndpointItem level={0} method={Method.GET} active={true} />
            <EndpointHeader path=":id" level={1} didClickPlusButton={didClickPlusButton} />
            <EndpointItem level={1} method={Method.POST} />
            <EndpointHeader path="admin" level={2} didClickPlusButton={didClickPlusButton} />
            <EndpointItem level={2} method={Method.GET} />
            <EndpointItem level={2} method={Method.PATCH} />
            <EndpointHeader path="edit" level={3} didClickPlusButton={didClickPlusButton} />
            <EndpointHeader path=":admin_id" level={4} didClickPlusButton={didClickPlusButton} />
            <NewItem triggerElement={lastClickedPlusButton} />
        </div>
    )
}
