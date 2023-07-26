import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CollectionHeader from "./CollectionHeader";
import CollectionItem from "./CollectionItem";
import useApi from "../../API/DatabaseAPI";
import NewCollectionInput from "../../NewCollectionInput";

export default function CollectionList({active, activeCollection, setActiveCollection}: {active: boolean, activeCollection: string, setActiveCollection: Dispatch<SetStateAction<string>>}) {
    const { getCollections } = useApi(); 
    const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
    const [collections, setCollections] = useState<string[]>([]);

    const refreshCollections = () => {
        getCollections().then((data) => {
            setCollections(data.collections);
            setActiveCollection(data.collections[0])
        })
    }

    useEffect(() => {
        refreshCollections();
    }, [])

    return(
        <div className={`flex-col w-full mt-1 px-2 ${active ? "" : "hidden"}`}>
            <CollectionHeader didClickPlusButton={() => {setIsNewCollectionOpen(true)}} />
            {collections.map((collection, index) => (
                <CollectionItem key={index} name={collection} active={activeCollection == collection} onClick={() => {setActiveCollection(collection)}} />
            ))}
            <NewCollectionInput isVisible={isNewCollectionOpen} setIsVisible={setIsNewCollectionOpen} />
        </div>
    )
}
