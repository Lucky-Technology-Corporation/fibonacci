import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { castValues } from "../../Utilities/DataCaster";
import useApi from "../../API/DatabaseAPI";

const DELETE_ACTION = "delete";
const DEACTIVATE_ACTION = "deactivate";
const INITIAL_CLICK_POSITION = { x: 0, y: 0 };

const CopyJSONButton = ({ data, setIsHintWindowVisible }) => {
  const copyJSON = () => {
    setIsHintWindowVisible(false);
    const dataCopy = { ...data };
    delete dataCopy._id;
    const castedData = castValues(dataCopy);
    navigator.clipboard.writeText(JSON.stringify(castedData, null, 2));
    toast.success("Copied JSON to clipboard!");
  };

  return <button onClick={copyJSON}>Copy JSON</button>;
};

const DuplicateButton = ({ data, setIsHintWindowVisible, openNewDocumentWithData }) => {
  const duplicateData = () => {
    setIsHintWindowVisible(false);
    const dataCopy = { ...data };
    delete dataCopy._id;
    const castedData = castValues(dataCopy);
    openNewDocumentWithData(castedData);
  };

  return <button onClick={duplicateData}>Duplicate</button>;
};

const DeleteDocumentButton = ({ data, setIsHintWindowVisible, deleteAction, deleteFunction, addHiddenRow, setTotalDocs, deleteDocument, updateDocument }) => {
  const deleteDocument = () => {
    setIsHintWindowVisible(false);
    if (deleteAction === DELETE_ACTION) {
      const confirmDelete = confirm("Are you sure you want to delete this document? This cannot be undone.");
      if (confirmDelete) {
        const deletePromise = deleteFunction ? deleteFunction(data) : deleteDocument(collection, data._id);
        toast.promise(deletePromise, {
          loading: "Deleting...",
          success: () => {
            addHiddenRow(data._id);
            setTotalDocs((totalDocs) => totalDocs - 1);
            return "Deleted";
          },
          error: "Failed to delete",
        });
      }
    } else if (deleteAction === DEACTIVATE_ACTION) {
      const newData = { ...data };
      if (data._deactivated) {
        newData._deactivated = false;
      } else {
        const confirmDeactivate = confirm("Are you sure you want to deactivate this user? They will not be able to sign in anymore.");
        if (confirmDeactivate) {
          newData._deactivated = true;
        }
      }
      toast.promise(updateDocument(collection, data._id, newData), {
        loading: data._deactivated ? "Reactivating user..." : "Deactivating user...",
        success: () => {
          addHiddenRow(data._id);
          return data._deactivated ? "User reactivated" : "User deactivated";
        },
        error: "Failed to update user status",
      });
    }
  };

  return <button onClick={deleteDocument}>{getDeleteActionText(deleteAction, data._deactivated)}</button>;
};

const getDeleteActionText = (deleteAction, isDeactivated) => {
  if (deleteAction === DELETE_ACTION) {
    return "Delete";
  } else if (deleteAction === DEACTIVATE_ACTION) {
    return isDeactivated ? "Activate" : "Deactivate";
  }
};

export default function RowDetail({
  collection,
  data,
  clickPosition = INITIAL_CLICK_POSITION,
  addHiddenRow,
  deleteAction = DELETE_ACTION,
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
  const [isHintWindowVisible, setIsHintWindowVisible] = useState(clickPosition.x > 0 && clickPosition.y > 0);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        clickPosition = INITIAL_CLICK_POSITION;
        setIsHintWindowVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (clickPosition.x > 0 && clickPosition.y > 0) {
      setIsHintWindowVisible(true);
    }
  }, [clickPosition]);

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
              <tr>
                <td className="px-4 py-2 p-1 flex hover:bg-[#85869833]">
                  <DuplicateButton data={data} setIsHintWindowVisible={setIsHintWindowVisible} openNewDocumentWithData={openNewDocumentWithData} />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 p-1 flex hover:bg-[#85869833]">
                  <CopyJSONButton data={data} setIsHintWindowVisible={setIsHintWindowVisible} />
                </td>
              </tr>
            </>
          )}
          <tr>
            <td className="px-4 py-2 p-1 flex hover:bg-[#85869833]">
              <DeleteDocumentButton data={data} setIsHintWindowVisible={setIsHintWindowVisible} deleteAction={deleteAction} deleteFunction={deleteFunction} addHiddenRow={addHiddenRow} setTotalDocs={setTotalDocs} deleteDocument={deleteDocument} updateDocument={updateDocument} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
