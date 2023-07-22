import { MouseEventHandler, useState } from "react";

export default function EndpointHeader({path, level, didClickPlusButton}: {path: string, level: number, didClickPlusButton: MouseEventHandler<HTMLDivElement>}) {
    const [isHovering, setIsHovering] = useState(false)
    const [isEditing, setIsEditing] = useState(false)


    return(
        <>
            <div className={`flex justify-between flex-1 mt-3 ml-0.5 font-mono mr-[-4px]`} style={{paddingLeft: (level*8)+"px"}}>
                <div className="w-8 h-6 mt-1.5 cursor-text" onClick={() => setIsEditing(true)}>
                    {!isEditing ? ("/"+path) : "*editing*"}
                </div>
                <div className={`text-xl cursor-pointer rounded w-6 h-6 text-center select-none origin-center ${isHovering ? "rotate-90": ""}`} onMouseEnter={() => { setIsHovering(true)}} onMouseLeave={() => { setIsHovering(false)}} onClick={didClickPlusButton} style={{transition: "transform 0.5s"}}>
                    +
                </div>
            </div>
        </>
    )
}