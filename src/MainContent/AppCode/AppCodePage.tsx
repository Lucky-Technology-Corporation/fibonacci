import { ReactNode, useContext, useEffect } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import Dropdown from "../../Utilities/Dropdown";
import { useState } from "react";
import Button from "../../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import FullPageModal from "../../Utilities/FullPageModal";
import useApi from "../../API/EndpointAPI";
import toast from "react-hot-toast";
import FloatingModal from "../../Utilities/FloatingModal";
import Checkbox from "../../Utilities/Checkbox";
import EndpointItem from "../../LeftSidebar/APIs/EndpointItem";
import { Method } from "../../Utilities/Method";

export default function AppCodePage() {
  const { activeProject, environment, figmaToken, setFigmaToken } = useContext(SwizzleContext);

  const { getCodeFromFigma, getFiles } = useApi();

  const languages: any = [
    { id: "swift", name: "Swift" },
    { id: "unity", name: "Unity (C#)" },
    { id: "react", name: "React (Javascript)" },
  ];
  const [selectedMethod, setSelectedMethod] = useState<string>("swift");
  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
  const [modalInputContent, setModalInputContent] = useState<ReactNode>(null);
  const [includedEndpoints, setIncludedEndpoints] = useState<string[]>([]);

  const authenticateAndOpen = () => {
    toast.error("Figma code generation is in alpha. Your account only has access to beta or higher.");
    return;
    if (figmaToken == "") {
      const randomString = Math.random().toString(36).substring(7);
      location.href = `https://www.figma.com/oauth?client_id=4bYemRCF1wcQlAlSSDRvLD44VE3wxr&redirect_uri=https://usesilverback.com&scope=files:read&state=${randomString}&response_type=code`;
    } else {
      setIsInputVisible(true);
    }
  };

  const importFigmaFile = async (url: string) => {
    const code = await getCodeFromFigma(url, "swift");
  };

  const openModelGenerator = async () => {
    toast.promise(getFiles("endpoints"), {
      loading: "Looking thorugh your project",
      success: (data: any) => {
        openModelGeneratorModal(data);
        return "Created project map";
      },
      error: () => {
        return "Failed to understand your project";
      },
    });
  };

    const copyPackageLink = () => {
        navigator.clipboard.writeText("https://github.com/Lucky-Technology-Corporation/SwizzleSwift")
        toast.success("Copied! Paste this into your Swift Package Manager dependencies")
    }

    const openModelGeneratorModal = async (data: any) => {
        if (data == undefined || data.children == undefined || data.children.length == 0) {
            return;
        }
        const transformedEndpoints = data.children
            .map((endpoint: any) => {
                return endpoint.name.replace(/-/g, "/").replace(/_/g, ":").replace(".js", "");
            })
            .filter((endpoint: string) => {
                return endpoint != "_swizzle_blank";
            });

    const content = (
      <div className="flex flex-col space-y-2">
        <table>
          <tr>
            <th className="">Endpoint</th>
            <th className=""></th>
          </tr>
          {transformedEndpoints.map((endpoint: string) => {
            <tr>
              <td className="py-1 text-center">
                <EndpointItem
                  key={endpoint}
                  path={"/" + endpoint.split("/")[1]}
                  method={endpoint.split("/")[0].toUpperCase() as Method}
                />
              </td>
              <td className="py-1 text-center">
                <Checkbox
                  id={endpoint}
                  label={includedEndpoints.includes(endpoint) ? "Included" : "Not included"}
                  isChecked={includedEndpoints.includes(endpoint)}
                  setIsChecked={(checked: boolean) => {
                    if (checked) {
                      setIncludedEndpoints([...includedEndpoints, endpoint]);
                    } else {
                      setIncludedEndpoints(includedEndpoints.filter((e) => e != endpoint));
                    }
                  }}
                />
              </td>
            </tr>;
          })}
        </table>
        <div className="w-24 ml-auto">
          <Button text="Next" onClick={() => {}} />
        </div>
      </div>
    );
    setModalInputContent(content);
  };

  return (
    <div className="h-full overflow-scroll min-h-[50vh]">
      <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div className="flex w-full">
          <div>
            <div className={`font-bold text-base`}>
              Frontend
              <div className="m-auto ml-2 inline-flex items-center rounded-md bg-yellow-300 bg-opacity-30 px-2 mt-1 py-0.5 text-xs font-medium text-yellow-300 ring-1 ring-inset ring-yellow-300/20">
                Beta
              </div>
            </div>
            <div className={`text-sm mt-0.5`}>Click any request to see its logs</div>
          </div>

          <Dropdown
            className="my-auto ml-auto mr-2"
            onSelect={(item: any) => {
                if(item != "swift"){
                    toast.error("Multi language code generation is in alpha. Your account only has access to beta or higher.")
                    return;
                }
                setSelectedMethod(item);
            }}
            children={languages}
            direction="right"
            title={languages.find((language: any) => language.id == selectedMethod)?.name}
            />
        </div>
      </div>

      <div className="pr-2 mr-4 pl-4 pt-1 flex flex-row space-x-2">
          <table className="w-full">
            <thead className="bg-[#85869822]">
              <tr className="border-b border-[#4C4F6B]">
                <th className="text-left pl-2 py-1 font-light rounded-tl-md">File</th>
                <th className="text-left py-1 font-light ">Description</th>
                <th className="w-6 rounded-tr-md"></th>
              </tr>
            </thead>
            <tbody className="overflow-y-scroll">
                <tr>
                    <td className="py-2 pl-2 underline decoration-dotted cursor-pointer" onClick={copyPackageLink}>Swizzle Swift Package</td>
                    <td className="py-2">Adds support for Swizzle in your Swift project</td>
                    <td className="py-2 opacity-70 cursor-pointer hover:opacity-100"></td>
                </tr>
                <tr>
                    <td className="py-2 pl-2 underline decoration-dotted cursor-pointer" onClick={openModelGenerator}>Model.swift</td>
                    <td className="py-2">Provides the functions that call your backend</td>
                    <td className="py-2 opacity-70 cursor-pointer hover:opacity-100">
                        {/* <FontAwesomeIcon icon={faTrash} /> */}
                    </td>
                </tr>
                <tr>
                    <td className="pt-2 pl-2 flex">
                        <div className="w-42">
                            <Button text="Add from Figma" onClick={() => {authenticateAndOpen()}} />
                        </div>
                    </td>
                </tr>
            </tbody>
          </table>
      </div>

      <FloatingModal
        content={modalInputContent}
        closeModal={() => {
          setModalInputContent(null);
        }}
      />

      <FullPageModal
        isVisible={isInputVisible}
        setIsVisible={setIsInputVisible}
        regexPattern={/^https:\/\/www\.figma\.com\/file\/.*node-id=(?!0-1\b).+$/}
        errorMessage="Select a specific Figma component or group and copy the link"
        modalDetails={{
          title: "Import from Figma",
          description: "Enter the Figma file URL below",
          placeholder: "https://www.figma.com/file/...",
          confirmText: "Import",
          shouldShowInput: true,
          shouldHideCancel: false,
          confirmHandler: (url: string) => {
            importFigmaFile(url);
          },
        }}
      />
    </div>
  );
}
