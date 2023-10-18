import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import useEndpointApi from "../../API/EndpointAPI";
import useTemplateApi from "../../API/TemplatesAPI";
import Checkbox from "../../Utilities/Checkbox";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import SecretInput from "../../Utilities/SecretInput";

export default function TemplateWizard({
  isVisible,
  setIsVisible,
  setEndpoints,
  setFullEndpoints,
  setHelpers,
  setFullHelpers,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  setEndpoints: React.Dispatch<React.SetStateAction<any[]>>;
  setFullEndpoints: React.Dispatch<React.SetStateAction<any[]>>;
  setHelpers: React.Dispatch<React.SetStateAction<any[]>>;
  setFullHelpers: React.Dispatch<React.SetStateAction<any[]>>;
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
    packages: string;
  };

  const [template, setTemplate] = useState<TemplateType | null>(null);
  const [step, setStep] = useState(0);

  // const [templateOptions, setTemplateOptions] = useState([{ id: "1", name: "Plaid", description: "Add Plaid stuff" }, { id: "2", name: "Stripe", description: "Add Stripe stuff" }]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [inputState, setInputState] = useState({});
  const { testDomain, setShouldRefreshList, shouldRefreshList, setPackageToInstall } = useContext(SwizzleContext);

  const api = useTemplateApi();
  const endpointApi = useEndpointApi();

  useEffect(() => {
    if (template) {
      const initialState = {};

      (template.inputs || []).forEach((input) => {
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
    }
    if (isVisible) {
      fetchTemplates();
    }
  }, [isVisible]);

  const constructPayload = async () => {
    const inputs = [];
    for (const key in inputState) {
      const value = inputState[key];

      let secret_type = "";
      if (key.endsWith("_test")) {
        secret_type = "test";
      } else if (key.endsWith("_prod")) {
        secret_type = "prod";
      }

      const name = secret_type ? key.split("_")[0] : key;

      inputs.push({
        name,
        value,
        secret_type,
      });
    }

    return {
      template_id: template ? template.id : "",
      fermat_url: testDomain.replace("https://", "https://fermat."),
      fermat_jwt: await endpointApi.getFermatJwt(),
      inputs: inputs,
    };
  };

  async function handleOnSecondNext() {
    const payload = await constructPayload();

    //Add necessary npm packages
    const packageList = (template.packages || "").trim().replace(",", " ")
    setPackageToInstall(packageList)

    //Create files
    await api.createFromTemplate(payload);
    setShouldRefreshList(!shouldRefreshList);
    setIsVisible(false);
  }

  const handleOnSelectTemplate = (result: { id: any; name: string }) => {
    const foundTemplate = templateOptions.find((template) => template.id === result.id);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      return true
    } else {
      console.log("unable to find matching template");
      toast.error("Please try to select again")
      return false
    }
  };

  const createTemplateHandler = () => {};

  const createHandler = () => {
    if(!template){
      toast.error("Please select a template")
      return
    }
    setStep(1);
  };

  useEffect(() => {
    if (isVisible) {
      setStep(0);
    }
  }, [isVisible]);

  const formatResult = (item) => {
    return (
      <>
        <div className="flex">
          <div className="my-auto">
            <img src={item.icon_url || "/puzzle.svg"} className="w-6 h-6 rounded-full mr-2" />
          </div>
          <div>
            <span className="font-bold">{item.name}</span>
            <br />
            <span className="">{item.description}</span>
          </div>
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
              {step == 0 ? (
                <>
                  <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    Import a template
                  </h3>
                  <div className="mt-1">
                    <p className="text-sm text-[#D9D9D9]">Quickly import code</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full mb-2">
                      <ReactSearchAutocomplete
                        items={templateOptions.map((template) => ({
                          id: template.id,
                          name: template.name + " ",
                          description: template.description,
                        }))}
                        onSelect={handleOnSelectTemplate}
                        placeholder="Type to search or SPACE to see all..."
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
                          placeholderColor: "#74758a",
                          height: "36px",
                        }}
                        formatResult={formatResult}
                        showIcon={false}
                        onSearch={() => {setTemplate(null)}}
                      />
                    </div>
                  </div>
                  <div className="bg-[#32333b] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                    <div className="bg-[#32333b] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={() => {
                          createHandler();
                        }}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698] sm:ml-3 sm:w-auto sm:text-sm`}
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
                  {template && template.inputs && template.inputs.length > 0 &&
                    (template.inputs || []).map((input) => {
                      if (input.type === "boolean") {
                        return (
                          <div className="mt-4" key={input.desc}>
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
                      } else if (input.type === "string" && !input.secret) {
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
                      } else if (input.secret) {
                        return (
                          <SecretInput
                            name={input.name}
                            desc={input.desc}
                            inputState={inputState}
                            setInputState={setInputState}
                          />
                        );
                      }
                    })}

                  <div className="bg-[#32333b] py-3 pt-0 mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        handleOnSecondNext();
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
