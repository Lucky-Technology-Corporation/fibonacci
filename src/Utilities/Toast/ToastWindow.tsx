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
   position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";
}) {
   const getMargin = () => {
      var pixels = isLarge ? 608 : 358;
      switch (position) {
         case "top-left":
            return `-${pixels}px`;
         case "top-right":
            return `${0}px`
         case "bottom-left":
            return `-${pixels}px`
         case "bottom-right":
            return `${0}px`
         case "bottom-center":
            return `-${pixels/2}px`
         default:
            return `-${pixels}px`
      }
   };

   const getTopMargin = () => {
      switch (position) {
         case "top-left":
            return "-28px"
         case "top-right":
            return "-28px"
         case "bottom-left":
            return "2px"
         case "bottom-right":
            return "2px"
         case "bottom-center":
            return "2px"
         default:
            return "-28px"
      }
   };

   return (
      <div
         className={`z-50 absolute ${
            isLarge ? "w-[600px]" : "w-[350px]"
         } bg-[#191A23] border border-[#525363] rounded-lg shadow-lg ${
            isHintWindowVisible
               ? "opacity-100"
               : "opacity-0 pointer-events-none"
         }`}
         style={{ 
            transition: "opacity 0.1s",
            marginLeft: getMargin(),
            marginTop: getTopMargin(), 
         }}
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
