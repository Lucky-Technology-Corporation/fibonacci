import { useState } from "react";
import Chevron from "../Utilities/Chevron";

export default function SectionHeader({icon, text, active}: {icon: string, text: string, active: boolean}) {
    const [isHovering, setIsHovering] = useState(false)
    
    const teaseChevron = () => {
        if(!active){
            setIsHovering(true)
        }
    }
    const resetChevron = () => {
        setIsHovering(false)
    }

    return(
    <div className="w-full font-semibold px-2 py-2 mt-4 text-sm flex align-middle cursor-pointer" onMouseEnter={teaseChevron} onMouseLeave={resetChevron}>
        <img src={icon} className="inline-block w-3 h-3 mr-2 m-auto ml-0" />
        {text}
        <div className="mt-0.5 ml-auto"><Chevron size={18} active={active} tease={isHovering} /></div>
    </div>
    )
}