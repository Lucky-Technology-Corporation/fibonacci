import { Resizable } from "re-resizable";
import { useContext, useEffect, useState } from "react";
import Draggable from "react-draggable";
import { SwizzleContext } from "../Utilities/GlobalContext";

export default function WebPreview({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}) {
  const { testDomain, setShouldOverlay, activeFile, activePage } = useContext(SwizzleContext);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setShouldOverlay(true);
  };

  const handleResizeStop = (e) => {
    e.stopPropagation();
    setShouldOverlay(false);
  };

  const [url, setUrl] = useState<string>("");
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    if (activePage != undefined && activePage != "") {
      console.log("activePage", activePage);
      setPath(activePage);
      setUrl(testDomain + activePage);
    }
  }, [isVisible, activePage]);

  if (!isVisible) {
    return <></>;
  }
  return (
    <div className="absolute">
      <Draggable
        handle=".handle"
        onStart={handleResizeStart}
        onStop={handleResizeStop}
        defaultPosition={{ x: -150, y: 24 }}
        bounds={{
          top: 0,
        }}
      >
        <Resizable
          defaultSize={{
            width: 320,
            height: 568,
          }}
          minHeight={300}
          minWidth={300}
          onResizeStart={handleResizeStart}
          onResizeStop={handleResizeStop}
          handleStyles={{
            bottomRight: { backgroundColor: "#525363", borderRadius: "4px" },
          }}
          handleClasses={{
            bottomRight: "resizable-handle",
          }}
          style={{ zIndex: 1000 }}
        >
          <div
            className="w-full h-full rounded-sm"
            style={{ border: "1px solid #525363", overflow: "hidden", position: "relative", zIndex: 1000 }}
          >
            <div className="handle py-1" style={{ cursor: "move", backgroundColor: "#525363", userSelect: "none" }}>
              <div className="flex">
                <img src="/drag.svg" className="ml-0.5 h-3 w-3" />
              </div>
            </div>
            <img
              src="/popout.svg"
              className="absolute top-1 left-5 h-3 w-3 opacity-70 cursor-pointer hover:opacity-100 z-50"
              onClick={() => {
                window.open(url, "_blank");
              }}
            />
            {/* <div className='text-gray-200 absolute top-0 left-10 '>{path}</div> */}
            <img
              src="/close.svg"
              className="absolute top-1 right-1 h-3 w-3 opacity-70 cursor-pointer hover:opacity-100 z-50"
              onClick={(e) => {
                setIsVisible(false);
              }}
            />
            <div style={{ width: "100%", height: "calc(100% - 19px)", backgroundColor: "#ffffff" }}>
              <iframe src={url} title="Preview" width="100%" height="100%" frameBorder="0" z-index="1000" />
            </div>
          </div>
        </Resizable>
      </Draggable>
    </div>
  );
}
