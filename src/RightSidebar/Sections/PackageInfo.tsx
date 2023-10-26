import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import useEndpointApi from "../../API/EndpointAPI";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import ToastWindow from "../../Utilities/Toast/ToastWindow";

export default function PackageInfo({ isVisible, setIsVisible, location }: { isVisible: boolean; setIsVisible: any, location: string }) {
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
    "uuid"
  ]
  const requiredReactPackages = ["react", "react-dom", "react-scripts"]

  const { npmSearch, getPackageJson } = useEndpointApi();

  const { setPostMessage, domain, packageToInstall } = useContext(SwizzleContext);

  useEffect(() => {
    if (domain == null || domain == undefined || domain == "") {
      return;
    }
    getPackageJson(location).then((data) => {
      if (data == undefined || data.dependencies == undefined) {
        return;
      }
      const dependencies = Object.keys(data.dependencies).map((key) => {
        return key;
      });
      setInstalledPackages(dependencies);
    });
  }, [domain]);

  const debounceTimer = useRef(null);

  useEffect(() => {
    if (query == "") {
      return;
    }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      npmSearch(query).then((data) => {
        setItems(
          data.map((item) => {
            return { label: item.package.name, value: item.package.name };
          }),
        );
      });
    }, 200);
  }, [query]);

  const handleInputChange = (inputValue) => {
    setQuery(inputValue);
  };

  useEffect(() => {
    setSelectedOption(null);
    setItems([]);
  }, [isVisible]);

  useEffect(() => {
    if (selectedOption == null) return;
    addPackageToProject(selectedOption.value);
    toast.success(`Added ${selectedOption.value} to project`);
  }, [selectedOption]);

  const addPackageToProject = (message) => {
    const messageBody = { type: "addPackage", packageName: message, directory: location };
    setPostMessage(messageBody);
    setInstalledPackages([...installedPackages, message]);
  };

  useEffect(() => {
    if(items.map(item => item.value).includes(packageToInstall)){
      toast.error(packageToInstall + " is already installed")
      return
    }
    if (packageToInstall != "") {
      addPackageToProject(packageToInstall);
    }
  }, [packageToInstall]);

  const removePackageFromProject = (message) => {
    const messageBody = { type: "removePackage", packageName: message, directory: location };
    setPostMessage(messageBody);
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
        placeholder="Search NPM..."
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
    <ToastWindow
      isHintWindowVisible={isVisible}
      showHintWindowIfOpen={() => setIsVisible(true)}
      hideHintWindow={() => {}}
      title={""}
      titleClass="text-md font-bold"
      isLarge={false}
      overrideLeftMargin={-180}
      overrideTopMargin={-4}
      content={
        //table of packages
        <div className="overflow-scroll max-h-[70vh]">
          <div className="flex mb-2 space-between">
            <div className="font-bold text-lg">Packages</div>
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
                      <td>{packageName}</td>
                      <td className={`opacity-70 hover:opacity-100 cursor-pointer ${checkIfRequired(packageName) ? "hidden" : ""}`}>
                        <FontAwesomeIcon
                          className="ml-auto"
                          icon={faTrash}
                          onClick={() => {
                            removePackageFromProject(packageName);
                            toast.success(`Removed ${packageName} from project`);
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
  );
}
