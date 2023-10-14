import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function HelperWizard({
  isVisible,
  setIsVisible,
  setHelpers,
  setFullHelpers,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  setHelpers: React.Dispatch<React.SetStateAction<any[]>>;
  setFullHelpers: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [inputValue, setInputValue] = useState("");
  const { setPostMessage, setActiveHelper } = useContext(SwizzleContext);

  const createHandler = () => {
    if (inputValue == "") {
      toast.error("Please enter a value");
      return;
    }

    var cleanInputValue = inputValue;
    if (inputValue.endsWith(".js")) {
      cleanInputValue = inputValue.slice(0, -3);
    }
    const fileName = cleanInputValue + ".js";
    const newHelperName = cleanInputValue;

    let isDuplicate = false;
    setFullHelpers((helpers: any[]) => {
      if (!helpers.includes(newHelperName)) {
        return [...helpers, newHelperName];
      }
      isDuplicate = true;
      return helpers;
    });

    setHelpers((helpers: any[]) => {
      if (!helpers.includes(newHelperName)) {
        return [...helpers, newHelperName];
      }
      isDuplicate = true;
      return helpers;
    });

    if (isDuplicate) {
      toast.error("That helper already exists");
      return;
    }
    setPostMessage({
      type: "newFile",
      fileName: "/backend/user-helpers/" + fileName,
      helperName: newHelperName,
    });
    setIsVisible(false);
    setTimeout(() => {
      setActiveHelper(newHelperName);
    }, 500);
  };

  useEffect(() => {
    if (isVisible) {
      setInputValue("");
    }
  }, [isVisible]);

  return (
    <div
      className={`fixed z-50 inset-0 overflow-y-auto ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ transition: "opacity 0.2s" }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#32333b] w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="bg-[#32333b] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <>
                <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                  New Helper
                </h3>
                <div className="mt-1">
                  <p className="text-sm text-[#D9D9D9]">Name your function</p>
                </div>
                <div className="mt-3 mb-2 flex">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                      setInputValue(sanitizedValue.trim());
                    }}
                    className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                    placeholder={"myHelperFunction"}
                    onKeyDown={(event: any) => {
                      if (event.key == "Enter") {
                        createHandler();
                      }
                    }}
                  />
                </div>
                <div className="bg-[#32333b] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                  <div className="bg-[#32333b] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        createHandler();
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVisible(false);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
