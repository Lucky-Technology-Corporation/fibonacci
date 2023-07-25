import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function RowDetail({data, clickPosition}: {data: any, clickPosition: {x: number, y: number}}){
    
    const copyJSON = () => {
        clickPosition = {x:0, y:0};
        setIsHintWindowVisible(false)
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        toast.success("Copied JSON to clipboard!")
    }
    const deleteDocument = () => {
        clickPosition = {x:0, y:0};
        setIsHintWindowVisible(false)
        const c = confirm("Are you sure you want to delete this document? This cannot be undone.");
        if(c){
            // TODO: delete document
            toast.success("Deleted document!")
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
        console.log(clickPosition)
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
                    <tr onClick={deleteDocument}>
                        <td className='px-4 py-2 p-1 flex hover:bg-[#85869833]'>
                            <div className=''>Delete Document</div>
                        </td>
                    </tr>
                </tbody>
            </table>
    </div>
    )
}