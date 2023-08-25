import { useState } from "react";
import SectionAction from "../../LeftSidebar/SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

export default function PackageInfo({ show }: { show: boolean }) {
   const [isVisible, setIsVisible] = useState(false);
   const [items, setItems] = useState([]);

   return (
      <>
         <div
            className={`flex-col items-center justify-between ${
               show ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
            }`}
            style={{ transition: "opacity 0.3s" }}
         >
            <div className="h-1"></div>
            <SectionAction
               text="+ Add Package"
               onClick={() => {
                  setIsVisible(true);
               }}
            />
            <FullPageModal
               isVisible={isVisible}
               setIsVisible={setIsVisible}
               modalDetails={{
                  title: "📦 Add Package",
                  description: (
                     <div className="flex flex-col items-center justify-center mt-2">
                        <div className="w-full">
                           <div className="text-gray-300 mb-2">Search NPM</div>
                              <ReactSearchAutocomplete
                                 items={items}
                                 // onSelect={handleOnSelect}
                                 autoFocus
                                 placeholder="Blank endpoint"
                                 styling={{
                                    border: "1px solid #525363",
                                    lineColor: "#525363",
                                    borderRadius: "0.375rem",
                                    boxShadow: "none",
                                    backgroundColor: "#32333b",
                                    hoverBackgroundColor: "#525363",
                                    color: "#D9D9D9",
                                    fontSize: "0.875rem",
                                    iconColor: "#D9D9D9",
                                    placeholderColor: "#D9D9D9",
                                    zIndex: 1000,
                                 }}
                                 showIcon={false}
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
         </div>
      </>
   );
}
