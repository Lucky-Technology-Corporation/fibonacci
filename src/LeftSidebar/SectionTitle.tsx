import { useState } from "react";
import { Chevron } from '@Components';

export default function SectionTitle({
  icon,
  text,
  active,
  onClick,
}: {
  icon: string;
  text: string;
  active: boolean;
  onClick: () => void;
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
      className={`w-full font-semibold px-2 py-1 mt-4 text-sm flex align-middle cursor-pointer ${
        active ? "text-gray-200" : "text-gray-400 hover:text-gray-300"
      }`}
      onClick={onClick}
      onMouseEnter={teaseChevron}
      onMouseLeave={resetChevron}
    >
      <img src={icon} className={`inline-block w-4 h-4 mr-1.5 m-auto ml-0 ${active ? "opacity-100" : "opacity-80"}`} />
      {text}
      <div className="mt-0.5 ml-auto">
        <Chevron size={14} active={active} tease={isHovering} />
      </div>
    </div>
  );
}
