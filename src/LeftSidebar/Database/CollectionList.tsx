import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import CollectionItem from "./CollectionItem";
import useDatabaseApi from "../../API/DatabaseAPI";
import SectionAction from "../SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import toast from "react-hot-toast";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function CollectionList({
  active,
  activeCollection,
  setActiveCollection,
}: {
  active: boolean;
  activeCollection: string;
  setActiveCollection: Dispatch<SetStateAction<string>>;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const { createCollection, getCollections } = useDatabaseApi();
  const { activeProject, environment } = useContext(SwizzleContext);

  const refreshCollections = () => {
    getCollections().then((data) => {
      if (!data || data.collections.length == 0) {
        setCollections([]);
        setActiveCollection("");
        return;
      }
      setCollections(data.collections);
      setActiveCollection(data.collections[0]);
    });
  };

  const createNewCollection = (collectionName: string) => {
    toast.promise(createCollection(collectionName), {
      loading: "Creating collection...",
      success: () => {
        refreshCollections();
        return "Created collection!";
      },
      error: <b>Failed to create collection</b>,
    });
  };

  useEffect(() => {
    if (activeProject == undefined) {
      return;
    }
    refreshCollections();
  }, [activeProject, environment]);

  return (
    <div className={`flex-col w-full mt-1 px-2 ${active ? "" : "hidden"}`}>
      <SectionAction
        text="+ New Collection"
        onClick={() => {
          setIsVisible(true);
        }}
        className="py-1.5 px-1 !my-1.5 !mb-2"
      />
      {collections.map((collection, index) => (
        <CollectionItem
          key={index}
          name={collection}
          active={activeCollection == collection}
          onClick={() => {
            setActiveCollection(collection);
          }}
        />
      ))}
      <FullPageModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        modalDetails={{
          title: "🗂️ New collection",
          description: <>Enter a name with no spaces or special characters</>,
          placeholder: "collection_name",
          confirmText: "Create",
          confirmHandler: createNewCollection,
          shouldShowInput: true,
        }}
      />
    </div>
  );
}
