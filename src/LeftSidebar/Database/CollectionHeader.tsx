import { MouseEventHandler } from "react";

export default function CollectionHeader({didClickPlusButton}: {didClickPlusButton: MouseEventHandler<HTMLDivElement>}) {
    return(
        <>
            <div className={`flex-1 mt-1 p-1.5 px-2 mb-2 border-[#525363] border bg-[#85869833] hover:bg-[#85869855] cursor-pointer rounded text-sm`} onClick={didClickPlusButton}>
                + New Collection
            </div>
        </>
    )
}