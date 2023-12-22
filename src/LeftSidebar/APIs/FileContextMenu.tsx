import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useFilesystemApi from "../../API/FilesystemAPI";
import { capitalizeAfterLastSlash, formatPath } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import TailwindModal from "../../Utilities/TailwindModal";

export default function FileContextMenu({
  showContextMenu,
  setShowContextMenu,
  path,
  disableDelete,
  fullPath,
  isPrivate,
  editFile,
}: {
  showContextMenu: boolean;
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
  path: string;
  disableDelete: boolean;
  fullPath: string;
  isPrivate: boolean;
  editFile: () => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { setPostMessage, setShouldRefreshList, shouldRefreshList } = useContext(SwizzleContext);
  const filesystemApi = useFilesystemApi();

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

  const runDeleteProcess = async () => {
    try {
      var fileNameParsed = fullPath.replace("/home/swizzle/code", "");
      fileNameParsed = capitalizeAfterLastSlash(fileNameParsed);
      if (!fileNameParsed.endsWith(".tsx")) {
        fileNameParsed = fileNameParsed + ".tsx";
      }

      //close file
      setPostMessage({
        type: "removeFile",
        fileName: fileNameParsed,
      });

      //clean up codegen
      if (fileNameParsed.includes("/pages/")) {
        const urlPath = formatPath(fullPath, path, true);
        await filesystemApi.deletePage(urlPath);
      } else {
        const relativeFilePath = fileNameParsed.split("/components/")[1];
        await filesystemApi.deleteComponent(relativeFilePath);
      }

      setShouldRefreshList(!shouldRefreshList);
    } catch (e) {
      throw "Error deleting endpoint";
    }
  };

  return (
    <>
      <div
        ref={modalRef}
        className="bg-[#333336] p-1 rounded-md border border-[#525363] absolute top-1 right-0 font-normal z-50 mt-2 mr-2"
        style={{ display: showContextMenu ? "block" : "none" }}
      >
        {!disableDelete && (
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

        {!disableDelete && fullPath && !fullPath.includes("/pages/SwizzleHomePage.ts") && (
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
        )}
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
          toast.promise(runDeleteProcess(), {
            loading: "Deleting...",
            success: "Deleted",
            error: "Error deleting",
          });
          setShowContextMenu(false);
        }}
      />
    </>
  );
}
