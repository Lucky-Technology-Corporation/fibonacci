import { ReactNode, useEffect, useRef } from "react";

export default function CategoryLabel({name, icon, handleDragStart, handleDragEnd}: {name: string, icon: ReactNode, handleDragStart: any, handleDragEnd: any}){
  const draggableElement = useRef(null);

  useEffect(() => {
    // Assuming the draggable element has an ID of 'draggable'
    if (draggableElement.current) {
      draggableElement.current.addEventListener('dragstart', handleDragStart);
      draggableElement.current.addEventListener('dragend', handleDragEnd);
    }

    return () => {
      if (draggableElement.current) {
        draggableElement.current.removeEventListener('dragstart', handleDragStart);
        draggableElement.current.removeEventListener('dragend', handleDragEnd);
      }
    };
  }, []);

  return (
    <div className="rounded px-2 p-1 mx-2 h-fit w-fit flex cursor-pointer bg-[#85869833] hover:bg-[#85869855]" ref={draggableElement} draggable={true}>
      {icon}
      <span className="ml-1">{name}</span>
    </div>
  )
}