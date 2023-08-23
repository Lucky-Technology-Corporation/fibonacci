import { ReactNode } from "react";

export default function IconButton({
   icon,
   onClick,
}: {
   icon: ReactNode;
   onClick: () => void;
}) {
   return (
      <div
         onClick={onClick}
         className="px-3 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
      >
         {icon}
      </div>
   );
}
