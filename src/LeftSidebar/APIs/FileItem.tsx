import { faEllipsisV, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Tooltip } from "react-tooltip";
import { formatPath } from "../../Utilities/EndpointParser";
import FileContextMenu from "./FileContextMenu";

export default function FileItem({
  active = false,
  path,
  onClick,
  disableDelete = false,
  removeFromList,
  fullPath,
  isPrivate = false,
  fallbackUrl = "",
  editFile,
}: {
  active?: boolean;
  path: string;
  onClick?: () => void;
  disableDelete?: boolean
  removeFromList?: () => void
  fullPath?: string
  isPrivate?: boolean
  fallbackUrl?: string
  editFile?: () => void
}) {
  const [showContextMenu, setShowContextMenu] = useState(false);

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
          <div className={`font-normal ${isPrivate ? "text-blue-200" : ""}`}>{formatPath(fullPath, path)}</div>
          {isPrivate ? (
            <>
            <Tooltip id="my-tooltip" className="fixed z-50" />
            <a className="ml-1 text-blue-200 opacity-70" data-tooltip-id="my-tooltip" data-tooltip-content={`Unauthenticated redirect: ${fallbackUrl}`}>
              <FontAwesomeIcon
                className={`h-2 mb-0.5 ml-0.5`}
                icon={faLock}
              />  
            </a>
            </>
          ) : <div className=""></div>}

          <FontAwesomeIcon
            icon={faEllipsisV}
            className={`ml-auto px-2 opacity-70 hover:opacity-100 rounded transition-all cursor-pointer h-4`}
            onClick={(e) =>{ e.preventDefault(); setShowContextMenu(!showContextMenu)}}
          />
          
          <FileContextMenu
            showContextMenu={showContextMenu}
            setShowContextMenu={setShowContextMenu}
            path={path}
            disableDelete={disableDelete}
            fullPath={fullPath}
            isPrivate={isPrivate}
            editFile={editFile}
          />

        </div>
      </div>
    </>
  );
}
