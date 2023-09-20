import { ReactNode, useContext, useEffect, useState } from "react";
import Dropdown from "../../Utilities/Dropdown";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import toast from "react-hot-toast";
import PrivacyPolicy from "../../Utilities/PrivacyPolicy";
import TermsOfService from "../../Utilities/TermsOfService";

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

  const { setPostMessage } = useContext(SwizzleContext);

  const templateOptions: { id: string; name: string }[] = [
    {
      id: "blank",
      name: "Blank File",
    },
    {
      id: "privacy",
      name: "Privacy Policy",
    },
    {
      id: "terms",
      name: "Terms of Service",
    },
    // {
    //   id: "download",
    //   name: "App Download",
    // }
  ];

  const [template, setTemplate] = useState<string>("blank");
  const [overrideRender, setOverrideRender] = useState<ReactNode | null>(null);

  const [appName, setAppName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const createHandler = () => {
    if (inputValue == "") {
      toast.error("Please enter a filename");
      return;
    }
    if (inputValue.includes("/")) {
      toast.error("Subdirectories are not supported yet. Please enter a filename without a slash");
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

    if (template == "privacy") {
      setOverrideRender(getPrivacyInputs());
    } else if (template == "terms") {
      setOverrideRender(getTermsInputs());
    }
    if (template == "blank") {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      setInputValue("");
      setTemplate("blank");
    }
  }, [isVisible]);

  const createPrivacyPolicy = () => {
    const message = {
      content: PrivacyPolicy({ app_name: "", company_name: "", company_address: "", contact_email: "" }),
      type: "replaceText",
    };
    setPostMessage(message);
    setIsVisible(false);
  };

  const getPrivacyInputs = () => {
    return (
      <>
        <div className="mt-3 mb-2 flex">
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
            placeholder={`App name`}
          />
        </div>
        <div className="mt-3 mb-2 flex">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
            placeholder={`Company name`}
          />
        </div>
        <div className="mt-3 mb-2 flex">
          <input
            type="text"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
            placeholder={`Company address`}
          />
        </div>
        <div className="mt-3 mb-2 flex">
          <input
            type="text"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
            placeholder={`Contact email`}
          />
        </div>
        <div className="bg-[#32333b] py-3 pt-0 mt-3 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => {
              createPrivacyPolicy();
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
      </>
    );
  };

  const createTerms = () => {
    const message = {
      content: TermsOfService({ app_name: "", company_name: "", company_address: "", contact_email: "" }),
      type: "replaceText",
    };
    setPostMessage(message);
    setIsVisible(false);
  };

  const getTermsInputs = () => {
    return (
      <>
        <div className="mt-3 mb-2 flex">
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
            placeholder={`App name`}
          />
        </div>
        <div className="mt-3 mb-2 flex">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
            placeholder={`Company name`}
          />
        </div>
        <div className="mt-3 mb-2 flex">
          <input
            type="text"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
            placeholder={`Company address`}
          />
        </div>
        <div className="mt-3 mb-2 flex">
          <input
            type="text"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
            placeholder={`Contact email`}
          />
        </div>
        <div className="bg-[#32333b] py-3 pt-0 mt-3 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => {
              createTerms();
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
      </>
    );
  };

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
                <div className="flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    New File
                  </h3>
                </div>
                {overrideRender ? (
                  overrideRender
                ) : (
                  <>
                    <div className="mt-3 mb-2 flex">
                      <Dropdown
                        className="mr-2 whitespace-nowrap"
                        onSelect={(item: any) => {
                          setTemplate(item);
                          setInputValue(item + ".html");
                        }}
                        children={templateOptions}
                        direction="left"
                        title={templateOptions.filter((item) => item.id == template)[0].name}
                      />
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value.trim())}
                        className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                        placeholder={`${template}.html`}
                        onKeyDown={(event: any) => {
                          if (event.key == "Enter") {
                            createHandler();
                          }
                        }}
                      />
                    </div>
                    <div className="bg-[#32333b] py-3 pt-0 mt-3 sm:flex sm:flex-row-reverse">
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
                          setOverrideRender(null);
                          setIsVisible(false);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
