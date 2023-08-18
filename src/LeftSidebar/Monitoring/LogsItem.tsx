export default function LogsItem({active = false, name, onClick}: {active?: boolean, name: string, onClick?: () => void}) {
    return(
        <>
            <div className={`flex-1 text-sm p-1.5 py-2 my-1 ${active ? "bg-[#85869822]" : ""} hover:bg-[#85869833] cursor-pointer rounded`} onClick={onClick}>
                {name}
            </div>
        </>
    )
}