import { useState } from "react";
import SectionAction from "../SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";

export default function AuthSettings({ active }: { active: boolean }) {
   const [isVisible, setIsVisible] = useState<boolean>(false);

   //Fetch from backend and populate it here.
   return (
      <div
         className={`flex-col w-full px-2 mt-2 text-sm ${
            active ? "" : "hidden"
         }`}
      >
         <SectionAction
            text="Auth Settings"
            onClick={() => {
               setIsVisible(true);
            }}
         />
         <FullPageModal
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            modalDetails={{
               title: "Auth Settings",
               description: <>Auth settings are not ready for use yet.</>,
               placeholder: "Nothing to do here...",
               confirmText: "Okay",
               confirmHandler: () => {},
               shouldShowInput: true,
            }}
         />
      </div>
   );
}
