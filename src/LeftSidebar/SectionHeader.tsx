import { useState } from "react";
import Chevron from "../Utilities/Chevron";

export default function SectionHeader({icon, text, active, onClick}: {icon: string, text: string, active: boolean, onClick: () => void}) {
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
    <div className="w-full font-semibold px-2 py-2 mt-2 text-sm flex align-middle cursor-pointer hover:text-white" onClick={onClick} onMouseEnter={teaseChevron} onMouseLeave={resetChevron}>
        <img src={icon} className="inline-block w-4 h-4 mr-1.5 m-auto ml-0" />
        {text}
        <div className="mt-0.5 ml-auto"><Chevron size={14} active={active} tease={isHovering} /></div>
    </div>
    )
}