import { ReactNode } from "react";
import Button from "./Button";

export default function FloatingModal({content, closeModal}: {content: ReactNode, closeModal: () => void}){
    return (
        <div className={`${content == undefined ? "hidden pointer-events-none" : ""} w-1/2 overflow-scroll max-h-[90%] m-auto fixed top-[32px] border-[#525363] border bg-[#181922] rounded-md`}
        style={{left: "25%"}}>
        <div className="absolute left-3 top-4 text-lg">
          🔮
        </div>
        <Button
          className="absolute right-6 top-4 text-md cursor-pointer font-bold"
          text="Close"
          onClick={() => {
            closeModal()
          }}
        />
        <div className="mt-12 px-4 pb-4">
          {content}
        </div>
      </div>
    )
}
