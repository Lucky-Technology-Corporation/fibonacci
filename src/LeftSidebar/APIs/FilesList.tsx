import { faFolderClosed, faFolderOpen, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
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
  const [fileTree, setFileTree] = useState(null);
  const [expandedDirs, setExpandedDirs] = useState({});

  const { testDomain, activeFile, setActiveFile, shouldRefreshList } = useContext(SwizzleContext);
  const restrictedFiles = ["App.js", "App.css", "index.js", "index.css"];

  useEffect(() => {
    getFiles("files")
      .then((data) => {
        if (data && data.children) {
          setFileTree(data);
        }
      })
      .catch((e) => {
        toast.error("Error fetching endpoints");
        console.error(e);
      });
  }, [testDomain, shouldRefreshList]);

  // //Used to filter the endopint list
  // useEffect(() => {
  //   if (searchFilter == "") {
  //     setFiles(fullFileList);
  //     return;
  //   }
  //   const filteredEndpoints = files.filter((file) => {
  //     return file.includes(searchFilter);
  //   });
  //   setFiles(filteredEndpoints);
  // }, [searchFilter]);

  const formatFileName = (file: string) => {
    return file;
  };

  const getFilePathArray = () => {
    if(!fileTree) return
    const filePaths = [];
    const extractPaths = (node, parentPath = '') => node.isDir ? node.children.forEach(child => extractPaths(child, `${parentPath}${node.name}/`)) : filePaths.push(`${parentPath}${node.name}`);
    fileTree.children.forEach(child => extractPaths(child, ''));
    return filePaths;
  }

  const toggleExpand = (path) => {
    setExpandedDirs((prev) => ({ ...prev, [path]: !prev[path] }));
  };  

  const renderFiles = (node, parentPath = '') => {
    if (!node) return null;
  
    const fullPath = `${parentPath}${node.name}/`;
  
    if (node.isDir) {
      return (
        <div key={node.path}>
          <div onClick={() => toggleExpand(fullPath)} className="font-bold mx-2 flex my-2 cursor-pointer">
            {expandedDirs[fullPath] ? <FontAwesomeIcon icon={faFolderOpen} className="w-3 h-3 my-auto" /> : <FontAwesomeIcon icon={faFolderClosed} className="w-3 h-3 my-auto" />} 
            <div className="ml-2">{node.name}</div>
          </div>
          {expandedDirs[fullPath] && (
            <div className="ml-4">
              {node.children.map((child) => renderFiles(child, fullPath))}
            </div>
          )}
        </div>
      );
    } else {
      if (
        !restrictedFiles.includes(node.name) &&
        (node.name.includes('.js') || node.name.includes('.jsx'))
      ) {  
        return (
          <FileItem
            key={node.path}
            path={formatFileName(node.name)}
            active={"frontend/src/" + (fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath) === activeFile}
            onClick={() => {
              console.log(fullPath)
              setActiveFile("frontend/src/" + (fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath));
            }}
            removeFromList={() => {
              // Remove logic here
            }}
          />
        );
      } 
      return null
    }
  }

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
        {fileTree ? fileTree.children.map((child) => renderFiles(child, '')) : null}
      </div>

      <FileWizard
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        files={getFilePathArray()}
      />
    </div>
  );
}
