import { ReactNode } from "react";

export default function DraggableElement({name, icon}: {name: string, icon: ReactNode}){

  return (
    <div className="rounded px-2 p-1 mx-2 h-fit w-fit flex cursor-pointer bg-[#85869833]" draggable={true}>
      {icon}
      <span className="ml-1">{name}</span>
    </div>
  )
}