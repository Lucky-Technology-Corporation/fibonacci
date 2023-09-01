import { useContext, useEffect, useState } from "react";
import EndpointItem from "./EndpointItem";
import { Method } from "../../Utilities/Method";
import SectionAction from "../SectionAction";
import APIWizard from "./APIWizard";
import useApi from "../../API/EndpointAPI";
import toast from "react-hot-toast";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function EndpointList({ active }: { active: boolean }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { getFiles } = useApi();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeEndpoint, setActiveEndpoint] = useState<string>("");
  const [fullEndpointList, setFullEndpointList] = useState<any[]>(["get/", "post/", "get/admin", "get/admin/:id"]);
  const [endpoints, setEndpoints] = useState<any[]>(["get/", "post/", "get/admin", "get/admin/:id"]);
  const { activeProject, setPostMessage } = useContext(SwizzleContext);

  useEffect(() => {
    getFiles()
      .then((data) => {
        // data.endpoints.forEach.replace("-", "/");
      })
      .catch((e) => {
        toast.error("Error fetching endpoints");
        console.log(e);
      });
  }, [activeProject]);

  useEffect(() => {
    const fileName = activeEndpoint.replace("/", "-");
    setPostMessage({type: "openFile", fileUri: `/home/swizzle_prod_user/code/${fileName}.js`})
  }, [activeEndpoint]);

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
      <input
        className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2 py-1.5"
        placeholder="Filter"
        value={searchFilter}
        onChange={(e) => {
          setSearchFilter(e.target.value);
        }}
      />

      {endpoints.map((endpoint) => {  
        return (
          <EndpointItem
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
