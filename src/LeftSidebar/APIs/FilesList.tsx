import {
  faChevronDown,
  faChevronRight,
  faCloudArrowUp,
  faFile,
  faFolderClosed,
  faFolderOpen,
  faGlobe,
  faPuzzlePiece
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import useEndpointApi from "../../API/EndpointAPI";
import PackageInfo from "../../RightSidebar/Sections/PackageInfo";
import SecretInfo from "../../RightSidebar/Sections/SecretInfo";
import Button from "../../Utilities/Button";
import Dropdown from "../../Utilities/Dropdown";
import { formatPath } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import IconTextButton from "../../Utilities/IconTextButton";
import { Page } from "../../Utilities/Page";
import FileItem from "./FileItem";
import FileWizard from "./FileWizard";

export default function FilesList({ active }: { active: boolean }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { getFiles, getFile, writeFile, restartFrontend, uploadFile } = useEndpointApi();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [fileTree, setFileTree] = useState(null);
  const [publicAssets, setPublicAssets] = useState(null);
  const [expandedDirs, setExpandedDirs] = useState({});
  const [fileType, setFileType] = useState<string>("file");
  const [showServerFiles, setShowServerFiles] = useState<boolean>(false);
  const [fileToEdit, setFileToEdit] = useState<string>("");
  const [fileToEditFallback, setFileToEditFallback] = useState<string>("");
  const [pageInformation, setPageInformation] = useState(undefined);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [shouldShowPackagesWindow, setShouldShowPackagesWindow] = useState<boolean>(false);
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [folderPath, setFolderPath] = useState<string>("");
  const [shouldShowSecretsWindow, setShouldShowSecretsWindow] = useState<boolean>(false);
  const [showState, setShowState] = useState<boolean>(false);
  const [showAssets, setShowAssets] = useState<boolean>(false);

  const {
    testDomain,
    selectedTab,
    activeFile,
    setActiveFile,
    shouldRefreshList,
    setShouldRefreshList,
    setActivePage,
    setPostMessage,
    shouldSetToFirstEntry,
  } = useContext(SwizzleContext);
  const restrictedFiles = ["App.tsx", "App.css", "index.ts", "index.css"];

  const methods: any = [
    { id: "page", name: "+ Page" },
    { id: "file", name: "+ Component" },
  ];

  const requiredFiles = ["index.html", "manifest.json", "output.css", "robots.txt", "swizzle-debug.js"]

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
    
    getFiles("public")
      .then((data) => {
        if (data && data.children) {
          console.log("publicAssets", data)
          setPublicAssets(data);
        }
      })
      .catch((e) => {
        toast.error("Error fetching components");
        console.error(e);
      });

    getFile("frontend/src/RouteList.tsx")
      .then((data) => {
        var pageInformationLocal = {};
        if (data.includes("\n")) {
          var lines = data.split("\n");
          for (var line of lines) {
            if (line.includes("import ") && line.includes("./pages/")) {
              const componentName = line.split("import ")[1].split(" from")[0];
              const fullPath =
                "/home/swizzle/code/frontend/src/pages/" + line.split("./pages/")[1].split("'")[0] + ".tsx";

              var isPageProtected = false;
              var fallbackUrl = undefined;
              var realPath = "/";

              lines.forEach((line, index) => {
                if (line.includes(`<${componentName} />`)) {
                  if (line.includes("<SwizzlePrivateRoute")) {
                    isPageProtected = true;
                    fallbackUrl = line.split('unauthenticatedFallback="')[1].split('"')[0];
                  }
                  realPath = line.split('path="')[1].split('"')[0];
                }
              });

              pageInformationLocal[fullPath] = {
                component: componentName,
                requiresAuth: isPageProtected,
                fallbackUrl: fallbackUrl,
                realPath: realPath,
              };
            }
          }
          setPageInformation(pageInformationLocal);
        }
      })
      .catch((e) => {
        toast.error("Error fetching pages");
        console.error(e);
      });

  }, [testDomain, shouldRefreshList]);

  useEffect(() => {
    if(selectedTab == Page.Hosting){
      setToFirstPage()
    }
  }, [shouldSetToFirstEntry]);

  useEffect(() => {
    //set the active file to the first page
    if (fileTree && selectedTab == Page.Hosting && activeFile == undefined) {
      setToFirstPage();
    }
  }, [selectedTab]);

  const setToFirstPage = () => {
    console.log("Set to first page")
    const pages = filterIfNeeded(fileTree.children.find((child) => child.name === "pages").children);
    if (pages.length > 0) {
      const page = pages[0];
      var pageRelativePath = page.path.includes("/pages") ? page.path.split("/pages/")[1] : page.path;
      setActiveFile("frontend/src/pages/" + pageRelativePath);
      setActivePage(formatPath(page.path, page.name, true)); //TODO: check if this works for dashes
    }
  };

  const getFilePathArray = () => {
    if (!fileTree) return;
    const filePaths = [];
    const extractPaths = (node, parentPath = "") =>
      node.isDir && node.children != undefined
        ? node.children.forEach((child) => extractPaths(child, `${parentPath}${node.name}/`))
        : filePaths.push(`${parentPath}${node.name}`);
    fileTree.children.forEach((child) => extractPaths(child, ""));
    return filePaths;
  };

  const [allDirsExpanded, setAllDirsExpanded] = useState(false);
  const expandAllDirs = (node, parentPath = "") => {
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
    setAllDirsExpanded(true);
    return allDirs;
  };
  const collapseAllDirs = () => {
    setAllDirsExpanded(false);
    setExpandedDirs({});
  };

  const toggleExpand = (path) => {
    setExpandedDirs((prev) => ({ ...prev, [path]: !prev[path] }));
    setAllDirsExpanded(false);
  };

  useEffect(() => {
    if (searchFilter == "") {
      collapseAllDirs();
      return;
    } else {
      if (!allDirsExpanded) {
        const allDirs = expandAllDirs(fileTree);
        setExpandedDirs(allDirs);
      }
    }
  }, [searchFilter]);

  const editFileHandler = (path: string, fullPath: string, fallbackPath: string) => {
    const type = fullPath.includes("/src/pages") ? "page" : "file";
    setFileType(type);
    setFileToEditFallback(fallbackPath);
    setPostMessage({ type: "saveFile" });
    if (type == "page") {
      setFileToEdit(path);
    } else {
      setFileToEdit(path);
    }
  };

  useEffect(() => {
    if (fileToEdit != "") {
      setIsVisible(true);
    }
  }, [fileToEdit]);

  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => {
        setFileToEdit("");
      }, 200);
    }
  }, [isVisible]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    //upload file
    await uploadFile(file);
    setShouldRefreshList(p => !p)
  };


  const renderFiles = (node, parentPath = "", searchActive = false) => {
    if (!node) return null;
    if (Array.isArray(node)) {
      return node.map((node, index) => renderFiles(node, parentPath, searchActive));
    }

    const fullPath = `${parentPath}${node.name}/`;

    let showCurrent =
      searchActive ||
      !searchFilter ||
      parentPath.toLowerCase().includes(searchFilter.toLowerCase()) ||
      node.name.toLowerCase().includes(searchFilter.toLowerCase());

    const hasValidChildren = (node) => {
      if (!node.isDir || !node.children || node.children.length === 0) {
        return false; // Not a directory or no children
      }
      // Check if any child is a non-empty directory or a file
      return node.children.some((child) => !child.isDir || hasValidChildren(child));
    };

    if (node.isDir) {
      if (!hasValidChildren(node)) return null;

      let childMatch = false;
      const children = node.children.map((child) => {
        const childElement = renderFiles(child, `${parentPath}${node.name}/`, showCurrent);
        childMatch = childMatch || !!childElement;
        return childElement;
      });

      if (!showCurrent && !childMatch) return null;

      return (
        <div key={node.path + node.name} id={node.path + node.name}>
          <div
            onClick={() => toggleExpand(fullPath)}
            className="flex my-1 py-1.5 px-2 hover:bg-[#85869833] rounded cursor-pointer"
          >
            {expandedDirs[fullPath] ? (
              <FontAwesomeIcon icon={faFolderOpen} className="w-3 h-3 my-auto" />
            ) : (
              <FontAwesomeIcon icon={faFolderClosed} className="w-3 h-3 my-auto" />
            )}
            <div className="ml-2 font-mono text-xs">{node.name.replace("(", ":").replace(")", "")}</div>
          </div>
          {expandedDirs[fullPath] && (
            <div className="ml-4">{node.children.map((child) => renderFiles(child, fullPath))}</div>
          )}
        </div>
      );
    } else {
      if (
        showCurrent &&
        !restrictedFiles.includes(node.name) &&
        (node.name.includes(".ts") || node.name.includes(".tsx"))
      ) {
        return (
          <FileItem
            key={node.path + node.name + "-item"}
            path={node.name}
            fullPath={node.path}
            pagePath={
              pageInformation && pageInformation[node.path]
                ? "/" + /[^/]*$/.exec(pageInformation[node.path].realPath)[0]
                : undefined
            } //get the last part of the path
            isPrivate={pageInformation && pageInformation[node.path] ? pageInformation[node.path].requiresAuth : false}
            fallbackUrl={
              pageInformation && pageInformation[node.path] ? pageInformation[node.path].fallbackUrl : undefined
            }
            active={"frontend/src/" + (fullPath.endsWith("/") ? fullPath.slice(0, -1) : fullPath) === activeFile}
            onClick={() => {
              if (node.path.includes("src/pages")) {
                const newActivePage = pageInformation && pageInformation[node.path]
                ? "/" + /[^/]*$/.exec(pageInformation[node.path].realPath)[0]
                : undefined
                setActivePage(newActivePage);
              }
              setActiveFile("frontend/src/" + (fullPath.endsWith("/") ? fullPath.slice(0, -1) : fullPath));
            }}
            removeFromList={() => {
              setTimeout(() => {
                setShouldRefreshList(!shouldRefreshList);
              }, 250);
            }}
            editFile={() => {
              editFileHandler(
                pageInformation && pageInformation[node.path] ? pageInformation[node.path].realPath : node.name,
                node.path,
                pageInformation && pageInformation[node.path] ? pageInformation[node.path].fallbackUrl : "",
              );
            }}
          />
        );
      }
      return null;
    }
  };
  const renderSection = (rootNode, folderName) => {
    const folderNode = rootNode.children.find((child) => child.name === folderName && child.isDir);
    if (folderNode && folderNode.children) {
      return renderFiles(folderNode.children, folderName + "/", searchFilter != "");
    }
    return null;
  };

  const filterIfNeeded = (pages) => {
    if (searchFilter == "") {
      return pages;
    } else {
      return pages.filter(
        (page) =>
          page.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
          page.component.toLowerCase().includes(searchFilter.toLowerCase()),
      );
    }
  };

  const fileInputRef = useRef(null);

  //Fetch from backend and populate it here.
  return (
    <div className={`flex-col w-full px-1 text-sm ${active ? "" : "hidden"}`}>
          <div className="ml-1 mr-1 flex">
            <Dropdown
              className=""
              onSelect={(item: any) => {
                setFileType(item);
                setIsVisible(true);
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
              <div className="w-10 ml-2 mt-3">
                <IconTextButton
                  textHidden={true}
                  onClick={() => {
                    setShouldShowPackagesWindow(true);
                  }}
                  icon={<img src="/box.svg" className="w-4 h-4 m-auto" />}
                  className="p-[0.57rem]"
                  text="Packages"
                />
              </div>
            </div>
          </div>
          <PackageInfo
            isVisible={shouldShowPackagesWindow}
            setIsVisible={setShouldShowPackagesWindow}
            location="frontend"
          />
          <SecretInfo isVisible={shouldShowSecretsWindow} setIsVisible={setShouldShowSecretsWindow} location="frontend" />

          {/* <div className="flex ml-2 my-1 mr-2 mb-3">
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
          </div> */}


          <div className="pages-list">
            <Tooltip
              id="page-tab-tooltip"
              className={`fixed z-50`}
              style={{ backgroundColor: "rgb(209 213 219)", color: "#000" }}
            />
            <a
              className="w-full"
              data-tooltip-id="page-tab-tooltip"
              data-tooltip-content={"Pages accessed by via URL"}
              data-tooltip-place="right"
            >
              <div className="font-semibold ml-2 mt-1 flex pt-2 pb-1 flex text-gray-400 hover:text-gray-300">
                <FontAwesomeIcon icon={faFile} className="w-3 h-3 my-auto mr-1" />
                <div className="flex items-center">Pages</div>
              </div>
            </a>

            <div className="ml-1">{fileTree ? renderSection(fileTree, "pages") : null}</div>
          </div>
          <div className="components-list">
            <Tooltip
              id="component-tab-tooltip"
              className={`fixed z-50`}
              style={{ backgroundColor: "rgb(209 213 219)", color: "#000" }}
            />
            <a
              className="w-full"
              data-tooltip-id="component-tab-tooltip"
              data-tooltip-content={"Components you can reuse in pages or other components"}
              data-tooltip-place="right"
            >
              <div className="font-semibold ml-2 mt-2 flex pt-2 pb-1 text-gray-400 hover:text-gray-300">
                <FontAwesomeIcon icon={faPuzzlePiece} className="w-3 h-3 my-auto mr-1" />
                <div className="flex items-center">Components</div>
              </div>
            </a>
            <div className="ml-1">{fileTree ? renderSection(fileTree, "components") : null}</div>
          </div>


          <Tooltip
            id="required-tab-tooltip"
            className={`fixed z-50`}
            style={{ backgroundColor: "rgb(209 213 219)", color: "#000" }}
          />
          <a
            className="w-full"
            data-tooltip-id="required-tab-tooltip"
            data-tooltip-content={"Standard files and entry-points"}
            data-tooltip-place="right"
          >
            <div
              className="font-semibold ml-2 mt-0 flex pt-2 pb-1 flex text-gray-400 hover:text-gray-300 cursor-pointer"
              onClick={() => {
                setShowServerFiles(!showServerFiles);
              }}
            >
              <img src="/react.svg" className="w-3 h-3 my-auto mr-1" />
              <div className="flex items-center">Required Files</div>
              <div className="ml-2">
                {showServerFiles ? (
                  <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 my-auto" />
                ) : (
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 my-auto" />
                )}
              </div>
            </div>
          </a>

          <div className={`ml-1 ${showServerFiles ? "" : "hidden"}`}>
            <div
              className={searchFilter != "" ? ("index.html".includes(searchFilter.toLowerCase()) ? "" : "hidden") : ""}
            >
              <FileItem
                key={"index.html"}
                path={"index.html"}
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
                path={"App.css"}
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
                path={"App.tsx"}
                active={"frontend/src/App.tsx" == activeFile}
                onClick={() => {
                  setActiveFile("frontend/src/App.tsx");
                }}
                disableDelete={true}
              />
            </div>
            <div
              className={
                searchFilter != "" ? ("manifest.json".includes(searchFilter.toLowerCase()) ? "" : "hidden") : ""
              }
            >
              <FileItem
                key={"manifest.json"}
                path={"manifest.json"}
                active={"frontend/public/manifest.json" == activeFile}
                onClick={() => {
                  setActiveFile("frontend/public/manifest.json");
                }}
                disableDelete={true}
              />
            </div>
            <div
              className={
                searchFilter != "" ? ("tailwind.config.js".includes(searchFilter.toLowerCase()) ? "" : "hidden") : ""
              }
            >
              <FileItem
                key={"tailwind.config.js"}
                path={"tailwind.config.js"}
                active={"frontend/tailwind.config.js" == activeFile}
                onClick={() => {
                  setActiveFile("frontend/tailwind.config.js");
                }}
                disableDelete={true}
              />
            </div>
          </div>

          <div className="state-list">
            <Tooltip
              id="state-tab-tooltip"
              className={`fixed z-50`}
              style={{ backgroundColor: "rgb(209 213 219)", color: "#000" }}
            />
            <a
              className="w-full"
              data-tooltip-id="state-tab-tooltip"
              data-tooltip-content={"State variables accessible anywhere in your app"}
              data-tooltip-place="right"
            >
              <div className="font-semibold ml-2 mt-2 flex pt-2 pb-1 flex text-gray-400 hover:text-gray-300 cursor-pointer" onClick={() => {
                setShowState(!showState);
              }}>
                <FontAwesomeIcon icon={faGlobe} className="w-3 h-3 my-auto mr-1" />
                <div className="flex items-center">Global State</div>
                <div className="ml-2">
                {showState ? (
                  <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 my-auto" />
                ) : (
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 my-auto" />
                )}
              </div>
              </div>
            </a>
            <div className={`ml-1 ${showState ? "" : "hidden"}`}>
              <FileItem
                key={"AppContext.tsx"}
                path={"Context.tsx"}
                active={"frontend/src/AppContext.tsx" == activeFile}
                onClick={() => {
                  setActiveFile("frontend/src/AppContext.tsx");
                }}
                disableDelete={true}
              />
            </div>
          </div>

          <div className="asset-list">
            <Tooltip
              id="asset-tab-tooltip"
              className={`fixed z-50`}
              style={{ backgroundColor: "rgb(209 213 219)", color: "#000" }}
            />
            <a
              className="w-full"
              data-tooltip-id="asset-tab-tooltip"
              data-tooltip-content={"State variables accessible anywhere in your app"}
              data-tooltip-place="right"
            >
              <div className="font-semibold ml-2 mt-2 flex pt-2 pb-1 flex text-gray-400 hover:text-gray-300 cursor-pointer" onClick={() => {
                setShowAssets(!showAssets);
              }}>
                <FontAwesomeIcon icon={faCloudArrowUp} className="w-3 h-3 my-auto mr-1" />
                <div className="flex items-center">Assets</div>
                <div className="ml-2">
                {showAssets ? (
                  <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 my-auto" />
                ) : (
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 my-auto" />
                )}
              </div>
              </div>
            </a>
            <div className={`${showAssets ? "" : "hidden"}`}>
              <Button
                text="Upload"
                onClick={() => {
                  fileInputRef.current.click()
                }}
                className="mx-2 mt-1 text-sm px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
              />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: "none"}} />
              <div className="ml-1">{publicAssets ? ( 
                publicAssets.children.filter(c => !requiredFiles.includes(c.name)).map((child) => {
                  return <FileItem
                    key={child.path}
                    fullPath={child.path}
                    path={"/"+child.name}
                    active={false}
                    onClick={() => {
                      console.log("open the file")
                    }}
                    disableDelete={false}
                  />
                })
              ) : <div>{JSON.stringify(publicAssets)}</div>}</div>
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
