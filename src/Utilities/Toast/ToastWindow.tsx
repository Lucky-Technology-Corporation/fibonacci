export default function ToastWindow({
   isHintWindowVisible,
   showHintWindowIfOpen,
   hideHintWindow,
   title,
   content,
   isLarge = false,
   position,
}: {
   isHintWindowVisible: boolean;
   showHintWindowIfOpen: () => void;
   hideHintWindow: () => void;
   title: string;
   content: React.ReactNode;
   isLarge?: boolean;
   position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
   const getMargin = () => {
      var pixels = isLarge ? 608 : 358;
      switch (position) {
         case "top-left":
            return "ml-[-" + pixels + "px]";
         case "top-right":
            return "ml-[" + pixels + "px]";
         case "bottom-left":
            return "ml-[-" + pixels + "px]";
         case "bottom-right":
            return "ml-[" + pixels + "px]";
         default:
            return "ml-[-" + pixels + "px]";
      }
   };

   const getTopMargin = () => {
      switch (position) {
         case "top-left":
            return "mt-[-28px]";
         case "top-right":
            return "mt-[-28px]";
         case "bottom-left":
            return "mt-[2px]";
         case "bottom-right":
            return "mt-[2px]";
         default:
            return "mt-[-28px]";
      }
   };

   return (
      <div
         className={`z-50 absolute ${getTopMargin()} ${
            isLarge ? "w-[600px] " + getMargin() : "w-[350px] " + getMargin()
         } bg-[#191A23] border border-[#525363] rounded-lg shadow-lg ${
            isHintWindowVisible
               ? "opacity-100"
               : "opacity-0 pointer-events-none"
         }`}
         style={{ transition: "opacity 0.1s" }}
         onMouseEnter={showHintWindowIfOpen}
         onMouseLeave={hideHintWindow}
      >
         <div className="flex items-center justify-between px-4 py-2 pb-1">
            <div className="text-sm font-bold font-mono">{title}</div>
         </div>
         <div className="px-4 pb-2 text-sm">{content}</div>
      </div>
   );
}
