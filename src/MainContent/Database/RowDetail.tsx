import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { castValues } from "../../Utilities/DataCaster";
import useApi from "../../API/DatabaseAPI";

export default function RowDetail({
  collection,
  data,
  clickPosition,
  addHiddenRow,
  deleteAction = "delete",
  shouldHideCopy = false,
  setTotalDocs,
  openNewDocumentWithData = () => {},
  deleteFunction = null,
}: {
  collection: string;
  data: any;
  clickPosition: { x: number; y: number };
  addHiddenRow: (row: string) => void;
  deleteAction?: "delete" | "deactivate";
  shouldHideCopy?: boolean;
  setTotalDocs: React.Dispatch<React.SetStateAction<number>>;
  openNewDocumentWithData?: (data: any) => void;
  deleteFunction?: (data: any) => Promise<any>;
}) {
  const { deleteDocument, updateDocument } = useApi();

  const copyJSON = () => {
    clickPosition = { x: 0, y: 0 };
    setIsHintWindowVisible(false);
    var niceData = { ...data };
    delete niceData._id;
    niceData = castValues(niceData);
    navigator.clipboard.writeText(JSON.stringify(niceData, null, 2));
    toast.success("Copied JSON to clipboard!");
  };

  const runDuplicate = () => {
    clickPosition = { x: 0, y: 0 };
    setIsHintWindowVisible(false);
    var niceData = { ...data };
    delete niceData._id;
    niceData = castValues(niceData);
    openNewDocumentWithData(niceData);
  };

  const runDeleteDocument = () => {
    clickPosition = { x: 0, y: 0 };
    setIsHintWindowVisible(false);
    if (deleteAction == "delete") {
      const c = confirm("Are you sure you want to delete this document? This cannot be undone.");
      if (c) {
        if (deleteFunction != null) {
          toast.promise(deleteFunction(data), {
            loading: "Deleting...",
            success: () => {
              addHiddenRow(data._id);
              setTotalDocs((totalDocs) => totalDocs - 1);
              return "Deleted";
            },
            error: "Failed to delete",
          });
        } else {
          toast.promise(deleteDocument(collection, data._id), {
            loading: "Deleting...",
            success: () => {
              addHiddenRow(data._id);
              setTotalDocs((totalDocs) => totalDocs - 1);
              return "Deleted";
            },
            error: "Failed to delete",
          });
        }
      }
    } else if (deleteAction == "deactivate") {
      if (data._deactivated) {
        var newData = { ...data };
        newData._deactivated = false;
        toast.promise(updateDocument(collection, data._id, newData), {
          loading: "Reactivating user...",
          success: () => {
            addHiddenRow(data._id);
            return "User reactivated";
          },
          error: (e: any) => {
            console.error(e);
            return "Failed to reactivate this user";
          },
        });
      } else {
        const c = confirm("Are you sure you want to deactivate this user? They will not be able to sign in anymore.");
        if (c) {
          var newData = { ...data };
          newData._deactivated = true;
          toast.promise(updateDocument(collection, data._id, newData), {
            loading: "Deactivating user...",
            success: () => {
              addHiddenRow(data._id);
              return "User deactivated";
            },
            error: "Failed to deactivate this user",
          });
        }
      }
    }
  };

  const [isHintWindowVisible, setIsHintWindowVisible] = useState(clickPosition.x > 0 && clickPosition.y > 0);
  const modalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        clickPosition = { x: 0, y: 0 };
        setIsHintWindowVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Unbind the event listener on clean up
    };
  }, []);

  useEffect(() => {
    if (clickPosition.x > 0 && clickPosition.y > 0) {
      setIsHintWindowVisible(true);
    }
  }, [clickPosition]);

  const getAction = () => {
    if (deleteAction == "delete") {
      return "Delete";
    } else if (deleteAction == "deactivate") {
      if (data._deactivated) {
        return "Activate";
      } else {
        return "Deactivate";
      }
    }
  };

  return (
    <div
      ref={modalRef}
      className={`cursor-pointer z-50 absolute bg-[#191A23] border border-[#525363] rounded shadow-lg ${
        isHintWindowVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.15s",
        top: clickPosition.y + "px",
        left: clickPosition.x + "px",
      }}
    >
      <table>
        <tbody className="divide-y divide-[#85869833]">
          {!shouldHideCopy && (
            <>
              <tr onClick={runDuplicate}>
                <td className="px-4 py-2 p-1 flex hover:bg-[#85869833]">
                  <div className="">Duplicate</div>
                </td>
              </tr>
              <tr onClick={copyJSON}>
                <td className="px-4 py-2 p-1 flex hover:bg-[#85869833]">
                  <div className="">Copy JSON</div>
                </td>
              </tr>
            </>
          )}
          <tr onClick={runDeleteDocument}>
            <td className="px-4 py-2 p-1 flex hover:bg-[#85869833]">
              <div className="">{getAction()}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
