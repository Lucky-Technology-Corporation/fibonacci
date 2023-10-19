import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import { filenameToEndpoint } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method } from "../../Utilities/Method";
import SectionAction from "../SectionAction";
import APIWizard from "./APIWizard";
import EndpointItem from "./EndpointItem";
import HelperItem from "./HelperItem";
import HelperWizard from "./HelperWizard";
import TemplateWizard from "./TemplateWizard";
// import HelperWizard from "./HelperWizard";

export default function EndpointList({ active }: { active: boolean }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isTemplateWizardVisible, setIsTemplateWizardVisible] = useState<boolean>(false);
  const [isHelperWizardVisible, setIsHelperWizardVisible] = useState<boolean>(false);

  const { getFiles } = useEndpointApi();
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [fullEndpointList, setFullEndpointList] = useState<any[]>([]);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [fullHelperList, setFullHelperList] = useState<any[]>([]);
  const [helperList, setHelperList] = useState<any[]>([]);

  const { activeProject, testDomain, activeEndpoint, setActiveEndpoint, shouldRefreshList } =
    useContext(SwizzleContext);

    // const [fullEndpointObj, setFullEndpointObj] = useState<Record<string, string[]>>({});
  // const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  // const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  // const toggleCollapse = (path: string) => {
  //   setCollapsedFolders((prev) => ({
  //     ...prev,
  //     [path]: !prev[path],
  //   }));
  // };

  // const transformToNested = (endpointList) => {
  //   const result = {};
  //   endpointList.forEach((endpoint) => {
  //     const [method, ...pathComponents] = endpoint.split("/");
  //     const path = pathComponents.join("/");

  //     // Special case for root and root parameter
  //     if (path === "" || path.startsWith(":")) {
  //       if (!result[""]) {
  //         result[""] = [];
  //       }
  //       result[""].push(endpoint);
  //       return;
  //     }

  //     // For non-root endpoints
  //     const rootName = path.split("/")[0];
  //     const singularRoot = pluralize.singular(rootName);

  //     if (!result[singularRoot]) {
  //       result[singularRoot] = [];
  //     }

  //     // Push the full endpoint (e.g., "GET/message/:id") into the array
  //     result[singularRoot].push(endpoint);
  //   });
  //   return result;
  // };

  useEffect(() => {
    getFiles("endpoints")
      .then((data) => {
        if (data == undefined || data.children == undefined || data.children.length == 0) {
          return;
        }
        const transformedEndpoints = data.children
          .map((endpoint: any) => {
            return filenameToEndpoint(endpoint.name)
          })
          .filter((endpoint: string) => {
            return endpoint != "_swizzle_blank";
          });
        setFullEndpointList(transformedEndpoints);
        setEndpoints(transformedEndpoints);
        setActiveEndpoint(transformedEndpoints[0]);
        // const nestedEndpoints = transformToNested(transformedEndpoints);
        // setFullEndpointObj(nestedEndpoints);
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
          return endpoint.name.replace(".js", "");
        });

        setHelperList(transformedHelpers);
        setFullHelperList(transformedHelpers);
      })
      .catch((e) => {
        toast.error("Error fetching helpers");
        console.error(e);
      });
  }, [testDomain, shouldRefreshList]);

  //Used to filter the endopint list
  useEffect(() => {
    if (searchFilter == "") {
      setEndpoints(fullEndpointList);
      return;
    }
    const filteredEndpoints = endpoints.filter((endpoint) => {
      return endpoint.includes(searchFilter);
    });
    setEndpoints(filteredEndpoints);
  }, [searchFilter]);

  useEffect(() => {
    if (active && endpoints && endpoints.length > 0 && activeEndpoint == undefined) {
      setActiveEndpoint(endpoints[0]);
    }
  }, [active, endpoints]);

  //Fetch from backend and populate it here.
  return (
    <div className={`flex-col w-full px-1 text-sm ${active ? "" : "hidden"}`}>
      <SectionAction
        text="+ Add Template"
        onClick={() => {
          setIsTemplateWizardVisible(true);
        }}
        className="py-1.5 px-1 !my-1.5 !mb-2 mx-1"
      />

      <div className="flex ml-2 mt-2">
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

      <div className="font-semibold ml-2 mt-2 flex">
        <SectionAction
          text="+"
          onClick={() => {
            setIsVisible(true);
          }}
          className="max-w-[21px] mr-2"
        />
        <div className="flex items-center">APIs</div>
      </div>

      <div className="ml-1">
        {endpoints.map((endpoint, index) => (
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
              })
            }}
          />
        ))}
        {/* {Object.keys(fullEndpointObj).map((path) => (
          <div key={path} className={"vertical-line mt-4 ml-2 cursor-pointer"}>
            <div
              onClick={() => {
                toggleCollapse(path);
                setHoveredFolder(null);
              }}
              className={`ml-2 ${hoveredFolder === path ? "text-white font-bold" : "font-base"}`}
              onMouseEnter={() => setHoveredFolder(path)}
              onMouseLeave={() => setHoveredFolder(null)}
            >
              <div className="font-mono text-xs flex">
                <img
                  src={
                    collapsedFolders[path]
                      ? hoveredFolder === path
                        ? "/open.svg"
                        : "/closed.svg"
                      : hoveredFolder === path
                      ? "/closed.svg"
                      : "/open.svg"
                  }
                  className="w-6 h-6 mr-1 m-auto ml-0"
                />
                <div className="m-auto ml-0">{path}</div>
              </div>
            </div>
            {!collapsedFolders[path] && (
              <div className="ml-2">
                {fullEndpointObj[path].map((endpoint, index) => (
                  <EndpointItem
                    key={index}
                    path={endpoint.substring(endpoint.indexOf("/"))}
                    method={endpoint.split("/")[0].toUpperCase() as Method}
                    active={endpoint == activeEndpoint}
                    onClick={() => setActiveEndpoint(endpoint)}
                  />
                ))}
              </div>
            )}
          </div>
        ))} */}
      </div>

      <div className="font-semibold ml-2 mt-2 flex">
        <SectionAction
          text="+"
          onClick={() => {
            setIsHelperWizardVisible(true);
          }}
          className="max-w-[21px] mr-2"
        />
        <div className="flex items-center">Functions</div>
      </div>
      <div className="ml-1">
        {fullHelperList.map((helper, index) => {
          return (
            <HelperItem
              key={index}
              path={helper.replace("/helpers/", "")}
              active={"!helper!" +helper == activeEndpoint}
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
      <APIWizard
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setEndpoints={setEndpoints}
        setFullEndpoints={setFullEndpointList}
        endpoints={fullEndpointList}
      />
      <HelperWizard
        isVisible={isHelperWizardVisible}
        setIsVisible={setIsHelperWizardVisible}
        setHelpers={setHelperList}
        setFullHelpers={setFullHelperList}
        helpers={fullHelperList}
      />
      <TemplateWizard
        isVisible={isTemplateWizardVisible}
        setIsVisible={setIsTemplateWizardVisible}
        setEndpoints={setEndpoints}
        setFullEndpoints={setFullEndpointList}
        setHelpers={setHelperList}
        setFullHelpers={setFullHelperList}
      />
    </div>
  );
}
