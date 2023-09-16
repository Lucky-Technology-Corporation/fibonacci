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
import FileItem from "./FileItem";
import FileWizard from "./FileWizard";

export default function FilesList({ active }: { active: boolean }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { getFiles } = useApi();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [fullFileList, setFullFileList] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const { activeProject, setPostMessage, activeFile, setActiveFile } =
    useContext(SwizzleContext);

  useEffect(() => {
    getFiles("files")
      .then((data) => {
        if (
          data == undefined ||
          data.children == undefined ||
          data.children.length == 0
        ) {
          return;
        }
        const transformedEndpoints = data.children.map((endpoint: any) => {
          return endpoint.name;
        });
        setFullFileList(transformedEndpoints);
        setFiles(transformedEndpoints);
        setActiveFile(transformedEndpoints[0]);
      })
      .catch((e) => {
        toast.error("Error fetching endpoints");
        console.log(e);
      });
  }, [activeProject]);

  useEffect(() => {
    if(active && files && files.length > 0 && activeFile == undefined){
      setActiveFile(files[0]);
    }
  }, [active, files]);

  //Used to filter the endopint list
  useEffect(() => {
    if (searchFilter == "") {
      setFiles(fullFileList);
      return;
    }
    const filteredEndpoints = files.filter((file) => {
      return file.includes(searchFilter);
    });
    setFiles(filteredEndpoints);
  }, [searchFilter]);

  const formatFileName = (file: string) => {
    return file;
  };

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

      <div className="font-semibold ml-2 mt-2 flex">
        <SectionAction
          text="+"
          onClick={() => {
            setIsVisible(true);
          }}
          className="max-w-[21px] mr-2"
        />
        <div className="flex items-center">HTML</div>
      </div>
      <div className="ml-1">
        {files
          .filter((f) => f.includes(".html"))
          .map((endpoint) => {
            return (
              <FileItem
                key={endpoint}
                path={formatFileName(endpoint)}
                active={endpoint == activeFile}
                onClick={() => {
                  setActiveFile(endpoint);
                }}
              />
            );
          })}
      </div>

      <div className="font-semibold ml-2 mt-2 flex">
        <SectionAction
          text="+"
          onClick={() => {
            setIsVisible(true);
          }}
          className="max-w-[21px] mr-2"
        />
        <div className="flex items-center">CSS</div>
      </div>
      <div className="ml-1">
        {files
          .filter((e) => e.includes(".css"))
          .map((file) => {
            return (
              <FileItem
                key={file}
                path={formatFileName(file)}
                active={file == activeFile}
                onClick={() => {
                  setActiveFile(file);
                }}
              />
            );
          })}
      </div>

      <div className="font-semibold ml-2 mt-2 flex">
        <SectionAction
          text="+"
          onClick={() => {
            setIsVisible(true);
          }}
          className="max-w-[21px] mr-2"
        />
        <div className="flex items-center">JS</div>
      </div>
      <div className="ml-1">
        {files
          .filter((e) => e.includes(".js"))
          .map((file) => {
            return (
              <FileItem
                key={file}
                path={formatFileName(file)}
                active={file == activeFile}
                onClick={() => {
                  setActiveFile(file);
                }}
              />
            );
          })}
      </div>

      <FileWizard
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setFiles={setFiles}
        setFullFiles={setFullFileList}
      />
    </div>
  );
}
