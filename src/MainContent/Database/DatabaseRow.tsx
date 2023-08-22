import { MouseEventHandler, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import useApi from "../../API/DatabaseAPI";
import InfoItem from '../../RightSidebar/InfoItem';


export default function DatabaseRow({collection, keys, data, rowKey, setShouldShowSaveHint, showDetailView, style, shouldHideField = "_id", shouldBlockEdits = false, shouldShowStrikethrough = false}: {collection: string, keys: string[], data: any, rowKey: string, setShouldShowSaveHint: (isEditing: boolean) => void, showDetailView: MouseEventHandler<SVGSVGElement>, style?: any, shouldHideField?: string, shouldBlockEdits?: boolean, shouldShowStrikethrough?: boolean}){
    const [editing, setEditing] = useState("")
    const [rowValues, setRowValues] = useState(data);
    const [pendingInputValue, setPendingInputValue] = useState("");
    const { updateDocument } = useApi() 

    useEffect(() => {
        setRowValues(data);
    }, [data]);    

    const setupEditing = (key: string) => {
        if(shouldBlockEdits) return;
        setEditing(key);
        setShouldShowSaveHint(true);
        setPendingInputValue(rowValues[key]);
    }

    const endEditing = () => {
        setEditing("");
        const focusableElements = document.querySelectorAll(
            'input'
        );
        focusableElements.forEach((element) => element.blur());
        setShouldShowSaveHint(false);
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
        var document = {...rowValues}
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
                    <td className={`font-mono border-none`} key={`${rowKey}-${0}`}>
                        <EllipsisVerticalIcon onClick={showDetailView} className="h-5 m-auto py-0.5 cursor-pointer text-[#D9D9D9]" />
                    </td>
                    {keys.filter(k => k !== shouldHideField).map((key, index) => {
                        const value = rowValues[key];
                        const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
                        return (
                            <td className={`font-mono p-1 border-none ${(editing === key) ? "bg-[#383842]" : ""}`} key={`${rowKey}-${index+1}`}>
                                {isObject ? (
                                    <InfoItem
                                        content={
                                            <div className='text-xs font-mono'>Hover to View JSON</div>
                                        }
                                        toast={{
                                            title: "JSON Content",
                                            content: (
                                                <div className='text-gray-400 text-xs max-w-358 font-mono'>
                                                    {JSON.stringify(value, null, 2)}
                                                </div>
                                            ), 
                                            
                                        }}
                                        position = "bottom-right"
                                    />
                                ) : (
                                    <input 
                                    type="text" 
                                    className={`w-full bg-transparent border-0 outline-0 text-xs ${shouldShowStrikethrough ? "line-through" : ""} ${((value || "").toString()).startsWith("https://") && shouldBlockEdits ? "cursor-pointer" : ""}`} 
                                    onFocus={() => setupEditing(key)}
                                    value={(editing === key) ? pendingInputValue : value}
                                    onClick={() => {
                                        if((value || "").toString().startsWith("https://") && shouldBlockEdits){
                                            window.open(value, "_blank")
                                        }
                                    }}
                                    onChange={(event) => setPendingInputValue(event.target.value)}
                                    onKeyDown={(event) => {
                                        if(event.key === "Enter"){
                                            saveNewValues(key, pendingInputValue)
                                        } else if(event.key === "Escape"){
                                            endEditing()
                                        }
                                    }}                                    />
                                )}
                            </td>
                        );
                    })}
                </tr>
            );
        }
        