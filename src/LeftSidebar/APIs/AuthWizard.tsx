import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSettingsApi from "../../API/SettingsAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function AuthWizard({
  isVisible,
  setIsVisible,
  authId,
  authName,
  setShouldRefresh,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  authId: string;
  authName: string;
  setShouldRefresh: any;
}) {
  const [inputState, setInputState] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const { saveSecrets, getSecrets } = useSettingsApi();
  const { setActiveAuthPage } = useContext(SwizzleContext);

  useEffect(() => {
    if (authId == "email") {
      setInputState({
        SWIZZLE_EMAIL_PASSWORD: "true",
      });
    } else if (authId == "google") {
      setInputState({
        GOOGLE_APP_ID: "",
      });
    } else if (authId == "facebook") {
      setInputState({
        FACEBOOK_APP_ID: "",
      });
    }
  }, [isVisible]);

  async function addAuthMethod() {
    if (authId == "google" || authId == "facebook") {
      var authIdKey = authId == "google" ? "GOOGLE_APP_ID" : "FACEBOOK_APP_ID";
      const existingSecrets = await getSecrets("backend");
      if (existingSecrets) {
        if (existingSecrets.test[authIdKey] || existingSecrets.prod[authIdKey]) {
          setActiveAuthPage(authId);
          throw "This auth method already exists";
        }
      }
    }
    //add secrets
    const secrets = {
      test: inputState,
      prod: inputState,
    };
    await saveSecrets("backend", secrets);
    setShouldRefresh((r) => !r);
    setActiveAuthPage(authId);
  }

  // const renderInputsFor = (authId: string) => {
  //   console.log("render for", authId)
  //   if(authId === "google") {
  //     return (
  //       <div className="mt-4" key={"GOOGLE_APP_ID"}>
  //         <div className="text-gray-300">Google Client ID</div>
  //         <div className="text-gray-400">Get this from the <a href='https://console.cloud.google.com/apis/credentials' target='_blank'>Google Cloud Console</a></div>
  //         <input
  //           className="w-full mt-2 bg-transparent border rounded outline-0 p-2 border-[#525363] focus:border-[#68697a]"
  //           placeholder={""}
  //           value={inputState["GOOGLE_APP_ID"] || ""}
  //           onChange={(e) =>
  //             setInputState((prevState) => ({ ...prevState, ["GOOGLE_APP_ID"]: e.target.value }))
  //           }
  //         />
  //       </div>
  //     )
  //   } else if(authId == "facebook"){
  //     return(
  //       <div className="mt-4" key={"FACEBOOK_APP_ID"}>
  //         <div className="text-gray-300">Facebook App ID</div>
  //         <div className="text-gray-400">Get this from the Facebook developer portal</div>
  //         <input
  //           className="w-full mt-2 bg-transparent border rounded outline-0 p-2 border-[#525363] focus:border-[#68697a]"
  //           placeholder={""}
  //           value={inputState["FACEBOOK_APP_ID"] || ""}
  //           onChange={(e) =>
  //             setInputState((prevState) => ({ ...prevState, ["FACEBOOK_APP_ID"]: e.target.value }))
  //           }
  //         />
  //       </div>
  //     )
  //   }
  // }

  return (
    <div
      className={`fixed z-50 inset-0 overflow-y-auto ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ transition: "opacity 0.2s" }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#181922] w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="border-[#525363] border bg-[#181922] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg mb-2 leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                Add {authName}
              </h3>
              {/* {renderInputsFor(authId)} */}

              <div className="bg-[#181922] py-3 pt-0 mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(true);
                    toast.promise(addAuthMethod(), {
                      loading: "Adding...",
                      success: () => {
                        setIsCreating(false);
                        setInputState({});
                        setIsVisible(false);
                        return "Added";
                      },
                      error: (e) => {
                        setIsCreating(false);
                        setInputState({});
                        setIsVisible(false);
                        return e;
                      },
                    });
                  }}
                  disabled={isCreating}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVisible(false);
                    setInputState({});
                  }}
                  disabled={isCreating}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
