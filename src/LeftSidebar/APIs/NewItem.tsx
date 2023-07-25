import { useState, useEffect, useRef } from "react";

export default function NewItem({triggerElement}: {triggerElement?: HTMLDivElement}) {

    const createFunction = () => {
    }
    const createPath = () => {
    }
    

    const [isHintWindowVisible, setIsHintWindowVisible] = useState(triggerElement ? true : false)
    const modalRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            triggerElement = undefined;
            setIsHintWindowVisible(false)
        }
      }
      
      document.addEventListener("mousedown", handleClickOutside);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside); // Unbind the event listener on clean up
      };

    }, []);

    useEffect(() => {
        if(triggerElement) {
            setIsHintWindowVisible(true)
        }
    }, [triggerElement])
    
    return (
        <div ref={modalRef} className={`cursor-pointer z-50 absolute bg-[#191A23] border border-[#525363] rounded shadow-lg ${isHintWindowVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} style={{transition: "opacity 0.15s", top: triggerElement?.offsetTop + "px", left: triggerElement?.offsetLeft + "px"}}>
            <table>
                <tbody className="divide-y divide-[#85869833]">
                    <tr onClick={createFunction}>
                        <td className='px-4 py-2 p-1 flex hover:bg-[#85869833]'>
                            <img src="/cloud.svg" alt="function" className='w-3 h-3 m-auto mx-0 mr-2'/>
                            <div className=''>API</div>
                        </td>
                    </tr>
                    <tr onClick={createPath}>
                        <td className='px-4 py-2 p-1 flex hover:bg-[#85869833]'>
                            <img src="/folder.svg" alt="function" className='w-3 h-3 m-auto mx-0 mr-2'/>
                            <div className=''>Subpath</div>
                        </td>
                    </tr>
                </tbody>
            </table>
    </div>
    )
}