import { useState } from "react";
import Dropdown from "../../Utilities/Dropdown";
import TemplateWizard from "../APIs/TemplateWizard";

export default function AuthSettings({ active, className = "" }: { active: boolean, className?: string }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const methods: any = [
    { id: "2f0d7d15-bd6d-486e-995d-8dc97b96d32f", name: "Google Login" },
    { id: "0344b6ea-7555-461c-b13f-1766834cdabd", name: "Email/Password Login" },
  ];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  //Fetch from backend and populate it here.
  return (
    <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"} ${className}`}>
      <Dropdown
        className=""
        onSelect={(item: any) => {
          setSelectedTemplateId(item);
          setIsVisible(true);
        }}
        children={methods}
        direction="left"
        title={"+ Add Provider"}        
        selectorClass="w-full py-1.5 !mt-1.5 !mb-1"
      />

      {/* TODO: check for existing auth methods and show them here*/}

      <TemplateWizard
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        type="auth"
        templateId={selectedTemplateId}
      />
    </div>
  );
}
