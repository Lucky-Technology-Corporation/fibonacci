import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import TailwindModal from "../../Utilities/TailwindModal";

export default function EndpointContextMenu({
  showContextMenu,
  setShowContextMenu,
  path,
  isPrivate,
  runDeleteProcess,
  editFile,
}: {
  showContextMenu: boolean;
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
  path: string;
  isPrivate?: boolean;
  runDeleteProcess: () => void;
  editFile: () => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  return (
    <>
      <div
        ref={modalRef}
        className="bg-[#333336] p-1 rounded-md border border-[#525363] absolute top-1 right-0 font-normal z-50 mt-2 mr-2"
        style={{ display: showContextMenu ? "block" : "none" }}
      >
        {editFile != undefined && (
          <div className="font-sans text-sm hover:bg-gray-800">
            <div
              className="p-2 text-gray-300 hover:text-gray-100 cursor-pointer"
              onClick={() => {
                editFile();
              }}
            >
              <FontAwesomeIcon className={`mr-2 rounded transition-all cursor-pointer mt-0.5`} icon={faPencil} />
              Edit
            </div>
          </div>
        )}
        {/* {(isPrivate != undefined) && (
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
            )} */}

        <div className="font-sans text-sm hover:bg-gray-800">
          <div
            className="p-2 text-gray-300 hover:text-gray-100 cursor-pointer"
            onClick={() => {
              setShowDeleteModal(true);
            }}
          >
            <FontAwesomeIcon className={`mr-2 rounded transition-all cursor-pointer mt-0.5`} icon={faTrash} />
            Delete
          </div>
        </div>

        <div className="font-sans text-sm hover:bg-gray-800">
          <div
            className="p-2 text-gray-300 hover:text-gray-100 cursor-pointer"
            onClick={() => {
              setShowContextMenu(false);
            }}
          >
            Cancel
          </div>
        </div>
      </div>
      <TailwindModal
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        title="Delete"
        subtitle="Are you sure you want to delete this?"
        confirmButtonText="Delete"
        confirmButtonAction={() => {
          runDeleteProcess();
          setShowContextMenu(false);
        }}
      />
    </>
  );
}
