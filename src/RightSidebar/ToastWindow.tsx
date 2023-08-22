export default function ToastWindow({isHintWindowVisible, showHintWindowIfOpen, hideHintWindow, title, content, isLarge = false}: {isHintWindowVisible: boolean, showHintWindowIfOpen: () => void, hideHintWindow: () => void, title: string, content: React.ReactNode, isLarge?: boolean}) {
    return (
        <div className={`z-50 absolute mt-[-28px] ${isLarge ? "w-[600px] ml-[-608px]" : "w-[350px] ml-[-358px]"} bg-[#191A23] border border-[#525363] rounded-lg shadow-lg ${isHintWindowVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} style={{transition: "opacity 0.1s"}}
                onMouseEnter={showHintWindowIfOpen}
                onMouseLeave={hideHintWindow}
        >
        <div className='flex items-center justify-between px-4 py-2 pb-1'>
            <div className='text-sm font-bold font-mono'>{title}</div>
        </div>
        <div className='px-4 pb-2 text-sm'>
            {content}
        </div>
    </div>
    )
}