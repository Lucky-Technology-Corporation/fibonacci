import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CollectionHeader from "./CollectionHeader";
import CollectionItem from "./CollectionItem";
import useApi from "../../API/DatabaseAPI";

export default function CollectionList({active, activeCollection, setActiveCollection}: {active: boolean, activeCollection: string, setActiveCollection: Dispatch<SetStateAction<string>>}) {
    const { getCollections } = useApi(); 
    const [collections, setCollections] = useState<string[]>([]);

    useEffect(() => {
        getCollections().then((data) => {
            setCollections(data.collections);
            setActiveCollection(data.collections[0])
        })
    }, [])

    const [lastClickedPlusButton, setLastClickedPlusButton] = useState<HTMLDivElement | undefined>(undefined);
    const didClickPlusButton = (e: React.MouseEvent<HTMLDivElement>) => {
        setLastClickedPlusButton(e.currentTarget);
        setTimeout(() => {
            setLastClickedPlusButton(undefined)
        }, 100)
    }

    return(
        <div className={`flex-col w-full mt-2 px-2 text-sm ${active ? "" : "hidden"}`}>
            {collections.map((collection) => (
                <CollectionItem name={collection} active={activeCollection == collection} onClick={() => {setActiveCollection(collection)}} />
            ))}
        </div>
    )
}
