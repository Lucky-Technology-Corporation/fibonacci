import { useContext, useEffect, useState } from "react";
import useSettingsApi from "../../API/SettingsAPI";
import Checkbox from "../../Utilities/Checkbox";
import Dropdown from "../../Utilities/Dropdown";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import AuthWizard from "../APIs/AuthWizard";

export default function AuthSettings({ active, className = "" }: { active: boolean; className?: string }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const methods: any = [
    { id: "google", name: "Google Login" },
    { id: "facebook", name: "Facebook Login" },
    { id: "email", name: "Email/Password Login" },
  ];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [authMethods, setAuthMethods] = useState<any[]>([]);
  const [allowingNewSignups, setAllowingNewSignups] = useState<boolean>(null);
  const { testDomain, activeAuthPage, setActiveAuthPage, shouldRefreshAuth, setShouldRefreshAuth } =
    useContext(SwizzleContext);

  const { getSecrets, saveSecrets } = useSettingsApi();

  useEffect(() => {
    getSecrets("backend").then((secrets) => {
      if (secrets == null) return;
      setAuthMethods([{ id: "email", name: "Email/Password Login" }]);
      setAllowingNewSignups(true);

      Object.keys(secrets.test).forEach((secretKey: string) => {
        if (secretKey == "GOOGLE_APP_ID") {
          setAuthMethods((methods) => [...methods, { id: "google", name: "Google Login" }]);
        } else if (secretKey == "FACEBOOK_APP_ID") {
          setAuthMethods((methods) => [...methods, { id: "facebook", name: "Facebook Login" }]);
        } else if (secretKey == "SWIZZLE_EMAIL_PASSWORD") {
          if(secrets.test[secretKey] == "false"){
            setAuthMethods((methods) => methods.filter((method) => method.id != "email"));
          }
          // setAuthMethods((methods) => [...methods, { id: "email", name: "Email/Password Login" }]);
        } else if (secretKey == "ALLOW_NEW_SIGNUPS") {
          if (secrets.test[secretKey] == "false") {
            setAllowingNewSignups(false);
          }
        }
      });
    });
  }, [active, shouldRefreshAuth, testDomain]);

  const selectedAuthMethod = (methodId: string) => {
    setActiveAuthPage(methodId);
  };

  const changeAllowNewSignups = (value: boolean) => {
    setAllowingNewSignups(value);
    let secrets = {
      test: {
        ALLOW_NEW_SIGNUPS: value.toString(),
      },
      prod: {
        ALLOW_NEW_SIGNUPS: value.toString(),
      },
    };
    saveSecrets("backend", secrets);
  };

  //Fetch from backend and populate it here.
  return (
    <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"} ${className}`}>
      <div
        className={`text-sm flex-1 p-1.5 py-1.5 mt-1.5 my-1 cursor-pointer rounded`}
        onClick={() => {
          selectedAuthMethod("list");
        }}
      >
        <Checkbox
          id={"allow_new_signups"}
          label={allowingNewSignups ? "Allowing new signups" : "Blocking new signups"}
          isChecked={allowingNewSignups}
          setIsChecked={setAllowingNewSignups}
          onChange={(e) => {
            changeAllowNewSignups(e.target.checked);
          }}
          uncheckedClass="text-red-400"
        />
      </div>
      <div
        className={`text-sm flex-1 p-1.5 py-1.5 mt-1.5 my-1 ${
          activeAuthPage == "list" ? "bg-[#85869822]" : ""
        } hover:bg-[#85869833] cursor-pointer rounded`}
        onClick={() => {
          selectedAuthMethod("list");
        }}
      >
        All Users
      </div>

      <Dropdown
        className=""
        onSelect={(item: any) => {
          setSelectedTemplateId(item);
          setIsVisible(true);
        }}
        children={methods}
        direction="left"
        title={"+ Add Provider"}
        selectorClass="w-full py-1.5 !mt-1 !mb-1"
      />

      {authMethods.map((method) => {
        return (
          <div
            className={`text-sm flex-1 p-1.5 py-1.5 my-1 ${
              activeAuthPage == method.id ? "bg-[#85869822]" : ""
            } hover:bg-[#85869833] cursor-pointer rounded`}
            onClick={() => selectedAuthMethod(method.id)}
          >
            {method.name}
          </div>
        );
      })}
      <AuthWizard
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        authId={selectedTemplateId}
        authName={methods.find((method: any) => method.id === selectedTemplateId)?.name}
        setShouldRefresh={setShouldRefreshAuth}
      />
    </div>
  );
}
