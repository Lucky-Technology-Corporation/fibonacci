import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import useEndpointApi from "../../API/EndpointAPI";
import useFilesystemApi from "../../API/FilesystemAPI";
import { endpointToFilename } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method, methodToColor } from "../../Utilities/Method";
import EndpointContextMenu from "./EndpointContextMenu";

export default function EndpointItem({
  active = false,
  path,
  method,
  onClick,
  removeFromList,
  editFile
}: {
  active?: boolean;
  path: string;
  method: Method;
  onClick?: () => void;
  removeFromList?: () => void
  editFile?: () => void
}) {

  const filesystemApi = useFilesystemApi()
  const endpointApi = useEndpointApi()
  
  const { setPostMessage, setShouldRefreshList, shouldRefreshList } = useContext(SwizzleContext);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const runDeleteProcess = async (method: string, path: string) => {
    try{
      let newEndpointName = method.toLowerCase() + path
      let fileName = endpointToFilename(newEndpointName)
      
      if(newEndpointName === ""){
        newEndpointName = "get."
      }
      
      //close file
      setPostMessage({
        type: "removeFile",
        fileName: "/backend/user-dependencies/" + fileName,
      });

      await filesystemApi.deleteEndpoint(method, path)

      if(path.startsWith("/cron")){
        await endpointApi.removeScheduledFunction(id)
      }
      
      removeFromList()
    } catch(e){
      throw "Error deleting endpoint"
    }
  }
  
  return (
    <>
      <div
        className={`font-mono text-xs flex-1 p-1.5 py-1.5 my-1 font-bold ${
          active ? "bg-[#85869822]" : ""
        } hover:bg-[#85869833] cursor-pointer rounded`}
        onClick={onClick}
        onContextMenu={(e) => { e.preventDefault(); onClick(); setShowContextMenu(true);}}
      >
        <div className="flex relative">
        <div className="max-w-[240px] break-all pr-2 font-normal">
          {path.startsWith("/cron") ? (<></>) : (
            <span className={`${methodToColor(method)} font-semibold mr-1 `}>{method}</span> 
          )}
          {path.startsWith("/cron/") ? path.replace("/cron/", "") : path}
        </div>
        <FontAwesomeIcon
          icon={faEllipsisV}
          className={`ml-auto px-2 opacity-70 hover:opacity-100 rounded transition-all cursor-pointer h-4`}
          onClick={(e) =>{ onClick(); setShowContextMenu(!showContextMenu)}}          
        />
        <EndpointContextMenu
          showContextMenu={showContextMenu}
          setShowContextMenu={setShowContextMenu}
          path={path}
          // isPrivate={false}
          editFile={editFile}
          runDeleteProcess={() => { runDeleteProcess(method, path) } }
        />
      </div>
      </div>
    </>
  );
}
