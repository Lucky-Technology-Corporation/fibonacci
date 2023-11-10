import { faGear, faPuzzlePiece, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import Dropdown from "../../Utilities/Dropdown";
import { filenameToEndpoint } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method } from "../../Utilities/Method";
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

  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [fullHelperList, setFullHelperList] = useState<any[]>([]);
  const [helperList, setHelperList] = useState<any[]>([]);

  const methods: any = [
    { id: "endpoint", name: "+ Endpoint" },
    { id: "helper", name: "+ Helper" },
    { id: "template", name: "+ Template" },
  ];

  const { activeProject, testDomain, activeEndpoint, setActiveEndpoint, setActiveFile, shouldRefreshList, fullEndpointList, setFullEndpointList } =
    useContext(SwizzleContext);

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

      <div className="ml-1 mr-1">
        <Dropdown
          className=""
          onSelect={(item: any) => {
            if(item == "endpoint"){
              setIsVisible(true);
            } else if(item == "helper"){
              setIsHelperWizardVisible(true)
            } else if(item == "template"){
              setIsTemplateWizardVisible(true)
            }
          }}
          children={methods}
          direction="left"
          title={"+ New"}        
          selectorClass="w-full py-1.5 !mt-1.5 !mb-1"
        />
      </div>

      <div className="endpoints-list">
        <div className="font-semibold ml-2 mt-2 flex pb-1 opacity-70">
          <FontAwesomeIcon icon={faGear} className="w-3 h-3 my-auto mr-1" />
          <div className="flex items-center">Endpoints</div>
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
        </div>
      </div>
      <div className="helpers-list">
        <div className="font-semibold ml-2 mt-2 flex pt-2 pb-1 opacity-70">
          <FontAwesomeIcon icon={faPuzzlePiece} className="w-3 h-3 my-auto mr-1" />
          <div className="flex items-center">Helpers</div>
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
        type="dropin"
      />
    </div>
  );
}
