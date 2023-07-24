import { useEffect, useState } from "react";
import CollectionHeader from "./CollectionHeader";
import CollectionItem from "./CollectionItem";
import useApi from "../../API/DatabaseAPI";

export default function CollectionList({active}: {active: boolean}) {
    const { getCollections } = useApi(); 
    const [collections, setCollections] = useState<string[]>([]);
    const [activeCollection, setActiveCollection] = useState<string>("");

    useEffect(() => {
        if(collections.length > 0){
            getCollections().then((data) => {
                // setCollections(data.collections);
            })
        }
    }, [])

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
            {collections.map((collection) => (
                <CollectionItem name={collection} active={activeCollection == collection} onClick={() => {setActiveCollection(collection)}} />
            ))}
        </div>
    )
}
