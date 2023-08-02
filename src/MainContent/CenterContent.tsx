import Editor from "./Editor/Editor";
import EditorHeader from "./Editor/EditorHeader";
import { Method } from "../Utilities/Method";
import { Page } from "../Utilities/Page";
import DatabaseView from "./Database/DatabaseView";
import UserTableView from "./Auth/UserTableView";
import ObjectTableView from "./Storage/ObjectTableView";

type CenterContentProps = {
    selectedTab: Page, 
    prependCode: string, 
    didDeploy: boolean, 
    setDidDeploy: (didDeploy: boolean) => void
    activeCollection: string
}

export default function CenterContent({selectedTab, prependCode, didDeploy, setDidDeploy, activeCollection} : CenterContentProps){
    if(selectedTab === Page.Apis){
        return (
            <div className="m-4 ml-0 text-sm whitespace-pre-line">
                <EditorHeader method={Method.GET} path="/" didDeploy={didDeploy} />
                <Editor prepend={prependCode} setDidDeploy={setDidDeploy} />
            </div>
        )
    } else if(selectedTab == Page.Auth){
        return (
            <div className="m-4 ml-0 text-sm whitespace-pre-line">
                <UserTableView activeCollection={"_swizzle_users"} />
            </div>
        )
    } else if(selectedTab == Page.Db){
        return (
            <div className="m-4 ml-0 text-sm whitespace-pre-line">
                <DatabaseView activeCollection={activeCollection} />
            </div>
        )
    } else if(selectedTab == Page.Storage){
        return (
            <div className="m-4 ml-0 text-sm whitespace-pre-line">
                <ObjectTableView activeCollection={"_swizzle_storage"} />
            </div>
        )
    } else if(selectedTab == Page.Logs){
        return (<>Logs</>)
    }
}