import Button from "../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function TestWindow({
  shouldShowTestWindow,
  hideTestWindow,
  savedTests,
  isLarge = false,
  position,
}: {
  shouldShowTestWindow: boolean;
  hideTestWindow: () => void;
  savedTests?: string[];
  isLarge?: boolean;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
}) {
  const getMargin = () => {
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
        return `-${pixels / 2}px`;
      default:
        return `-${pixels}px`;
    }
  };

  const getTopMargin = () => {
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

  return (
    <div
      className={`z-50 absolute ${
        isLarge ? "w-[450px]" : "w-[450px]"
      } bg-[#191A23] border border-[#525363] rounded-lg shadow-lg pt-2 ${
        shouldShowTestWindow ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "opacity 0.1s",
        marginLeft: getMargin(),
        marginTop: getTopMargin(),
      }}
      onMouseLeave={hideTestWindow}
    >
      <div className="flex items-center justify-between px-4 py-2 pb-1">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faFlask} className="mr-2" />
            <div className="font-bold" style={{ fontSize: "18px" }}>
              Test
            </div>
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Send requests in test mode
          </div>
        </div>
        <Button text="+ New Request" onClick={hideTestWindow} />
      </div>
      <div className="px-4 pb-3 text-sm">
        {savedTests?.map((test, index) => (
          <div key={index} className="flex items-center justify-between mt-3">
            <Button text={test} onClick={() => {}} />
            <FontAwesomeIcon
              className="mr-2"
              icon={faTrash}
              onClick={() => {
                /* Handle deletion here */
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
