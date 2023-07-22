export default function EditorAssistant({isOpen, caretPosition}: {isOpen: boolean, caretPosition: {top: number, left: number}}) {

    const ReturnKey = () => {
        return (
            <div className="bg-[#2F303A] border-[#525363] border rounded-sm px-1 mr-1.5 py-0.5 text-xs font-bold">RETURN</div>
        )
    }
    const DeleteKey = () => {
        return (
            <div className="bg-[#2F303A] border-[#525363] border rounded-sm px-1 mr-1.5 py-0.5 text-xs font-bold">DELETE</div>
        )
    }
    return (
        <>
            <div className={`flex absolute w-50 ${isOpen ? "" : "hidden"}`} style={{top: (caretPosition.top + 22) + "px", left: caretPosition.left + "px"}}>
                <ReturnKey /> to AI autocomplete&nbsp;&nbsp;&nbsp;<DeleteKey /> to cancel
            </div>
        </>
    )
}