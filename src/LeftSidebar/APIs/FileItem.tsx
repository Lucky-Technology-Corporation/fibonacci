import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function FileItem({
  active = false,
  path,
  onClick,
  disableDelete = false,
  removeFromList,
  fullPath,
}: {
  active?: boolean;
  path: string;
  onClick?: () => void;
  disableDelete?: boolean
  removeFromList?: () => void
  fullPath?: string
}) {

  const {setPostMessage, setShouldRefreshList, shouldRefreshList } = useContext(SwizzleContext)
  const { deleteFile } = useEndpointApi()

  const runDeleteProcess = async (fileName: string) => {

    try{
      setPostMessage({
        type: "removeFile",
        fileName: fullPath.replace("/home/swizzle/code", ""),
      });
      await deleteFile(fullPath.replace("/home/swizzle/code/frontend/src/", ""), "frontend")
      removeFromList()
    } catch(e){
      throw "Error deleting endpoint"
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
          <div>{path}</div>
          {!disableDelete && (
            <FontAwesomeIcon
              className={`mr-2 ml-auto opacity-50 hover:opacity-100 rounded transition-all cursor-pointer`}
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
