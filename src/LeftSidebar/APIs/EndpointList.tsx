import { useContext, useEffect, useState } from "react";
import EndpointItem from "./EndpointItem";
import { Method } from "../../Utilities/Method";
import SectionAction from "../SectionAction";
import APIWizard from "./APIWizard";
import useApi from "../../API/EndpointAPI";
import toast from "react-hot-toast";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

export default function EndpointList({ active }: { active: boolean }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { getFiles } = useApi();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [fullEndpointList, setFullEndpointList] = useState<any[]>([]);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const { activeProject, setPostMessage, activeEndpoint, setActiveEndpoint } = useContext(SwizzleContext);

  useEffect(() => {
    getFiles()
      .then((data) => {
        if(data == undefined || data.children == undefined || data.children.length == 0) { return }
        const transformedEndpoints = data.children.map((endpoint: any) => {
          console.log(endpoint)
          return endpoint.name.replace(/-/g, "/").replace(".js", "");
        }).filter((endpoint: string) => {
          return endpoint != "_swizzle_blank";
        });
        setFullEndpointList(transformedEndpoints);
        setEndpoints(transformedEndpoints);
      })
      .catch((e) => {
        toast.error("Error fetching endpoints");
        console.log(e);
      });
  }, [activeProject]);

  //Used to open any file in theia
  useEffect(() => {
    if(activeEndpoint == undefined || activeEndpoint == "") return;
    const fileName = activeEndpoint.replace(/\//g, '-');
    console.log(fileName)
    setPostMessage({type: "openFile", fileName: `${fileName}.js`})
  }, [activeEndpoint]);

  //Used to filter the endopint list
  useEffect(() => {
    if(searchFilter == "") {
      setEndpoints(fullEndpointList);
      return;
    }
    const filteredEndpoints = endpoints.filter((endpoint) => {
      return endpoint.includes(searchFilter);
    });
    setEndpoints(filteredEndpoints);
  }, [searchFilter]);

  const formatEndpointName = (endpoint: string) => {
    return "/" + endpoint.split("/")[1];
  }

  const getMethodType = (endpoint: string) => {
    return endpoint.split("/")[0].toUpperCase() as Method;
  }

  //Fetch from backend and populate it here.
  return (
    <div className={`flex-col w-full px-2 text-sm ${active ? "" : "hidden"}`}>
      <SectionAction
        text="+ New API"
        onClick={() => {
          setIsVisible(true);
        }}
      />
      <div className="flex">
      <input
        className="w-full bg-transparent border-[#525363] border-0 rounded outline-0 focus:border-[#68697a] px-1.5 pb-1.5 mt-1"
        placeholder="Filter"
        value={searchFilter}
        onChange={(e) => {
          setSearchFilter(e.target.value);
        }}
      />
      <FontAwesomeIcon icon={faXmarkCircle} className={`w-3 h-3 m-auto text-[#525363] cursor-pointer hover:text-[#D9D9D9] ${searchFilter == "" ? "hidden" : "" }`} onClick={() => setSearchFilter("")} />
      </div>

      {endpoints.map((endpoint) => {  
        return (
          <EndpointItem
            key={endpoint}
            path={formatEndpointName(endpoint)}
            method={getMethodType(endpoint)}
            active={endpoint == activeEndpoint}
            onClick={() => {
              setActiveEndpoint(endpoint);
            }}
          />
        );
      })}
      <APIWizard isVisible={isVisible} setIsVisible={setIsVisible} />
    </div>
  );
}
