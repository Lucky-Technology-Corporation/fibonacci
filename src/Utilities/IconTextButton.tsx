import Button from "./Button";
import { ReactNode } from "react";

export default function IconTextButton({
  onClick,
  icon,
  text
}: {
  onClick: () => void;
  icon: ReactNode;
  text: string;
}) {
  return (
    <>
      <Button
        className="w-full py-1.5 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
        onClick={onClick}
        text="Test"
      >
        {/* center close to each other */}
        <div className="flex justify-center items-center space-x-2">
          {icon}
          <span className="ml-2">{text}</span>
        </div>
      </Button>
    </>
  );
}
