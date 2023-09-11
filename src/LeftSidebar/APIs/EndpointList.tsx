import { useContext, useEffect, useRef, useState } from "react";
import EndpointItem from "./EndpointItem";
import { Method } from "../../Utilities/Method";
import SectionAction from "../SectionAction";
import APIWizard from "./APIWizard";
import useApi from "../../API/EndpointAPI";
import toast from "react-hot-toast";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

export default function EndpointList({ active, currentFileProperties }: { active: boolean, currentFileProperties: any }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { getFiles } = useApi();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [fullEndpointList, setFullEndpointList] = useState<any[]>([]);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const { activeProject, setPostMessage, activeEndpoint, setActiveEndpoint } = useContext(SwizzleContext);
  const programmatiFileUpdateRef = useRef(false);

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
        console.log(transformedEndpoints);
      })
      .catch((e) => {
        toast.error("Error fetching endpoints");
        console.log(e);
      });
  }, [activeProject]);

  //Used to open any file in theia
  useEffect(() => {
    if (programmatiFileUpdateRef.current) {
      programmatiFileUpdateRef.current = false;
      return;
    }
    if(activeEndpoint == undefined || activeEndpoint == "") return;
    const fileName = activeEndpoint.replace(/\//g, '-');
    setPostMessage({type: "openFile", fileName: `${fileName}.js`})
  }, [activeEndpoint]);

  useEffect(() => {
    if(currentFileProperties == undefined || currentFileProperties.fileUri == undefined || !currentFileProperties.fileUri.includes("user-dependencies")) return;
    const newEndpoint = (currentFileProperties.fileUri.split("user-dependencies/")[1].replace(".js", "").replace(/-/g, "/"));
    if(newEndpoint == activeEndpoint) return;
    programmatiFileUpdateRef.current = true;
    setActiveEndpoint(newEndpoint);
  }, [currentFileProperties]);

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

      <div className="flex ml-2 mt-2">
        <input
          className="w-full bg-transparent border-[#525363] border-0 rounded outline-0 focus:border-[#68697a]"
          placeholder="Filter"
          value={searchFilter}
          onChange={(e) => {
            setSearchFilter(e.target.value);
          }}
        />
        <FontAwesomeIcon icon={faXmarkCircle} className={`w-3 h-3 m-auto text-[#525363] cursor-pointer hover:text-[#D9D9D9] ${searchFilter == "" ? "hidden" : "" }`} onClick={() => setSearchFilter("")} />
      </div>

      <div className="font-semibold ml-2 mt-2 flex">
        <div className="flex items-center">Endpoints</div>
        <SectionAction
          text="+"
          onClick={() => {
            setIsVisible(true);
          }}
          className="max-w-[21px] ml-2"
        />
      </div>

     
      <div className="ml-1">
        {endpoints.filter(e => !e.includes(".html")).map((endpoint) => {  
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
      </div>
      <div className="font-semibold ml-2 mt-2 flex">
        <div className="flex items-center">Helpers</div>
        <SectionAction
          text="+"
          onClick={() => {
            setIsVisible(true);
          }}
          className="max-w-[20px] ml-2"
        />
      </div>

      <APIWizard isVisible={isVisible} setIsVisible={setIsVisible} setEndpoints={setEndpoints} setFullEndpoints={setFullEndpointList} />
    </div>
  );
}
