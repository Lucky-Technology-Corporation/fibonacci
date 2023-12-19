import { faChevronDown, faChevronRight, faFile, faFolderClosed, faFolderOpen, faPuzzlePiece, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import Dropdown from "../../Utilities/Dropdown";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";
import FileItem from "./FileItem";
import FileWizard from "./FileWizard";

export default function FilesList({ active }: { active: boolean }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { getFiles, getFile, writeFile } = useEndpointApi();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [fileTree, setFileTree] = useState(null);
  const [expandedDirs, setExpandedDirs] = useState({});
  const [fileType, setFileType] = useState<string>("file");
  const [showServerFiles, setShowServerFiles] = useState<boolean>(false);
  const [fileToEdit, setFileToEdit] = useState<string>("");
  const [fileToEditFallback, setFileToEditFallback] = useState<string>("");

  const { testDomain, selectedTab, activeFile, setActiveFile, shouldRefreshList, setShouldRefreshList, setActivePage } = useContext(SwizzleContext);
  const restrictedFiles = ["App.tsx", "App.css", "index.ts", "index.css"];

  const methods: any = [
    { id: "page", name: "+ Page" },
    { id: "file", name: "+ Component" },
  ];

  useEffect(() => {
    getFiles("files")
      .then((data) => {
        if (data && data.children) {
          setFileTree(data);
        }
      })
      .catch((e) => {
        toast.error("Error fetching components");
        console.error(e);
      });
  }, [testDomain, shouldRefreshList]);

  useEffect(() => {
    //set the active file to the first page
    if(fileTree && selectedTab == Page.Hosting && activeFile == undefined){
      const pages = filterIfNeeded(fileTree.children.find(child => child.name === "pages").children)
      if(pages.length > 0){
        const page = pages[0]
        var pageRelativePath = page.path.includes("/pages") ? page.path.split("/pages/")[1] : page.path
        setActiveFile("frontend/src/pages/" + pageRelativePath)
      }
    }
  }, [selectedTab])

  const getFilePathArray = () => {
    if(!fileTree) return
    const filePaths = [];
    const extractPaths = (node, parentPath = '') => (node.isDir && node.children != undefined) ? node.children.forEach(child => extractPaths(child, `${parentPath}${node.name}/`)) : filePaths.push(`${parentPath}${node.name}`);
    fileTree.children.forEach(child => extractPaths(child, ''));
    return filePaths;
  }

  const [allDirsExpanded, setAllDirsExpanded] = useState(false);
  const expandAllDirs = (node, parentPath = '') => {
    let allDirs = {};
  
    const traverse = (node, currentPath) => {
      if (node.isDir) {
        allDirs[currentPath] = true;
        node.children.forEach((child) => {
          traverse(child, `${currentPath}${child.name}/`);
        });
      }
    };
  
    traverse(node, parentPath);
    setAllDirsExpanded(true)
    return allDirs;
  };
  const collapseAllDirs = () => {
    setAllDirsExpanded(false)
    setExpandedDirs({});
  };
  
  const toggleExpand = (path) => {
    setExpandedDirs((prev) => ({ ...prev, [path]: !prev[path] }));
    setAllDirsExpanded(false)
  };  

  useEffect(() => {
    if(searchFilter == ""){
      collapseAllDirs()
      return
    }
    else{
      if(!allDirsExpanded){
        const allDirs = expandAllDirs(fileTree);
        setExpandedDirs(allDirs);
      }
    }
  }, [searchFilter])

  const editFileHandler = (path: string, fallbackPath: string, type: string) => {
    setFileType(type)
    setFileToEditFallback(fallbackPath)
    var name = path.replace(".tsx", "").replace(".ts", "")
    if(type == "page"){
      name = name.toLowerCase()
    }
    setFileToEdit(name)
  }

  useEffect(() => {
    if(fileToEdit != ""){
      setIsVisible(true)
    }
  }, [fileToEdit])

  useEffect(() => {
    if(!isVisible){
      setTimeout(() => {
        setFileToEdit("")
      }, 200)
    }
  }, [isVisible])

  const renderFiles = (node, parentPath = '', searchActive = false) => {
    if (!node) return null;
    if (Array.isArray(node)) {
      return node.map((node, index) => 
        renderFiles(node, parentPath, searchActive)
      );
    }
  
    const fullPath = `${parentPath}${node.name}/`;

    let showCurrent = searchActive || !searchFilter || parentPath.toLowerCase().includes(searchFilter.toLowerCase()) || node.name.toLowerCase().includes(searchFilter.toLowerCase());

    if (node.isDir) {
      if (node.children == undefined || node.children.length === 0) return null; // Skip empty folders

      let childMatch = false;
      const children = node.children.map((child) => {
        const childElement = renderFiles(child, `${parentPath}${node.name}/`, showCurrent);
        childMatch = childMatch || !!childElement;
        return childElement;
      });
  
      if (!showCurrent && !childMatch) return null;
  
      return (
        <div key={node.path + node.name}>
          <div onClick={() => toggleExpand(fullPath)} className="flex my-1 py-2 px-2 hover:bg-[#85869833] rounded cursor-pointer">
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
        showCurrent &&
        !restrictedFiles.includes(node.name) &&
        (node.name.includes('.ts') || node.name.includes('.tsx'))
      ) {  
        return (
          <>
          <FileItem
            key={node.path + node.name +"-item"}
            path={node.name}
            fullPath={node.path}
            active={"frontend/src/" + (fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath) === activeFile}
            onClick={() => {
              if(node.path.includes("src/pages")){
                setActivePage(node.name)
              }
              setActiveFile("frontend/src/" + (fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath));
            }}
            removeFromList={() => {
              setTimeout(() => {
                setShouldRefreshList(!shouldRefreshList)
              }, 250)
            }}
            editFile={() => {editFileHandler(node.name, "", "file")}}
          />
          </>
        );
      } 
      return null
    }
  }
  const renderSection = (rootNode, folderName) => {
    const folderNode = rootNode.children.find(child => child.name === folderName && child.isDir);
    if (folderNode && folderNode.children) {
      return renderFiles(folderNode.children, folderName + "/", searchFilter != "");
    }
    return null;
  };

  const filterIfNeeded = (pages) => {
    if(searchFilter == ""){
      return pages
    }
    else{
      return pages.filter(page => page.path.toLowerCase().includes(searchFilter.toLowerCase()) || page.component.toLowerCase().includes(searchFilter.toLowerCase()))
    }
  }
  
  //Fetch from backend and populate it here.
  return (
    <div className={`flex-col w-full px-1 text-sm ${active ? "" : "hidden"}`}>

      <div className="ml-1 mr-1">
        <Dropdown
          className=""
          onSelect={(item: any) => {
            setFileType(item);
            setIsVisible(true);
          }}
          children={methods}
          direction="left"
          title={"+ New"}        
          selectorClass="w-full py-1.5 !mt-1.5 !mb-1"
        />
      </div>

      <div className="flex ml-2 my-1 mr-2 mb-1.5">
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

      <div className="font-semibold ml-2 mt-2 flex pt-2 pb-1 flex opacity-70 cursor-pointer" onClick={() => {setShowServerFiles(!showServerFiles)}}>
        <img src="/react.svg" className="w-3 h-3 my-auto mr-1" />
        <div className="flex items-center">Required Files</div>
        <div className="ml-2">
          {showServerFiles ? <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 my-auto" /> : <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 my-auto" />}
        </div>
      </div>

      <div className={`ml-1 ${showServerFiles ? "" : "hidden"}`}>
        <div className={searchFilter != "" ? ("index.html".includes(searchFilter.toLowerCase()) ? "" : "hidden") : ""}>
          <FileItem
            key={"index.html"}
            path={("index.html")}
            active={"frontend/public/index.html" == activeFile}
            onClick={() => {
              setActiveFile("frontend/public/index.html");
            }}
            disableDelete={true}
          />
        </div>
        <div className={searchFilter != "" ? ("app.css".includes(searchFilter.toLowerCase()) ? "" : "hidden") : ""}>
          <FileItem
            key={"App.css"}
            path={("App.css")}
            active={"frontend/src/App.css" == activeFile}
            onClick={() => {
              setActiveFile("frontend/src/App.css");
            }}
            disableDelete={true}
          />
        </div>
        <div className={searchFilter != "" ? ("app.tsx".includes(searchFilter.toLowerCase()) ? "" : "hidden") : ""}>
          <FileItem
            key={"App.tsx"}
            path={("App.tsx")}
            active={"frontend/src/App.tsx" == activeFile}
            onClick={() => {
              setActiveFile("frontend/src/App.tsx");
            }}
            disableDelete={true}
          />
        </div>
        <div className={searchFilter != "" ? ("tailwind.config.js".includes(searchFilter.toLowerCase()) ? "" : "hidden") : ""}>
          <FileItem
            key={"tailwind.config.js"}
            path={("tailwind.config.js")}
            active={"frontend/tailwind.config.js" == activeFile}
            onClick={() => {
              setActiveFile("frontend/tailwind.config.js");
            }}
            disableDelete={true}
          />
        </div>
      </div>

      <div className="pages-list">
        <div className="font-semibold ml-2 mt-2 flex pt-2 pb-1 flex opacity-70">
          <FontAwesomeIcon icon={faFile} className="w-3 h-3 my-auto mr-1" />
          <div className="flex items-center">Pages</div>
        </div>
        
        <div className="ml-1">
          {fileTree ? renderSection(fileTree, 'pages') : null}
        </div>
      </div>
      <div className="components-list">
        <div className="font-semibold ml-2 mt-2 flex pt-2 pb-1 opacity-70">
          <FontAwesomeIcon icon={faPuzzlePiece} className="w-3 h-3 my-auto mr-1" />
          <div className="flex items-center">Components</div>
        </div>
        <div className="ml-1">
          {fileTree ? renderSection(fileTree, 'components') : null}
        </div>
      </div>

      <FileWizard
        pathIfEditing={fileToEdit}
        fallbackPathIfEditing={fileToEditFallback}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        files={getFilePathArray()}
        fileType={fileType}
      />

    </div>
  );
}
