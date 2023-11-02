import { faLock, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import toast from "react-hot-toast";
import { Tooltip } from 'react-tooltip';
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function FileItem({
  active = false,
  path,
  onClick,
  disableDelete = false,
  removeFromList,
  fullPath,
  isPrivate = false,
  fallbackUrl = ""
}: {
  active?: boolean;
  path: string;
  onClick?: () => void;
  disableDelete?: boolean
  removeFromList?: () => void
  fullPath?: string
  isPrivate?: boolean
  fallbackUrl?: string
}) {

  const {setPostMessage, setShouldRefreshList, shouldRefreshList } = useContext(SwizzleContext)
  const { deleteFile } = useEndpointApi()

  const runDeleteProcess = async (fileName: string) => {

    try{
      var postBody = {
        type: "removeFile",
        fileName: fullPath.replace("/home/swizzle/code", ""),
      }
      if(fullPath.includes("/frontend/src/pages")){ 
        postBody["routePath"] = formatPath(path)
      }
      setPostMessage(postBody);
      await deleteFile(fullPath.replace("/home/swizzle/code/frontend/src/", ""), "frontend")
      setShouldRefreshList(!shouldRefreshList)
    } catch(e){
      throw "Error deleting endpoint"
    }
  }

  const formatPath = (path: string) => {
    if((fullPath || "").includes("frontend/src/pages")){
      var p = path
      var p = p.replace(".ts", "").replace(/\./g, "/").toLowerCase()
      if(!p.startsWith("/")){
        p = "/" + p
      }
      if(p == "/home"){
        p = "/"
      }
      return p
    } else{
      return path
    }
  }

  return (
    <>
      <div
        className={`font-mono text-xs flex-1 p-1.5 py-2 my-1 font-bold ${
          active ? "bg-[#85869822]" : ""
        } hover:bg-[#85869833] cursor-pointer rounded`}
        onClick={onClick}
      >
        <div className="flex">
          <div className="font-normal">{formatPath(path)}</div>
          {isPrivate ? (
            <>
            <Tooltip id="my-tooltip" className="fixed z-50" />
            <a className="ml-auto mr-2 opacity-50 text-white hover:text-white hover:opacity-70" data-tooltip-id="my-tooltip" data-tooltip-content={`Unauthenticated redirect: ${fallbackUrl}`}>
              <FontAwesomeIcon
                className={``}
                icon={faLock}
              />  
            </a>
            </>
          ) : <div className="ml-auto"></div>}
          {(!disableDelete && !fullPath.includes("/pages/SwizzleHomePage.ts")) && (
            <FontAwesomeIcon
              className={`mr-2 opacity-50 hover:opacity-100 rounded transition-all cursor-pointer mt-0.5`}
              icon={faTrash}
              onClick={() => {
                const c = confirm("Are you sure you want to delete this endpoint?");
                if(c){
                  toast.promise(runDeleteProcess(path), {
                    loading: "Deleting component",
                    success: "Component deleted",
                    error: "Error deleting component"
                  })
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
