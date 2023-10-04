import { useContext, useEffect, useState } from "react";
import Dropdown from "../../Utilities/Dropdown";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import toast from "react-hot-toast";
import Checkbox from "../../Utilities/Checkbox";
import useApi from "../../API/TemplatesAPI";

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
  type Input = {
    name: string;
    type: string;
    desc: string;
    secret: boolean;
    secret_name?: string;
  };

  type TemplateType = {
    id: string;
    name: string;
    desc: string;
    inputs: Input[];
    github_url: string | null;
  };

  const [template, setTemplate] = useState<TemplateType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("get");
  const { setPostMessage, setActiveEndpoint } = useContext(SwizzleContext);
  const [templateChecked, setTemplateChecked] = useState(false);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [templateNames, setTemplateNames] = useState([]);
  const [inputState, setInputState] = useState({});

  const api = useApi();
  const methods: any = [
    { id: "get", name: "GET" },
    { id: "post", name: "POST" },
  ];

  useEffect(() => {
    if (template) {
      const initialState = {};

      template.inputs.forEach((input) => {
        if (input.type === "boolean") {
          initialState[input.name] = false; // default value for checkboxes
        } else if (input.type === "string") {
          initialState[input.name] = ""; // default value for text inputs
        }
        // add more conditions if there are other input types
      });

      setInputState(initialState);
    }
  }, [template]);

  useEffect(() => {
    async function fetchTemplates() {
      const response = await api.getTemplates();
      setTemplateOptions(response);
      console.log("fetched templates", response);
    }
    if (isVisible) {
      fetchTemplates();
    }
  }, [isVisible]);

  const handleOnSelectTemplate = (result: { id: any; name: string }) => {
    const foundTemplate = templateOptions.find((template) => template.name === result.name);
    if (foundTemplate) {
      setTemplate(foundTemplate);
    } else {
      console.log("unable to find matching template");
    }
  };

  const createTemplateHandler = () => {
    
  }

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
    
    if (templateChecked) {
      setStep(1);
    } else {
      setIsVisible(false);
    }

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
                  <div className="mt-4">
                    <Checkbox
                      id="template"
                      label="Template"
                      isChecked={templateChecked}
                      setIsChecked={setTemplateChecked}
                    />
                    <div className="mt-3 mb-2 flex">
                      {templateChecked && (
                        <div className="w-full mb-2">
                          <ReactSearchAutocomplete
                            items={templateOptions.map((template) => ({ id: template.id, name: template.name }))}
                            onSelect={handleOnSelectTemplate}
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
                            }}
                            showIcon={false}
                          />
                        </div>
                      )}
                    </div>
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
                  <h3 className="text-lg mb-2 leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    Setup Template
                  </h3>
                  {template &&
                    template.inputs.map((input) => {
                      if (input.type === "boolean") {
                        return (
                          <div className="mt-4">
                          <div className="text-gray-300">{input.desc}</div>
                          <Checkbox
                            id={input.name}
                            label={input.name}
                            isChecked={inputState[input.name]}
                            setIsChecked={(value) =>
                              setInputState((prevState) => ({ ...prevState, [input.name]: value }))
                            }
                          />
                          </div>
                        );
                      } else if (input.type === "string") {
                        return (
                          <div className="mt-4">
                          <div className="text-gray-300">{input.desc}</div>
                          <input
                            className="w-full mt-2 bg-transparent border rounded outline-0 p-2 border-[#525363] focus:border-[#68697a]"
                            placeholder={input.desc}
                            value={inputState[input.name] || ""}
                            onChange={(e) =>
                              setInputState((prevState) => ({ ...prevState, [input.name]: e.target.value }))
                            }
                          />
                          </div>
                        );
                      }
                    })}
                  <div className="bg-[#32333b] py-3 pt-0 mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        createTemplateHandler();
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
