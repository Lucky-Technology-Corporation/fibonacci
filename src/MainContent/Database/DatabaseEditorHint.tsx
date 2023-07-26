export default function DatabaseEditorHint({isVisible}: {isVisible: boolean}) {

    const ReturnKey = () => {
        return (
            <div className="bg-[#2F303A] border-[#525363] border rounded-sm px-1 mr-1.5 py-0.5 text-xs font-bold">RETURN</div>
        )
    }
    const EscKey = () => {
        return (
            <div className="bg-[#2F303A] border-[#525363] border rounded-sm px-1 mr-1.5 py-0.5 text-xs font-bold">ESC</div>
        )
    }
    return (
        <>
            <div className={`flex flex-col bg-[#181922] p-1 mt-[-6px] absolute right-0 mr-4 w-50 ${isVisible ? "" : "hidden"}`}>
                <div className="flex mb-2"><ReturnKey /> to save</div>
                <div className="flex"><EscKey /> to discard changes</div>
            </div>
        </>
    )
}