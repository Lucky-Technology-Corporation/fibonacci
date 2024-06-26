import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useDeploymentApi from "../../API/DeploymentAPI";
import useEndpointApi from "../../API/EndpointAPI";
import useTemplateApi from "../../API/TemplatesAPI";
import Checkbox from "../../Utilities/Checkbox";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import SecretInput from "../../Utilities/SecretInput";

export default function TemplateWizard({
  isVisible,
  setIsVisible,
  type,
  templateId,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  type?: string;
  templateId?: string;
}) {
  type Input = {
    name: string;
    type: string;
    desc: string;
    secret: boolean;
    secret_name?: string;
    default?: string;
  };

  type TemplateType = {
    id: string;
    name: string;
    desc: string;
    inputs: Input[];
    github_url: string | null;
    packages?: string;
    frontend_packages?: string;
  };

  const [template, setTemplate] = useState<TemplateType | null>(null);
  const [step, setStep] = useState(0);

  const [templateOptions, setTemplateOptions] = useState([]);
  const [inputState, setInputState] = useState({});
  const [filterValue, setFilterValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { testDomain, setShouldRefreshList, shouldRefreshList, setPostMessage } = useContext(SwizzleContext);

  const api = useTemplateApi();
  const endpointApi = useEndpointApi();
  const deploymentApi = useDeploymentApi();

  useEffect(() => {
    if (template) {
      const initialState = {};

      (template.inputs || []).forEach((input) => {
        if (!input.secret) {
          if (input.type === "boolean") {
            initialState[input.name] = false; // default value for checkboxes
          } else if (input.type === "string") {
            if (input.default) {
              initialState[input.name] = input.default;
            } else {
              initialState[input.name] = ""; // default value for text inputs
            }
          }
          // add more conditions if there are other input types
        } else {
          initialState[input.secret_name + "_test"] = "";
          initialState[input.secret_name + "_prod"] = "";
        }
      });

      setInputState(initialState);
    }
  }, [template]);

  useEffect(() => {
    async function fetchTemplates() {
      var response = await api.getTemplates();
      if (type) {
        response = response.filter((template) => template.type == type);
      }
      setTemplateOptions(response);
      const template = response.find((template) => template.id == templateId) || response[0];
      setTemplate(template);
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

      const name = secret_type != "" ? key.split("_").slice(0, -1).join("_") : key;

      inputs.push({
        name,
        value,
        secret_type,
      });
    }

    return {
      template_id: template ? template.id : "",
      inputs: inputs,
    };
  };

  const isAllInputsFilled = () => {
    for (const key in inputState) {
      const value = inputState[key];
      if (value === "" || value === null || value === undefined) {
        return false;
      }
    }
    return true;
  };

  async function createTemplateWithInputs() {
    const payload = await constructPayload();

    //Add necessary npm packages
    await deploymentApi.updatePackage((template.packages || "").trim().split(","), "install", "backend");
    await deploymentApi.updatePackage((template.frontend_packages || "").trim().split(","), "install", "frontend");

    //Create files
    await api.createFromTemplate(payload);
    setShouldRefreshList(!shouldRefreshList);
    setIsVisible(false);
  }

  if (!template) {
    return <></>;
  }

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
                Add {template.name}
              </h3>
              {template &&
                template.inputs &&
                template.inputs.length > 0 &&
                (template.inputs || []).map((input) => {
                  if (input.type === "boolean") {
                    return (
                      <div className="mt-4" key={input.name}>
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
                      <div className="mt-4" key={input.name}>
                        <div className="text-gray-300">{input.name}</div>
                        <div className="text-gray-400" dangerouslySetInnerHTML={{ __html: input.desc }}></div>
                        <input
                          className="w-full mt-2 bg-transparent border rounded outline-0 p-2 border-[#525363] focus:border-[#68697a]"
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
                        secretName={input.secret_name}
                        desc={input.desc}
                        inputState={inputState}
                        setInputState={setInputState}
                        key={input.secret_name}
                      />
                    );
                  }
                })}

              <div className="bg-[#181922] py-3 pt-0 mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAllInputsFilled()) {
                      toast.error("Please fill in all the inputs.");
                      return;
                    }
                    setIsCreating(true);
                    toast.promise(createTemplateWithInputs(), {
                      loading: "Creating... (this might take a few seconds)",
                      success: () => {
                        setStep(0);
                        setIsCreating(false);
                        setInputState({});
                        setFilterValue("");
                        return "Created template!";
                      },
                      error: "Didn't create template",
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
                    setTimeout(function () {
                      setStep(0);
                    }, 200);
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
