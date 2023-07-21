import { MouseEventHandler, useState } from "react";

export default function EndpointHeader({path, level, didClickPlusButton}: {path: string, level: number, didClickPlusButton: MouseEventHandler<HTMLDivElement>}) {
    const [isHovering, setIsHovering] = useState(false)
    return(
        <>
            <div className={`flex justify-between flex-1 mt-1 font-mono`} style={{paddingLeft: (level*8)+"px"}}>
                <div className="w-8 h-8 mt-2">
                    /{path}
                </div>
                <div className={`text-2xl cursor-pointer rounded w-8 h-8 text-center select-none ${isHovering ? "rotate-90": ""}`} onMouseEnter={() => { setIsHovering(true)}} onMouseLeave={() => { setIsHovering(false)}} onClick={didClickPlusButton} style={{transition: "transform 0.5s"}}>
                    +
                </div>
            </div>
        </>
    )
}