import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function HelperItem({
  active = false,
  path,
  onClick,
  removeFromList,
}: {
  active?: boolean;
  path: string;
  onClick?: () => void;
  removeFromList?: () => void
}) {

  const {setPostMessage, setShouldRefreshList, shouldRefreshList} = useContext(SwizzleContext)
  const { deleteFile } = useEndpointApi()

  const runDeleteProcess = async (fileName: string) => {
    try{
      setPostMessage({
        type: "removeFile",
        fileName: "/backend/helpers/" + fileName + ".js",
      });
      await deleteFile(fileName + ".js", "helpers")
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
          <FontAwesomeIcon
            className="mr-2 ml-auto opacity-50 hover:opacity-100 rounded transition-all cursor-pointer"
            icon={faTrash}
            onClick={() => {
              const c = confirm("Are you sure you want to delete this helper?");
              if(c){
                toast.promise(runDeleteProcess(path), {
                  loading: "Deleting helper",
                  success: "Helper deleted",
                  error: "Error deleting helper"
                })
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
