import Editor from "./Editor/Editor";
import EditorHeader from "./Editor/EditorHeader";
import { Method } from "../Utilities/Method";
import { Page } from "../Utilities/Page";
import DatabaseView from "./DatabaseView";

export default function CenterContent({selectedTab, prependCode, didDeploy, setDidDeploy}: {selectedTab: Page, prependCode: string, didDeploy: boolean, setDidDeploy: (didDeploy: boolean) => void}){
    if(selectedTab === Page.Apis){
        return (
            <div className="m-4 ml-0 text-sm whitespace-pre-line">
                <EditorHeader method={Method.GET} path="/" didDeploy={didDeploy} />
                <Editor prepend={prependCode} setDidDeploy={setDidDeploy} />
            </div>
        )
    } else if(selectedTab == Page.Functions){
        return (<>Functions Editor</>)
    } else if(selectedTab == Page.Db){
        return (
            <div className="m-4 ml-0 text-sm whitespace-pre-line">
                <DatabaseView />
            </div>
        )
    } else if(selectedTab == Page.Logs){
        return (<>Logs</>)
    }
}