import { MouseEventHandler, useState } from "react";

export default function CollectionHeader({didClickPlusButton}: {didClickPlusButton: MouseEventHandler<HTMLDivElement>}) {
    return(
        <>
            <div className={`flex-1 p-2 hover:bg-[#85869833] cursor-pointer rounded`}>
                + New Collection
            </div>

            {/* <div className={`flex justify-between flex-1 mt-0 pl-2 mr-[-6px]`} >
                <div className="w-8 mt-2">
                    {name}
                </div>
                <div className={`text-2xl cursor-pointer rounded w-8 h-8 text-center select-none ${isHovering ? "rotate-90": ""}`} onMouseEnter={() => { setIsHovering(true)}} onMouseLeave={() => { setIsHovering(false)}} onClick={didClickPlusButton} style={{transition: "transform 0.5s"}}>
                    +
                </div>
            </div> */}
        </>
    )
}