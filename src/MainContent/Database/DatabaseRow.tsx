import { MouseEventHandler, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import useApi from "../../API/DatabaseAPI";

export default function DatabaseRow({collection, keys, data, rowKey, setParentIsEditing, showDetailView, style}: {collection: string, keys: string[], data: any, rowKey: string, setParentIsEditing: (isEditing: boolean) => void, showDetailView: MouseEventHandler<HTMLButtonElement>, style?: any}){
    const [editing, setEditing] = useState("")
    const [rowValues, setRowValues] = useState(data);
    const [pendingInputValue, setPendingInputValue] = useState("");
    const { updateDocument } = useApi() 

    const setupEditing = (key: string) => {
        setEditing(key);
        setParentIsEditing(true);
        setPendingInputValue(rowValues[key]);
    }

    const endEditing = () => {
        setEditing("");
        const focusableElements = document.querySelectorAll(
            'input'
        );
        focusableElements.forEach((element) => element.blur());
        setParentIsEditing(false);
    }

    const modalRef = useRef<HTMLTableRowElement | null>(null);
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            endEditing()
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const saveNewValues = (key: string, value: string) => {
        var document = rowValues
        document[key] = value
        setRowValues({...rowValues, [key]: pendingInputValue});
        toast.promise(updateDocument(collection, document._id, document), {
            loading: "Updating document...",
            success: "Updated document!",
            error: "Failed to update document"
        })
        endEditing()
    }

    return (
        <tr className="hover:bg-[#85869822]" ref={modalRef} key={rowKey} style={style}>
            <td className={`font-mono p-1 border-none`} key={`${rowKey}-${0}`}>
                <button onClick={showDetailView} >
                    <EllipsisVerticalIcon className="mt-1 h-4 w-4 text-[#D9D9D9]" />
                </button>
            </td>
            {keys.filter(k => k != "_id").map((key, index) => (
                <td className={`font-mono p-1 border-none ${(editing == key) ? "bg-[#383842]" : ""}`} key={`${rowKey}-${index+1}`}>
                    <input 
                        type="text" 
                        className="w-full bg-transparent border-0 outline-0" 
                        onFocus={() => setupEditing(key)}
                        value={(editing == key) ? pendingInputValue : rowValues[key]}
                        onChange={(event) => setPendingInputValue(event.target.value)}
                        onKeyDown={(event) => {
                            if(event.key == "Enter"){
                                saveNewValues(key, pendingInputValue)
                            } else if(event.key == "Escape"){
                                endEditing()
                            }
                        }}/>
                </td>
            ))}
        </tr>
    )
}