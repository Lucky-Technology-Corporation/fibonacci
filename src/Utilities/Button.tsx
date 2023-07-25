export default function Button({text, onClick}: {text: string, onClick: () => void}){
    return(
        <div onClick={onClick} className="px-5 py-1 font-medium bg-[#85869833] rounded flex justify-center items-center cursor-pointer hover:bg-[#85869855] border-[#525363] border">
            {text}
        </div>
    )
}