import { useContext, useEffect, useState } from "react";
import SectionAction from "../../LeftSidebar/SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ToastWindow from "../../Utilities/Toast/ToastWindow";
import Button from "../../Utilities/Button";
import useApi from "../../API/SettingsAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import toast from "react-hot-toast";

export default function SecretInfo({ isVisible, setIsVisible }: { isVisible: boolean; setIsVisible: any }) {
  interface Secret {
    name: string;
    testValue: string;
    productionValue: string;
  }

  const { getSecrets, saveSecrets } = useApi();
  const { activeProject } = useContext(SwizzleContext);

  const [newSecretVisible, setNewSecretVisible] = useState<boolean>(false);

  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [remoteSavedSecrets, setRemoteSavedSecrets] = useState<Secret[]>([]);
  const [locallyChangedSecrets, setLocallyChangedSecrets] = useState<string[]>([]);

  const [newSecretName, setNewSecretName] = useState<string>("");
  const [newSecretTestValue, setNewSecretTestValue] = useState<string>("");
  const [newSecretProductionValue, setNewSecretProductionValue] = useState<string>("");

  useEffect(() => {
    if (isVisible) {
      getSecrets().then((secrets) => {
        if (secrets == null) return;

        const shapedSecretArray = Object.keys(secrets.test)
          .map((key) => ({
            name: key,
            testValue: secrets.test[key],
            productionValue: secrets.prod[key] == true ? "(hidden for security)" : secrets.prod[key],
          }))
          .filter((secret) => !secret.name.startsWith("SWIZZLE_"));

        setSecrets(shapedSecretArray);
        setRemoteSavedSecrets(shapedSecretArray);
      });
    }
  }, [activeProject, isVisible]);

  const deleteSecret = (name: string) => {
    setSecrets(secrets.filter((secret) => secret.name != name));
  };

  const updateSecret = (name: string, key: "testValue" | "productionValue", newValue: string) => {
    const updatedSecrets = secrets.map((secret) => {
      if (secret.name === name) {
        return { ...secret, [key]: newValue };
      }
      return secret;
    });

    //check if new value is different from remoteSavedSecrets. if yes add to locallyChangedSecrets. if not remove from locallyChangedSecrets
    const remoteSecret = remoteSavedSecrets.find((secret) => secret.name == name);
    if (remoteSecret != null) {
      if (remoteSecret[key] != newValue) {
        setLocallyChangedSecrets([...locallyChangedSecrets, name + "-" + key]);
      } else {
        setLocallyChangedSecrets(locallyChangedSecrets.filter((secret) => secret != name + "-" + key));
      }
    }

    setSecrets(updatedSecrets);
  };

  const closeWindow = () => {
    setLocallyChangedSecrets([]);
    setIsVisible(false);
  };

  const setNewSecrets = () => {
    const secretsObject = secrets.reduce(
      (acc, secret) => {
        acc.test[secret.name] = secret.testValue;
        if (secret.productionValue != "(hidden for security)") {
          acc.prod[secret.name] = secret.productionValue;
        }
        return acc;
      },
      { test: {}, prod: {} },
    );
    return saveSecrets(secretsObject);
  };

  const createNewSecret = () => {
    setSecrets([
      ...secrets,
      {
        name: newSecretName,
        testValue: newSecretTestValue,
        productionValue: newSecretProductionValue,
      },
    ]);
    setNewSecretName("");
    setNewSecretTestValue("");
    setNewSecretProductionValue("");
    return setNewSecrets();
  };

  return (
    <>
      <ToastWindow
        isHintWindowVisible={isVisible}
        showHintWindowIfOpen={() => setIsVisible(true)}
        hideHintWindow={() => {}}
        title={""}
        titleClass="text-md font-bold"
        isLarge={true}
        overrideLeftMargin={-426}
        overrideTopMargin={-4}
        content={
          <div className="overflow-scroll max-h-[70vh]">
            <div className="flex mb-2 space-between">
              <div className="flex">
                <div className="font-bold text-lg mr-2">Secrets</div>
                <Button
                  text="+ New"
                  onClick={() => {
                    //confirm changes...
                    setNewSecretVisible(true);
                    closeWindow();
                  }}
                  className="px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border ml-auto"
                />
              </div>
              <div className="flex items-end ml-auto">
                <Button
                  text="Cancel"
                  onClick={() => {
                    closeWindow();
                  }}
                  className="px-5 py-1 mr-2 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border ml-auto"
                />
                <Button
                  text="Save"
                  onClick={() => {
                    toast.promise(setNewSecrets(), {
                      loading: "Saving secrets...",
                      success: () => {
                        closeWindow();
                        return "Secrets saved";
                      },
                      error: "Failed to save secrets",
                    });
                  }}
                  className="px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border ml-auto"
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center mt-5">
              {secrets.map((secret) => {
                return (
                  <div key={secret.name} className="flex flex-col w-full mb-4">
                    <div className="flex justify-between items-center pb-2">
                      <span className="font-bold flex-1">{secret.name}</span>
                      <div className="opacity-70 hover:opacity-100 cursor-pointer">
                        <FontAwesomeIcon
                          icon={faTrash}
                          onClick={() => {
                            deleteSecret(secret.name);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="w-1/4">Test</span>
                      <input
                        className={`w-3/4 bg-transparent border rounded outline-0 p-1 ${
                          locallyChangedSecrets.includes(secret.name + "-testValue")
                            ? "border-[#bdb76b]"
                            : "border-[#525363] focus:border-[#68697a]"
                        }`}
                        placeholder="Test value"
                        value={secret.testValue}
                        onChange={(e) => updateSecret(secret.name, "testValue", e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="w-1/4">Production</span>
                      <input
                        className={`w-3/4 bg-transparent border rounded outline-0 p-1 ${
                          secret.productionValue == "(hidden for security)" ? "opacity-50" : ""
                        }  ${
                          locallyChangedSecrets.includes(secret.name + "-productionValue")
                            ? "border-[#bdb76b]"
                            : "border-[#525363] focus:border-[#68697a]"
                        }`}
                        placeholder="Production value"
                        value={secret.productionValue}
                        onChange={(e) => updateSecret(secret.name, "productionValue", e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        }
        position={"bottom-left"}
      />

      <FullPageModal
        isVisible={newSecretVisible}
        setIsVisible={setNewSecretVisible}
        modalDetails={{
          title: "🔒 New Secret",
          description: (
            <div className="flex flex-col items-center justify-center mt-2">
              <div className="w-full">
                <div className="text-gray-300 mb-2">Secret name</div>
                <input
                  className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                  placeholder=""
                  value={newSecretName}
                  onChange={(e) => setNewSecretName(e.target.value)}
                />
              </div>
              <div className="w-full">
                <div className="text-gray-300 mb-2 mt-4">Test environment value</div>
                <textarea
                  className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                  placeholder=""
                  value={newSecretTestValue}
                  onChange={(e) => setNewSecretTestValue(e.target.value)}
                />
              </div>
              <div className="w-full">
                <div className="text-gray-300 mb-2 mt-4">Production environment value</div>
                <textarea
                  className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                  placeholder=""
                  value={newSecretProductionValue}
                  onChange={(e) => setNewSecretProductionValue(e.target.value)}
                />
              </div>
            </div>
          ),
          confirmText: "Create",
          confirmHandler: () => {
            toast.promise(createNewSecret(), {
              loading: "Creating secret...",
              success: () => {
                setNewSecretVisible(false);
                return "Secret saved";
              },
              error: "Failed to save secret",
            });
          },
          shouldShowInput: false,
          placeholder: "", //unused since shouldShowInput is false
        }}
      />
    </>
  );
}
