import { useContext, useEffect, useRef, useState } from "react";
import { copyText } from "../Utilities/Copyable";
import ToastWindow from "./ToastWindow";
import { SwizzleContext } from "../Utilities/GlobalContext";

type ToastProps = {
   title: string;
   content: React.ReactNode;
   position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
   isLarge?: boolean;
};

export default function InfoItem({
   content,
   toast,
   position,
}: {
   content: React.ReactNode;
   toast: ToastProps;
   position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
   isLarge?: boolean;   
}) {
   
   const [id, setId] = useState(Math.random().toString(36).substring(7));
   const timerRef = useRef<number | undefined>();
   const { activeToast, setActiveToast } = useContext(SwizzleContext);

   const [isHintWindowVisible, setIsHintWindowVisible] = useState(false);
   const showHintWindow = () => {
      clearTimeout(timerRef.current);
      console.log("showing");
      setActiveToast(id);
      setIsHintWindowVisible(true);
   };
   const showHintWindowIfOpen = () => {
      if (!isHintWindowVisible) return;
      clearTimeout(timerRef.current);
      setIsHintWindowVisible(true);
   };

   const hideHintWindow = () => {
      timerRef.current = window.setTimeout(() => {
         setIsHintWindowVisible(false);
      }, 300);
   };

   useEffect(() => {
      return () => {
         if (timerRef.current) {
            clearTimeout(timerRef.current);
         }
      };
   }, []);

   useEffect(() => {
      console.log(activeToast);
      if (activeToast !== id) {
         console.log("hiding");
         setIsHintWindowVisible(false);
      }
   }, [activeToast]);

   return (
      <>
         <div
            className="py-1 flex items-center mt-1 cursor-pointer"
            onMouseEnter={showHintWindow}
            onMouseLeave={hideHintWindow}
         >
            {content}
         </div>
         <ToastWindow
            isHintWindowVisible={isHintWindowVisible}
            showHintWindowIfOpen={showHintWindowIfOpen}
            hideHintWindow={hideHintWindow}
            title={toast.title}
            isLarge={toast.isLarge}
            content={toast.content}
            position={position}
         />
      </>
   );
}
