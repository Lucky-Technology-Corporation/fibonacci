import { useState } from "react";
import CollectionHeader from "./CollectionHeader";
import CollectionItem from "./CollectionItem";

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
        <div className={`flex-col w-full mt-2 px-2 text-sm ${active ? "" : "hidden"}`}>
            <CollectionItem name="users" active={true} />
            <CollectionItem name="posts" active={false} />
            {/* <CollectionHeader didClickPlusButton={didClickPlusButton} /> */}
        </div>
    )
}
