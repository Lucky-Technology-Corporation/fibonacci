import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import useDeploymentApi from "../../API/DeploymentAPI";
import useEndpointApi from "../../API/EndpointAPI";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import TailwindModal from "../../Utilities/TailwindModal";
import ToastWindow from "../../Utilities/Toast/ToastWindow";

export default function PackageInfo({ isVisible, setIsVisible, location }: { isVisible: boolean; setIsVisible: any, location: string }) {
  const [open, setOpen] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [installedPackages, setInstalledPackages] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const requiredNodePackages = [
    "@google-cloud/storage",
    "apn",
    "async_hooks",
    "concurrently",
    "cors",
    "dotenv",
    "express",
    "express-session",
    "jsonwebtoken",
    "mongodb",
    "passport",
    "passport-anonymous",
    "passport-jwt",
    "swizzle-js",
    "uuid",
    "axios",
    "typescript",
    "@types/node",
    "@types/react",
    "@types/react-dom"
  ]
  const requiredReactPackages = ["react", "react-dom", "react-scripts", "axios", "typescript", "react-router-dom", "react-auth-kit"]

  const { npmSearch, getPackageJson, restartFrontend, restartBackend } = useEndpointApi();
  const { updatePackage } = useDeploymentApi()

  const { setPostMessage, domain, shouldRefreshList } = useContext(SwizzleContext);

  useEffect(() => {
    console.log("refreshing package list")
    if (domain == null || domain == undefined || domain == "") {
      return;
    }
    if(!isVisible){ return }
    getPackageJson(location).then((data) => {
      if (data == undefined || data.dependencies == undefined) {
        return;
      }
      const dependencies = Object.keys(data.dependencies).map((key) => {
        return key;
      });
      setInstalledPackages(dependencies);
    });
  }, [domain, shouldRefreshList, isVisible]);

  const debounceTimer = useRef(null);

  useEffect(() => {
    if (query == "") {
      return;
    }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      npmSearch(query).then((data) => {
        var items = data.map((item) => {
          return { label: item.package.name, value: item.package.name };
        })
        const manualInstall = { label: "Manual: 'npm install " + query + "'", value: query }
        items = [manualInstall, ...items]
        setItems(items);
      });
    }, 200);
  }, [query]);

  const handleInputChange = (inputValue) => {
    if(inputValue == ""){
      setItems([])
      setSelectedOption(null)
    }
    setQuery(inputValue);
  };

  useEffect(() => {
    setSelectedOption(null);
    setItems([]);
  }, [isVisible]);

  useEffect(() => {
    if (selectedOption == null) return;
    toast.promise(addPackageToProject(selectedOption.value, location), {
      loading: "Installing " + selectedOption.value,
      success: "Installed " + selectedOption.value,
      error: "Failed to install " + selectedOption.value,
    });
  }, [selectedOption]);

  const addPackageToProject = async (message, folder) => {
    if (installedPackages.includes(message)) {
      toast.error(message + " is already installed");
      return;
    }
    const response = await updatePackage([message], "install", folder);
    if(response == null){ 
      setSavedMessage(message)
      setOpen(true)
      return
    } else{
      if(location == "frontend"){
        restartFrontend()
      } else {
        restartBackend()
      }
    }
    setInstalledPackages([...installedPackages, message]);
  };

  const forceAddPackageToProject = async () => {
    const response = await updatePackage([savedMessage], "install", location as any, "--legacy-peer-deps");
    if(response.length == 0){ 
      toast.error("Failed to install " + savedMessage + ". If this package is needed, please email us at team@swizzle.co")
      return
    }
    setInstalledPackages([...installedPackages, savedMessage]);
  }

  const removePackageFromProject = async (message) => {
    await updatePackage([message], "remove", location as "frontend" | "backend");
    if(location == "frontend"){
      restartFrontend()
    } else {
      restartBackend()
    }
    setInstalledPackages(installedPackages.filter((item) => item !== message));
  };

  const checkIfRequired = (packageName) => {
    if(location =="backend"){
      return requiredNodePackages.includes(packageName);
    } else {
      return requiredReactPackages.includes(packageName);
    }
  }

  const selectRef = useRef()

  const renderSearchField = () => {
    return (
      <Select
        ref={selectRef}
        value={selectedOption}
        onChange={setSelectedOption}
        onInputChange={handleInputChange}
        options={items}
        placeholder="Add NPM Package..."
        styles={{
          input: (provided, state) => ({
            ...provided,
            backgroundColor: "#32333b",
            borderColor: "#525363",
            boxShadow: "none",
            color: "#D9D9D9",
            fontSize: "0.875rem",
            zIndex: 999999999,
            background: "transparent",
          }),
          control: (provided, state) => ({
            ...provided,
            backgroundColor: "#32333b",
            borderColor: "#525363",
            boxShadow: "none",
            color: "#D9D9D9",
            fontSize: "0.875rem",
            "&:hover": {
              borderColor: "#525363",
            },
          }),
          indicatorSeparator: (provided, state) => ({
            ...provided,
            display: "none",
          }),
          menu: (provided, state) => ({
            ...provided,
            backgroundColor: "#32333b",
            color: "#D9D9D9",
            fontSize: "0.875rem",
            zIndex: 1000,
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#525363" : state.isFocused ? "#525363" : "#32333b",
            color: "#D9D9D9",
            fontSize: "0.875rem",
            zIndex: 1000,
            ":active": {
              ...provided[":active"],
              backgroundColor: "#525363",
            },
          }),
          singleValue: (provided, state) => ({
            ...provided,
            color: "#D9D9D9",
            fontSize: "0.875rem",
            zIndex: 1000,
          }),
          placeholder: (provided, state) => ({
            ...provided,
            color: "#D9D9D9",
            fontSize: "0.875rem",
            zIndex: 1000,
          }),
        }}
      />
    );
  };

  return (
    <>
    <ToastWindow
      isHintWindowVisible={isVisible}
      showHintWindowIfOpen={() => setIsVisible(true)}
      hideHintWindow={() => {}}
      title={""}
      titleClass="text-md font-bold"
      isLarge={false}
      overrideLeftMargin={-200}
      overrideTopMargin={-4}
      content={
        //table of packages
        <div className="overflow-scroll max-h-[70vh]">
          <div className="flex mb-2 space-between">
            <div className="font-bold text-lg">{location == "frontend" ? "React" : "Node"} Packages</div>
            <Button
              text="Close"
              onClick={() => {
                setIsVisible(false);
              }}
              className="px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border ml-auto"
            />
          </div>
          <div onClick={() => (selectRef.current as any)?.focus()}>{renderSearchField()}</div>
          <div className="flex flex-col items-center justify-center mt-3">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Current Packages</th>
                  <th className="text-left"></th>
                </tr>
              </thead>
              <tbody>
                {installedPackages.map((packageName) => {
                  return (
                    <tr key={packageName}>
                      <td className={checkIfRequired(packageName) ? "opacity-70" : ""}>{packageName}</td>
                      <td className={`opacity-70 hover:opacity-100 cursor-pointer flex ${checkIfRequired(packageName) ? "opacity-30 hover:opacity-50" : ""}`}>
                        <FontAwesomeIcon
                          className="ml-auto mr-0"
                          icon={faTrash}
                          onClick={() => {
                            if(checkIfRequired(packageName)){
                              toast.error(packageName + " is required for this project and cannot be removed")
                              return
                            }
                            toast.promise(removePackageFromProject(packageName), {
                              loading: "Removing " + packageName,
                              success: "Removed " + packageName,
                              error: "Failed to remove " + packageName,
                            });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      }
      position={"bottom-left"}
    />
      <TailwindModal
        title="Dependency Warning"
        subtitle="There is a dependency issue with this package. If you proceed, it may cause issues with your project. It's recommended to find a different package, but you can continue anyway if you need to."
        confirmButtonText="Continue Anyway"
        confirmButtonAction={() => { forceAddPackageToProject() }}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}
