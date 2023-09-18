import { useEffect, useState } from "react";
import SectionAction from "../../LeftSidebar/SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ToastWindow from "../../Utilities/Toast/ToastWindow";
import Button from "../../Utilities/Button";

export default function SecretInfo({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: any;
}) {
  interface Secret {
    name: string;
    testValue: string;
    productionValue: string;
  }

  const [newSecretVisible, setNewSecretVisible] = useState<boolean>(false);
  const [secrets, setSecrets] = useState<Secret[]>([
    { name: "testName", testValue: "testValue", productionValue: "prodValue" },
  ]);

  return (
    <>
      <ToastWindow
        isHintWindowVisible={isVisible}
        showHintWindowIfOpen={() => setIsVisible(true)}
        hideHintWindow={() => {}}
        title={""}
        titleClass="text-md font-bold"
        isLarge={false}
        content={
          <div className="overflow-scroll max-h-[70vh]">
            <div className="flex mb-2 space-between">
              <div className="font-bold text-lg">Secrets</div>
              <Button
                text="Close"
                onClick={() => {
                  setIsVisible(false);
                }}
                className="px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border ml-auto"
              />
            </div>

            <div className="flex flex-col items-center justify-center mt-3">
              <table className="w-full">
                <tbody className="space-y-2">
                  {secrets.map((secret) => {
                    return (
                      <>
                        <tr key={secret.name}>
                          <td className="font-bold">{secret.name}</td>
                          <td className="opacity-70 hover:opacity-100 cursor-pointer">
                            <FontAwesomeIcon
                              className="ml-auto"
                              icon={faTrash}
                              onClick={() => {
                                /* Handle deletion here */
                              }}
                            />
                          </td>
                        </tr>
                        <tr key={secret.name + "test"}>
                          <td className="">Test</td>
                          <td className="">
                            <input
                              className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-1"
                              placeholder="Test value"
                            />
                          </td>
                        </tr>
                        <tr key={secret.name + "prod"}>
                          <td className="">Production</td>
                          <td className="">
                            <input
                              className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-1"
                              placeholder="Production value"
                            />
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
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
                />
              </div>
              <div className="w-full">
                <div className="text-gray-300 mb-2 mt-4">
                  Test environment value
                </div>
                <textarea
                  className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                  placeholder=""
                />
              </div>
              <div className="w-full">
                <div className="text-gray-300 mb-2 mt-4">
                  Production environment value
                </div>
                <textarea
                  className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2"
                  placeholder=""
                />
              </div>
            </div>
          ),
          confirmText: "Create",
          confirmHandler: () => {},
          shouldShowInput: false,
          placeholder: "", //unused since shouldShowInput is false
        }}
      />
    </>
  );
}
