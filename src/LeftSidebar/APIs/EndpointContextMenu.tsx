import { faLock, faLockOpen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function EndpointContextMenu({showContextMenu, setShowContextMenu, path, isPrivate, runDeleteProcess}: {showContextMenu: boolean, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>, path: string, isPrivate?: boolean, runDeleteProcess: () => void }){

  
    const modalRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setShowContextMenu(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside); // Unbind the event listener on clean up
      };
    }, []);

    const {setPostMessage, setShouldRefreshList, shouldRefreshList } = useContext(SwizzleContext)
  



    return (
    <>
        <div ref={modalRef} className="bg-[#333336] p-1 rounded-md border border-[#525363] absolute top-1 right-0 font-normal z-50 mt-2 mr-2" style={{display: showContextMenu ? "block" : "none"}}>

          {(isPrivate != undefined) && (
            <div className="font-sans text-sm hover:bg-gray-800">
                <div className="p-2 text-gray-300 hover:text-gray-100 cursor-pointer"
                onClick={() => {
                    if(isPrivate){
                      //remove auth
                    } else{
                      //add auth
                    }
                    setShowContextMenu(false)
                }}
                >
                <FontAwesomeIcon
                    className={`mr-2 rounded transition-all cursor-pointer mt-0.5`}
                    icon={isPrivate ? faLockOpen : faLock}
                />
                {isPrivate ? "Remove auth" : "Add auth"}
                </div>
            </div>
            )}

            <div className="font-sans text-sm hover:bg-gray-800">
                <div
                    className="p-2 hover:text-red-500 cursor-pointer"
                    onClick={() => {
                        const c = confirm("Are you sure you want to delete this endpoint?");
                        if(c){
                            runDeleteProcess()
                            setShowContextMenu(false)
                        }
                    }}
                >
                    <FontAwesomeIcon
                    className={`mr-2 rounded transition-all cursor-pointer mt-0.5`}
                    icon={faTrash}
                    />
                    Delete
                </div>
            </div>

            <div className="font-sans text-sm hover:bg-gray-800">
                <div
                    className="p-2 text-gray-300 hover:text-gray-100 cursor-pointer"
                    onClick={() => { setShowContextMenu(false) }}
                >
                    Cancel
                </div>
            </div>
        </div>
    </>
    )
}