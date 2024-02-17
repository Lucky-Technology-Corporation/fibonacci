import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Chevron from "../Utilities/Chevron";

export default function SectionTitle({
  icon,
  text,
  active,
  onClick,
  className = "",
  chevronNotExandable = false,
}: {
  icon: string;
  text: string;
  active: boolean;
  onClick: () => void;
  className?: string;
  chevronNotExandable?: boolean;
}) {
  const [isHovering, setIsHovering] = useState(false);

  const teaseChevron = () => {
    if (!active) {
      setIsHovering(true);
    }
  };
  const resetChevron = () => {
    setIsHovering(false);
  };

  return (
    <div
      className={`${className} w-full font-semibold px-2 py-1 mt-4 text-sm flex align-middle cursor-pointer ${
        active ? "text-gray-200" : "text-gray-400 hover:text-gray-300"
      }`}
      onClick={onClick}
      onMouseEnter={teaseChevron}
      onMouseLeave={resetChevron}
    >
      <img src={icon} className={`inline-block w-4 h-4 mr-1.5 m-auto ml-0 ${active ? "opacity-100" : "opacity-80"}`} />
      {text}
      <div className="mt-0.5 ml-auto">
        {chevronNotExandable ? (
          <FontAwesomeIcon icon={faChevronRight} className="text-xs text-[#62666c] mr-1" />
        ) : (
          <Chevron size={14} active={active} tease={isHovering} />
        )}
      </div>
    </div>
  );
}
