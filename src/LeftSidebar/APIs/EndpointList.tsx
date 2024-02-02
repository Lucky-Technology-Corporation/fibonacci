import {
  faBoltLightning,
  faChevronDown,
  faChevronRight,
  faClock,
  faGear,
  faPuzzlePiece,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import useEndpointApi from "../../API/EndpointAPI";
import PackageInfo from "../../RightSidebar/Sections/PackageInfo";
import SecretInfo from "../../RightSidebar/Sections/SecretInfo";
import { endpointSort } from "../../Utilities/ActiveEndpointHelper";
import Dropdown from "../../Utilities/Dropdown";
import { filenameToEndpoint } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import IconTextButton from "../../Utilities/IconTextButton";
import { Method } from "../../Utilities/Method";
import { Page } from "../../Utilities/Page";
import APIWizard from "./APIWizard";
import EndpointItem from "./EndpointItem";
import FileItem from "./FileItem";
import HelperItem from "./HelperItem";
import HelperWizard from "./HelperWizard";
// import HelperWizard from "./HelperWizard";

export default function EndpointList({ currentFileProperties }: { currentFileProperties: any }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isHelperWizardVisible, setIsHelperWizardVisible] = useState<boolean>(false);

  const { getFiles, getFile, writeFile, getScheduledFunctions } = useEndpointApi();
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [fullHelperList, setFullHelperList] = useState<any[]>([]);
  const [helperList, setHelperList] = useState<any[]>([]);
  const [fullScheduledFunctions, setFullScheduledFunctions] = useState<any[]>([]);
  const [shouldShowPackagesWindow, setShouldShowPackagesWindow] = useState<boolean>(false);
  const [shouldShowSecretsWindow, setShouldShowSecretsWindow] = useState<boolean>(false);
  const [showTriggerEndpoints, setShowTriggerEndpoints] = useState<boolean>(false);

  const [isCron, setIsCron] = useState<boolean>(false);

  const [endpointToEdit, setEndpointToEdit] = useState<string>("");

  const methods: any = [
    { id: "endpoint", name: "+ Endpoint" },
    { id: "helper", name: "+ Helper" },
    { id: "cron", name: "+ Scheduled Job" },
  ];

  const {
    activeProject,
    testDomain,
    selectedTab,
    activeEndpoint,
    setActiveEndpoint,
    setActiveFile,
    activeFile,
    shouldRefreshList,
    fullEndpointList,
    setFullEndpointList,
    setPostMessage,
  } = useContext(SwizzleContext);

  const editFileHandler = (path: string, isCron: boolean = false) => {
    setPostMessage({ type: "saveFile" });
    setIsCron(isCron);
    setEndpointToEdit(path);
  };

  useEffect(() => {
    if (endpointToEdit != "") {
      setIsVisible(true);
    }
  }, [endpointToEdit]);

  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => {
        setEndpointToEdit("");
      }, 250);
    }
  }, [isVisible]);

  // const temporaryFixOldTsConfigs = async () => {
  //   try {
  //     var needsUpdate = false;
  //     const parsed = await getFile("backend/tsconfig.json");
  //     if (parsed.compilerOptions.module !== "NodeNext") {
  //       parsed.compilerOptions.module = "NodeNext";
  //       needsUpdate = true;
  //     }
  //     if (parsed.compilerOptions.moduleResolution !== "NodeNext") {
  //       parsed.compilerOptions.moduleResolution = "NodeNext";
  //       needsUpdate = true;
  //     }
  //     if (needsUpdate == false) {
  //       return;
  //     }
  //     const updatedData = JSON.stringify(parsed, null, 2);
  //     await writeFile("backend/tsconfig.json", updatedData);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // useEffect(() => {
  //   if (testDomain) {
  //     temporaryFixOldTsConfigs();
  //   }
  // }, [testDomain]);

  useEffect(() => {
    console.log("refreshing endpoint list", testDomain, activeProject);
    if (testDomain == undefined || activeProject == undefined) {
      return;
    }

    getFiles("endpoints")
      .then((data) => {
        if (data == undefined || data.children == undefined || data.children.length == 0) {
          return;
        }
        const transformedEndpoints = data.children
          .map((endpoint: any) => {
            return filenameToEndpoint(endpoint.name);
          })
          .sort(endpointSort)
          .filter((endpoint: string) => {
            return endpoint != "_swizzle_blank";
          });
        setFullEndpointList(transformedEndpoints);
        setEndpoints(transformedEndpoints);
      })
      .catch((e) => {
        toast.error("Error fetching endpoints");
        console.error(e);
      });

    getFiles("helpers")
      .then((data) => {
        if (data == undefined || data.children == undefined || data.children.length == 0) {
          return;
        }

        const transformedHelpers = data.children.map((endpoint: any) => {
          return endpoint.name.replace(".ts", "");
        });

        setHelperList(transformedHelpers);
        setFullHelperList(transformedHelpers);
      })
      .catch((e) => {
        toast.error("Error fetching helpers");
        console.error(e);
      });
  }, [testDomain, shouldRefreshList]);

  useEffect(() => {
    if (activeProject == undefined || activeProject == "") {
      return;
    }
    getScheduledFunctions().then((data) => {
      var scheduledFunctions = [];
      if (data == undefined || data.scheduled_functions == undefined) {
        return;
      }
      data.scheduled_functions.forEach((func: any) => {
        scheduledFunctions.push({ path: func.endpoint, cron: func.schedule, id: func.id });
      });
      setFullScheduledFunctions(scheduledFunctions);
    });
  }, [activeProject]);

  //Used to filter the endopint list
  useEffect(() => {
    if (searchFilter == "") {
      setEndpoints(fullEndpointList);
      setHelperList(fullHelperList);
      return;
    }
    const filteredEndpoints = endpoints.filter((endpoint) => {
      return endpoint.includes(searchFilter);
    });
    setEndpoints(filteredEndpoints);

    const filteredHelpers = helperList.filter((helper) => {
      return helper.includes(searchFilter);
    });
    setHelperList(filteredHelpers);
  }, [searchFilter]);

  useEffect(() => {
    if (selectedTab == Page.Apis && endpoints && endpoints.length > 0 && activeEndpoint == undefined) {
      console.log("setting active endpoint to first in the list", endpoints, activeEndpoint);
      setActiveEndpoint(endpoints[0]);
    }
  }, [selectedTab, endpoints]);

  //Fetch from backend and populate it here.
  return (
    <div className={`flex-col w-full px-1 text-sm ${selectedTab == Page.Apis ? "" : "hidden"}`}>
      <div className="ml-1 mr-1 flex">
        <Dropdown
          className=""
          onSelect={(item: any) => {
            if (item == "endpoint") {
              setIsCron(false);
              setIsVisible(true);
            } else if (item == "helper") {
              setIsHelperWizardVisible(true);
            } else if (item == "cron") {
              setIsCron(true);
              setIsVisible(true);
            }
          }}
          children={methods}
          direction="left"
          title={"New"}
          selectorClass="w-full py-1.5 !mt-1.5 !mb-1"
        />
        <div className="flex">
          <div className="w-10 ml-2 mt-3">
            <IconTextButton
              textHidden={true}
              onClick={() => {
                setShouldShowSecretsWindow(true);
              }}
              className="p-[0.57rem]"
              icon={<img src="/lock.svg" className="w-4 h-4 m-auto" />}
              text="Secrets"
            />
          </div>
          {/* <SecretInfo isVisible={shouldShowSecretsWindow} setIsVisible={setShouldShowSecretsWindow} /> */}
          <div className="w-10 ml-2 mt-3">
            <IconTextButton
              textHidden={true}
              onClick={() => {
                setShouldShowPackagesWindow(true);
              }}
              className="p-[0.57rem]"
              icon={<img src="/box.svg" className="w-4 h-4 m-auto" />}
              text="Packages"
            />
          </div>
        </div>
      </div>
      <PackageInfo isVisible={shouldShowPackagesWindow} setIsVisible={setShouldShowPackagesWindow} location="backend" />
      <SecretInfo isVisible={shouldShowSecretsWindow} setIsVisible={setShouldShowSecretsWindow} />

      <div className="flex ml-2 my-1 mr-2 mb-3">
        <input
          className="w-full bg-transparent border-[#525363] border-0 rounded outline-0 focus:border-[#68697a]"
          placeholder="Filter"
          value={searchFilter}
          onChange={(e) => {
            setSearchFilter(e.target.value);
          }}
        />
        <FontAwesomeIcon
          icon={faXmarkCircle}
          className={`w-3 h-3 m-auto text-[#525363] cursor-pointer hover:text-[#D9D9D9] ${
            searchFilter == "" ? "hidden" : ""
          }`}
          onClick={() => setSearchFilter("")}
        />
      </div>

      <Tooltip
        id="triggers-tab-tooltip"
        className={`fixed z-50`}
        style={{ backgroundColor: "rgb(209 213 219)", color: "#000" }}
      />
      <a
        className="w-full"
        data-tooltip-id="triggers-tab-tooltip"
        data-tooltip-content={"Functions that are called when specific things happen"}
        data-tooltip-place="right"
      >
        <div
          className="font-semibold ml-2 mt-0 flex pt-2 pb-1 flex text-gray-400 hover:text-gray-300 cursor-pointer"
          onClick={() => {
            setShowTriggerEndpoints((p) => !p);
          }}
        >
          <FontAwesomeIcon icon={faBoltLightning} className="w-3 h-3 my-auto mr-1" />
          <div className="flex items-center">Triggers</div>
          <div className="ml-2">
            {showTriggerEndpoints ? (
              <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 my-auto" />
            ) : (
              <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 my-auto" />
            )}
          </div>
        </div>
      </a>

      <div className={`ml-1 mb-1 ${showTriggerEndpoints ? "" : "hidden"}`}>
        <div
          className={searchFilter != "" ? ("new user signup".includes(searchFilter.toLowerCase()) ? "" : "hidden") : ""}
        >
          <FileItem
            key={"signup_callback.ts"}
            path={"New user signup"}
            active={"!trigger!/backend/swizzle-dependencies/signup_callback.ts" == activeEndpoint}
            onClick={() => {
              setActiveEndpoint("!trigger!/backend/swizzle-dependencies/signup_callback.ts");
            }}
            disableDelete={true}
          />
        </div>
      </div>

      <div className="endpoints-list pt-2">
        <Tooltip
          id="endpoints-tab-tooltip"
          className={`fixed z-50`}
          style={{ backgroundColor: "rgb(209 213 219)", color: "#000" }}
        />
        <a
          className="w-full"
          data-tooltip-id="endpoints-tab-tooltip"
          data-tooltip-content={"Functions that are called from your frontend"}
          data-tooltip-place="right"
        >
          <div className="font-semibold ml-2 mt-2 flex pb-1 text-gray-400 hover:text-gray-300">
            <FontAwesomeIcon icon={faGear} className="w-3 h-3 my-auto mr-1" />
            <div className="flex items-center">Endpoints</div>
          </div>
        </a>
        <div className="ml-1">
          {endpoints
            .filter((v) => !v.startsWith("get/cron"))
            .map((endpoint, index) => (
              <EndpointItem
                key={index}
                path={endpoint.substring(endpoint.indexOf("/"))}
                method={endpoint.split("/")[0].toUpperCase() as Method}
                active={endpoint == activeEndpoint}
                onClick={() => setActiveEndpoint(endpoint)}
                removeFromList={() => {
                  setEndpoints((prev) => {
                    return prev.filter((e) => e != endpoint);
                  });
                  setFullEndpointList((prev) => {
                    return prev.filter((e) => e != endpoint);
                  });
                }}
                editFile={() => {
                  editFileHandler(endpoint);
                }}
              />
            ))}
        </div>
      </div>

      <div className="helpers-list">
        {helperList.length > 0 && (
          <>
            <Tooltip
              id="helpers-tab-tooltip"
              className={`fixed z-50`}
              style={{ backgroundColor: "rgb(209 213 219)", color: "#000" }}
            />
            <a
              className="w-full"
              data-tooltip-id="helpers-tab-tooltip"
              data-tooltip-content={"Functions that can be used in endpoints or other helpers"}
              data-tooltip-place="right"
            >
              <div className="font-semibold ml-2 mt-2 flex pt-2 pb-1 text-gray-400 hover:text-gray-300">
                <FontAwesomeIcon icon={faPuzzlePiece} className="w-3 h-3 my-auto mr-1" />
                <div className="flex items-center">Helpers</div>
              </div>
            </a>
            <div className="ml-1">
              {helperList.map((helper, index) => {
                return (
                  <HelperItem
                    key={index}
                    path={helper.replace("/helpers/", "")}
                    active={"!helper!" + helper == activeEndpoint}
                    onClick={() => setActiveEndpoint("!helper!" + helper)}
                    removeFromList={() => {
                      setHelperList((prev) => {
                        return prev.filter((e) => e != helper);
                      });
                      setFullHelperList((prev) => {
                        return prev.filter((e) => e != helper);
                      });
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {endpoints.filter((v) => v.startsWith("get/cron")).length > 0 && (
          <>
            <div className="font-semibold ml-2 mt-2 flex pb-1 opacity-70">
              <FontAwesomeIcon icon={faClock} className="w-3 h-3 my-auto mr-1" />
              <div className="flex items-center">Jobs</div>
            </div>

            <div className="ml-1">
              {endpoints
                .filter((v) => v.startsWith("get/cron"))
                .map((endpoint, index) => (
                  <EndpointItem
                    key={index}
                    path={endpoint.substring(endpoint.indexOf("/"))}
                    method={endpoint.split("/")[0].toUpperCase() as Method}
                    active={endpoint == activeEndpoint}
                    onClick={() => setActiveEndpoint(endpoint)}
                    removeFromList={() => {
                      setEndpoints((prev) => {
                        return prev.filter((e) => e != endpoint);
                      });
                      setFullEndpointList((prev) => {
                        return prev.filter((e) => e != endpoint);
                      });
                    }}
                    cronIdIfEditing={
                      (fullScheduledFunctions.filter((func) => "get" + func.path == endpoint)[0] || {}).id
                    }
                    editFile={() => {
                      editFileHandler(endpoint, true);
                    }}
                  />
                ))}
            </div>
          </>
        )}
      </div>

      <APIWizard
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setEndpoints={setEndpoints}
        setFullEndpoints={setFullEndpointList}
        endpoints={fullEndpointList}
        endpointPathIfEditing={endpointToEdit}
        currentFileProperties={currentFileProperties}
        isCron={isCron}
        fullScheduledFunctions={fullScheduledFunctions}
      />

      <HelperWizard
        isVisible={isHelperWizardVisible}
        setIsVisible={setIsHelperWizardVisible}
        setHelpers={setHelperList}
        setFullHelpers={setFullHelperList}
        helpers={fullHelperList}
      />
    </div>
  );
}
