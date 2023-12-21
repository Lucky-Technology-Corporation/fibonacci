import { useContext, useState } from "react";
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

  const [showContextMenu, setShowContextMenu] = useState(false);
  const {setPostMessage, setShouldRefreshList, shouldRefreshList} = useContext(SwizzleContext)
  const { deleteFile } = useEndpointApi()

  const runDeleteProcess = async (fileName: string) => {
    try{
      //close file
      setPostMessage({
        type: "removeFile",
        fileName: "/backend/helpers/" + fileName + ".ts",
      });
      //clean up codegen
      //TODO: clean up all imports in all other files here. this is not implemented right now though.
      // await removeFile("/backend/helpers/" + fileName + ".ts")
      //delete file
      await deleteFile(fileName + ".ts", "helpers")
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
          <div className="font-normal">{path}</div>

          {/* <FontAwesomeIcon
            icon={faEllipsisV}
            className={`ml-auto px-2 opacity-70 hover:opacity-100 rounded transition-all cursor-pointer h-4`}
            onClick={(e) =>{ e.preventDefault(); setShowContextMenu(!showContextMenu)}}
          /> */}

          {/* <EndpointContextMenu
            showContextMenu={showContextMenu}
            setShowContextMenu={setShowContextMenu}
            path={path}
            runDeleteProcess={() => { runDeleteProcess(path) } }
            editFile={() => {}}
          /> */}

        </div>
      </div>
    </>
  );
}
