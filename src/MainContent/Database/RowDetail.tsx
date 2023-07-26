import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { castValues } from "../../Utilities/DataCaster";
import useApi from "../../API/DatabaseAPI";

export default function RowDetail({collection, data, clickPosition, addHiddenRow}: {collection: string, data: any, clickPosition: {x: number, y: number}, addHiddenRow: (row: string) => void}){
    
    const { deleteDocument } = useApi();
    
    const copyJSON = () => {
        clickPosition = {x:0, y:0};
        setIsHintWindowVisible(false)
        var niceData = data;
        delete niceData._id;
        niceData = castValues(niceData)
        navigator.clipboard.writeText(JSON.stringify(niceData, null, 2));
        toast.success("Copied JSON to clipboard!")
    }
    const runDeleteDocument = () => {
        clickPosition = {x:0, y:0};
        setIsHintWindowVisible(false)
        const c = confirm("Are you sure you want to delete this document? This cannot be undone.");
        if(c){
            toast.promise(deleteDocument(collection, data._id), {
                loading: "Deleting document...",
                success: () => {
                    addHiddenRow(data._id)
                    return "Deleted document!"
                },
                error: "Failed to delete document"
            })
        }
    }
    

    const [isHintWindowVisible, setIsHintWindowVisible] = useState((clickPosition.x > 0 && clickPosition.y > 0))
    const modalRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            clickPosition = {x:0, y:0};
            setIsHintWindowVisible(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside); // Unbind the event listener on clean up
      };

    }, []);

    useEffect(() => {
        if(clickPosition.x > 0 && clickPosition.y > 0) {
            setIsHintWindowVisible(true)
        }
    }, [clickPosition])

    return (
        <div ref={modalRef} className={`cursor-pointer z-50 absolute bg-[#191A23] border border-[#525363] rounded shadow-lg ${isHintWindowVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} style={{transition: "opacity 0.15s", top: clickPosition.y + "px", left: clickPosition.x + "px"}}>
            <table>
                <tbody className="divide-y divide-[#85869833]">
                    <tr onClick={copyJSON}>
                        <td className='px-4 py-2 p-1 flex hover:bg-[#85869833]'>
                            <div className=''>Copy JSON</div>
                        </td>
                    </tr>
                    <tr onClick={runDeleteDocument}>
                        <td className='px-4 py-2 p-1 flex hover:bg-[#85869833]'>
                            <div className=''>Delete Document</div>
                        </td>
                    </tr>
                </tbody>
            </table>
    </div>
    )
}