import { ReactNode, useContext, useEffect, useState } from "react";
import Dropdown from "../../Utilities/Dropdown";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import toast from "react-hot-toast";

export default function APIWizard({
  isVisible,
  setIsVisible,
  setFiles,
  setFullFiles,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  setFiles: React.Dispatch<React.SetStateAction<any[]>>;
  setFullFiles: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("GET");
  const { setPostMessage } = useContext(SwizzleContext);

  const templateOptions = [{ id: "blank", name: "Blank" }];

  const chooseType = (type: string) => {
    setStep(1);
  };

  const createHandler = () => {
    var cleanInputValue = inputValue;
    if (inputValue == "") {
      toast.error("Please enter a value");
      return;
    }
    if (inputValue.includes("/")) {
      toast.error(
        "Subdirectories are not supported yet. Please enter a name without a slash",
      );
      return;
    }

    let isDuplicate = false;
    setFullFiles((files: any[]) => {
      if (!files.includes(inputValue)) {
        return [...files, inputValue];
      }
      isDuplicate = true;
      return files;
    });

    setFiles((files: any[]) => {
      if (!files.includes(inputValue)) {
        return [...files, inputValue];
      }
      isDuplicate = true;
      return files;
    });

    if (isDuplicate) {
      toast.error("That file already exists");
      return;
    }
    setPostMessage({ type: "newFile", fileName: "user-hosting/" + inputValue });
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      setStep(0);
      setInputValue("");
    }
  }, [isVisible]);

  return (
    <div
      className={`fixed z-50 inset-0 overflow-y-auto ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ transition: "opacity 0.2s" }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#32333b] w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="bg-[#32333b] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              {step == 0 ? (
                <>
                  <h3
                    className="text-lg leading-6 font-medium text-[#D9D9D9]"
                    id="modal-title"
                  >
                    New File
                  </h3>
                  <div className="mt-1">
                    <p className="text-sm text-[#D9D9D9]">Name your file</p>
                  </div>
                  <div className="mt-3 mb-2 flex">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value.trim())}
                      className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                      placeholder={"file.html"}
                      onKeyDown={(event: any) => {
                        if (event.key == "Enter") {
                          createHandler();
                        }
                      }}
                    />
                  </div>
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
                        setTimeout(function () {
                          setStep(0);
                        }, 200);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3
                    className="text-lg leading-6 font-medium text-[#D9D9D9]"
                    id="modal-title"
                  >
                    Choose template
                  </h3>
                  <div className="mt-1">
                    <p className="text-sm text-[#D9D9D9]">
                      What are you building?
                    </p>
                  </div>
                  <div className="mt-3 mb-2 flex">
                    <div className="w-full mb-2">
                      <ReactSearchAutocomplete
                        items={templateOptions}
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
                  <div className="bg-[#32333b] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        createHandler();
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVisible(false);
                        setTimeout(function () {
                          setStep(0);
                        }, 200);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}