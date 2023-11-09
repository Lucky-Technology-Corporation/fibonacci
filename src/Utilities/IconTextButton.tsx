import { ReactNode } from "react";
import { Tooltip } from "react-tooltip";
import Button from "./Button";

export default function IconTextButton({
  onClick,
  icon,
  text,
  textHidden,
  highlightState = false,
  highlightColor = "",
  className = "",
}: {
  onClick: () => void;
  icon: ReactNode;
  text: string;
  textHidden?: boolean;
  highlightState?: boolean;
  highlightColor?: string;
  className?: string;
}) {
  return (
    <>
    <Tooltip id="my-tooltip" className={`fixed z-50 ${!textHidden && "hidden"}`} />
      <a className="" data-tooltip-id="my-tooltip" data-tooltip-content={text} data-tooltip-place="left">
      <Button
        className={`${className} w-full p-2 font-medium rounded flex justify-center items-center cursor-pointer ${!highlightState && "bg-[#85869833]"} hover:bg-[#85869855] border-[#525363] border`}
        onClick={onClick}
        text="Test"
        style={{backgroundColor: highlightState ? highlightColor : ""}}
      >
        {/* center close to each other */}
        <div className="flex justify-center items-center space-x-2">
            {icon}          
          {!textHidden && <span className="ml-2">{text}</span>}
        </div>
      </Button>
      </a>
    </>
  );
}
