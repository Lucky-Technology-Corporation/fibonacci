import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useDatabaseApi from "../../API/DatabaseAPI";
import FullPageModal from "../../Utilities/FullPageModal";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";
import SectionAction from "../SectionAction";
import CollectionItem from "./CollectionItem";

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
  const { activeProject, environment, setSelectedTab, setActiveAuthPage, selectedTab } = useContext(SwizzleContext);

  const refreshCollections = () => {
    getCollections().then((data) => {
      if (!data || data.collections.length == 0) {
        setCollections([]);
        setActiveCollection("");
        return;
      }
      setCollections(data.collections);
      
      if(data.collections[0] == "users" && data.collections.length > 1){
        setActiveCollection(data.collections[1]);
      } else if(data.collections[0] != "users"){
        setActiveCollection(data.collections[0]);
      } else{
        setActiveCollection("");
      }

    });
  };

  const createNewCollection = (collectionName: string) => {
    if (collectionName.startsWith("_")) {
      toast.error("Collection names cannot start with an underscore");
      return;
    }
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

  useEffect(() => {
    if(selectedTab == Page.Db){
      refreshCollections();
    }
  }, [selectedTab])

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
            if(collection == "users"){
              setSelectedTab(Page.Auth)
              setActiveAuthPage("list")
              return
            }
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
