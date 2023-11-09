import { useContext, useEffect, useState } from "react";
import { SwizzleContext } from "../GlobalContext";

export default function ToastWindow({
  isHintWindowVisible,
  showHintWindowIfOpen,
  hideHintWindow,
  title,
  titleClass,
  content,
  isLarge = false,
  isExpandable = false,
  position,
  overrideLeftMargin,
  overrideTopMargin,
}: {
  isHintWindowVisible: boolean;
  showHintWindowIfOpen: () => void;
  hideHintWindow: () => void;
  title?: string;
  titleClass?: string;
  content: React.ReactNode;
  isLarge?: boolean;
  isExpandable?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";
  overrideLeftMargin?: number;
  overrideTopMargin?: number;
}) {
  const { mousePosition } = useContext(SwizzleContext);

  const getMargin = () => {
    if (overrideLeftMargin) {
      return overrideLeftMargin;
    }
    var pixels = isLarge ? 608 : 358;
    switch (position) {
      case "top-left":
        return `-${pixels}px`;
      case "top-right":
        return `${0}px`;
      case "bottom-left":
        return `-${pixels}px`;
      case "bottom-right":
        return `${0}px`;
      case "bottom-center":
        return `-${pixels}px`;
      default:
        return `-${pixels}px`;
    }
  };

  const getTopMargin = () => {
    if (overrideTopMargin) {
      return overrideTopMargin;
    }
    switch (position) {
      case "top-left":
        return "-28px";
      case "top-right":
        return "-28px";
      case "bottom-left":
        return "2px";
      case "bottom-right":
        return "2px";
      case "bottom-center":
        return "2px";
      default:
        return "-28px";
    }
  };

  const titleClassSet = titleClass ? titleClass : "text-sm font-bold font-mono";


  const [leftPosition, setLeftPosition] = useState(0);
  useEffect(() => {
    const startingPosition = mousePosition.x - 220
    if(startingPosition + 400 > window.innerWidth) {
      setLeftPosition(startingPosition - 400)
    }else{
      setLeftPosition(startingPosition)
    }
    // if(leftPosition + 400 > window.innerWidth) {
    //   setLeftPosition(leftPosition - (window.innerWidth - (leftPosition + 400)))
    // }
    // if(leftPosition < 0) {
    //   setLeftPosition(0)
    // }
  }, [mousePosition])

  return (
    <div
      className={`z-50 absolute ${
        isExpandable ? "w-fit w-[400px] min-w-[400px]" : isLarge ? "w-[600px]" : "w-[350px]"
      } bg-[#191A23] border border-[#525363] rounded-lg shadow-lg fixed ${
        isHintWindowVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        top: isExpandable && (mousePosition.y + 16) + "px",
        left: isExpandable && leftPosition + "px",
        marginLeft: getMargin(),
        marginTop: getTopMargin(),
      }}
      onMouseEnter={showHintWindowIfOpen}
      onMouseLeave={hideHintWindow}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className={titleClassSet}>{title}</div>
      </div>
      <div className="px-4 pb-2 text-sm">{content}</div>
    </div>
  );
}
