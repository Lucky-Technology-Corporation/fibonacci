import { useEffect, useState } from "react";
import SectionAction from "../../LeftSidebar/SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";

export default function SecretInfo({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: any;
}) {
  return (
    <FullPageModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      modalDetails={{
        title: "🔒 New Secret",
        description: (
          <div className="flex flex-col items-center justify-center mt-2">
            <div className="w-full">
              <div className="text-gray-300 mb-2">Secret name</div>
              <input
                className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                placeholder=""
              />
            </div>
            <div className="w-full">
              <div className="text-gray-300 mb-2 mt-4">
                Test environment value
              </div>
              <textarea
                className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                placeholder=""
              />
            </div>
            <div className="w-full">
              <div className="text-gray-300 mb-2 mt-4">
                Production environment value
              </div>
              <textarea
                className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                placeholder=""
              />
            </div>
          </div>
        ),
        confirmText: "Create",
        confirmHandler: () => {},
        shouldShowInput: false,
        placeholder: "", //unused since shouldShowInput is false
      }}
    />
  );
}
