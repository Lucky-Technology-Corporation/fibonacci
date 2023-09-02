import { MouseEventHandler } from "react";

export default function SectionAction({
  text,
  onClick,
}: {
  text: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <>
      <div
        className={`flex-1 my-2 p-1.5 border-[#525363] border bg-[#85869833] hover:bg-[#85869855] cursor-pointer rounded text-sm`}
        onClick={onClick}
      >
        {text}
      </div>
    </>
  );
}
