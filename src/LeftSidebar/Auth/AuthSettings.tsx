import { useState } from "react";
import Dropdown from "../../Utilities/Dropdown";
import TemplateWizard from "../APIs/TemplateWizard";

export default function AuthSettings({ active }: { active: boolean }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const methods: any = [
    { id: "method", name: "+ Auth Method" }
  ];

  //Fetch from backend and populate it here.
  return (
    <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"}`}>
      <Dropdown
        className=""
        onSelect={(item: any) => {
          setIsVisible(true);
        }}
        children={methods}
        direction="left"
        title={"+ New"}        
        selectorClass="w-full py-1.5 !mt-1.5 !mb-1"
      />

      <TemplateWizard
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        type="auth"
      />
    </div>
  );
}
