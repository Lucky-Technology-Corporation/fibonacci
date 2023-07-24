export default function EndpointItem({active = false, name, onClick}: {active?: boolean, name: string, onClick?: () => void}) {
    return(
        <>
            <div className={`font-mono flex-1 p-2 mt-0.5 font-bold ${active ? "bg-[#85869833]" : "hover:bg-[#85869833]"} cursor-pointer rounded`} onClick={onClick}>
                {name}
            </div>
        </>
    )
}