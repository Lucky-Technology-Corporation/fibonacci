import { ReactNode, useContext, useEffect, useState } from "react";
import Dropdown from "../../Utilities/Dropdown";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import toast from "react-hot-toast";

export default function APIWizard({
  isVisible,
  setIsVisible,
  setEndpoints,
  setFullEndpoints,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  setEndpoints: React.Dispatch<React.SetStateAction<any[]>>;
  setFullEndpoints: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("get");
  const { setPostMessage, setActiveEndpoint } = useContext(SwizzleContext);

  const methods: any = [
    { id: "get", name: "GET" },
    { id: "post", name: "POST" },
  ]; //{id: "put", name: "PUT"}, {id: "delete", name: "DELETE"}, {id: "patch", name: "PATCH"}

  const templateOptions = [
    { id: "blank", name: "Blank" },
    { id: "plaid_get", name: "Plaid - Get Link Token" },
    { id: "plaid_exchange", name: "Plaid - Exchange Public Token" },
    { id: "stripe_webhook", name: "Stripe - Webhook" },
    {
      id: "stripe_create_customer",
      name: "Stripe - Create Customer",
    },
    {
      id: "stripe_create_payment_intent",
      name: "Stripe - Create Payment Intent",
    },
    {
      id: "stripe_create_subscription",
      name: "Stripe - Create Subscription",
    },
  ];

  const chooseType = (type: string) => {
    setStep(1);
  };

  const createHandler = () => {
    var cleanInputValue = inputValue;
    if (inputValue == "") {
      toast.error("Please enter a value");
      return;
    }
    if (inputValue.startsWith("/")) {
      cleanInputValue = inputValue.substring(1).replace(/\//g, "-").replace(/:/g, "_");
    }
    const fileName = selectedMethod.toLowerCase() + "-" + cleanInputValue + ".js";
    
    const methodAndPath = fileName.replace(/-/g, "/").replace(/_/g, ":").replace(".js", "");
    const [method, ...pathComponents] = methodAndPath.split('/');
    const path = pathComponents.join('/');

    let newEndpointName;
    if (path === "") {
      newEndpointName = `${method}/`;
    } else {
      newEndpointName = `${method}/${path.replace(/\/+$/, "")}`;
    }

    let isDuplicate = false;
    setFullEndpoints((endpoints: any[]) => {
      if (!endpoints.includes(newEndpointName)) {
        return [...endpoints, newEndpointName];
      }
      isDuplicate = true;
      return endpoints;
    });

    setEndpoints((endpoints: any[]) => {
      if (!endpoints.includes(newEndpointName)) {
        return [...endpoints, newEndpointName];
      }
      isDuplicate = true;
      return endpoints;
    });

    if (isDuplicate) {
      toast.error("That endpoint already exists");
      return;
    }
    setPostMessage({
      type: "newFile",
      fileName: "user-dependencies/" + fileName,
      endpointName: newEndpointName,
    });
    setIsVisible(false);
    setTimeout(() => {
      setActiveEndpoint(newEndpointName);
    }, 500);
  };

  useEffect(() => {
    if (isVisible) {
      setStep(0);
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
              {step == 0 ? (
                <>
                  <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    Standard API
                  </h3>
                  <div className="mt-1">
                    <p className="text-sm text-[#D9D9D9]">Name your endpoint</p>
                  </div>
                  <div className="mt-3 mb-2 flex">
                    <Dropdown
                      className="mr-2"
                      onSelect={(item: any) => {
                        setSelectedMethod(item);
                      }}
                      children={methods}
                      direction="left"
                      title={selectedMethod.toUpperCase()}
                    />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value.trim())} //TODO: disallow "-" and "_"
                      className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                      placeholder={"/path/:variable"}
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
                          setTimeout(function () {
                            setStep(0);
                          }, 200);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    Choose template
                  </h3>
                  <div className="mt-1">
                    <p className="text-sm text-[#D9D9D9]">What are you building?</p>
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
