import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import SectionAction from "../SectionAction";
import FileItem from "./FileItem";
import FileWizard from "./FileWizard";

export default function FilesList({ active }: { active: boolean }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { getFiles } = useEndpointApi();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [fullFileList, setFullFileList] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const { testDomain, activeFile, setActiveFile, shouldRefreshList } = useContext(SwizzleContext);

  useEffect(() => {
    getFiles("files")
      .then((data) => {
        if (data == undefined || data.children == undefined || data.children.length == 0) {
          return;
        }
        const transformedEndpoints = data.children.map((endpoint: any) => {
          return endpoint.name;
        });
        setFullFileList(transformedEndpoints);
        setFiles(transformedEndpoints);
      })
      .catch((e) => {
        toast.error("Error fetching endpoints");
        console.error(e);
      });
  }, [testDomain, shouldRefreshList]);

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

  const restrictedFiles = ["App.js", "App.css", "index.js", "index.css"];

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

      <div className="ml-1 mt-1">
        <FileItem
          key={"index.html"}
          path={formatFileName("index.html")}
          active={"frontend/public/index.html" == activeFile}
          onClick={() => {
            setActiveFile("frontend/public/index.html");
          }}
          disableDelete={true}
        />
        <FileItem
          key={"App.js"}
          path={formatFileName("App.js")}
          active={"frontend/src/App.js" == activeFile}
          onClick={() => {
            setActiveFile("frontend/src/App.js");
          }}
          disableDelete={true}
        />
        <FileItem
          key={"App.css"}
          path={formatFileName("App.css")}
          active={"frontend/src/App.css" == activeFile}
          onClick={() => {
            setActiveFile("frontend/src/App.css");
          }}
          disableDelete={true}
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
        <div className="flex items-center">Components</div>
      </div>
      <div className="ml-1">
        {files
          .filter((file) => !restrictedFiles.includes(file) && (file.includes(".js") || file.includes(".jsx")))
          .map((component) => {
            return (
              <FileItem
                key={component}
                path={formatFileName(component)}
                active={"frontend/src/" + component == activeFile}
                onClick={() => {
                  setActiveFile("frontend/src/" + component);
                }}
                removeFromList={() => {
                  setFiles((prev) => {
                    return prev.filter((e) => e != component);
                  });
                  setFullFileList((prev) => {
                    return prev.filter((e) => e != component);
                  });
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
