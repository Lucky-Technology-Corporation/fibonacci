import { ReactNode } from "react";

export default function ElementList({children, cancel}: {children: ReactNode[], cancel: () => void}){
  return (
    <>
        <div className="flex justify-between w-full">
          <div className="ml-2">Drag and drop</div>
          <a className="cursor-pointer" onClick={cancel}>Cancel</a>
        </div>
        <div className="flex flex-wrap">
          {children}
        </div>
    </>
  )
}