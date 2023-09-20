import { ReactNode, useEffect, useState } from "react";
import SectionAction from "../../LeftSidebar/SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ToastWindow from "../../Utilities/Toast/ToastWindow";
import Button from "../../Utilities/Button";

export default function AutocheckInfo({
  isVisible,
  setIsVisible,
  autocheckResponse,
}: {
  isVisible: boolean;
  setIsVisible: any;
  autocheckResponse: ReactNode;
}) {
  function formatTextToHTML(text) {
    const lines = text.split("\n");
    let formattedHTML = "";

    let isCodeBlock = false;

    lines.forEach((line) => {
      if (line.startsWith("```")) {
        isCodeBlock = !isCodeBlock;
        formattedHTML += isCodeBlock ? "<pre><code>" : "</code></pre>";
      } else if (isCodeBlock) {
        formattedHTML += line + "\n";
      } else {
        formattedHTML += line.replace(/`([^`]+)`/g, "<code>$1</code>");
        formattedHTML += "<br>";
      }
    });

    return formattedHTML;
  }

  return (
    <>
      <ToastWindow
        isHintWindowVisible={isVisible}
        showHintWindowIfOpen={() => setIsVisible(true)}
        hideHintWindow={() => {}}
        title={""}
        titleClass="text-md font-bold"
        isLarge={false}
        content={
          <div className="overflow-scroll max-h-[70vh]">
            <div className="flex mb-2 space-between">
              <div className="font-bold text-lg">Autocheck</div>
              <Button
                text="Close"
                onClick={() => {
                  setIsVisible(false);
                }}
                className="px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border ml-auto"
              />
            </div>

            <div className="mt-3" dangerouslySetInnerHTML={{ __html: formatTextToHTML(autocheckResponse) }}></div>
          </div>
        }
        position={"bottom-left"}
      />
    </>
  );
}
