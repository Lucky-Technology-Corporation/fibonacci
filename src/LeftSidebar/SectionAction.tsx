import { MouseEventHandler } from "react";

export default function SectionAction({
  text,
  onClick,
  className,
}: {
  text: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  className: string
}) {
  return (
    <>
      <div
        className={`flex-1 my-1 p-1 py-0.5 border-[#525363] border bg-[#85869833] hover:bg-[#85869855] cursor-pointer rounded text-sm ${className}`}
        onClick={onClick}
      >
        {text}
      </div>
    </>
  );
}
