import { useContext, useEffect, useState } from "react";
import SectionAction from "../../LeftSidebar/SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import Select from "react-select";
import useApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import ToastWindow from "../../Utilities/Toast/ToastWindow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import Button from "../../Utilities/Button";

export default function PackageInfo({ isVisible, setIsVisible }: { isVisible: boolean; setIsVisible: any }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [installedPackages, setInstalledPackages] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const { npmSearch, getPackageJson } = useApi();

  const { setPostMessage, domain } = useContext(SwizzleContext);

  useEffect(() => {
    if (domain == null || domain == undefined || domain == "") {
      return;
    }
    getPackageJson().then((data) => {
      if (data == undefined || data.dependencies == undefined) {
        return;
      }
      const dependencies = Object.keys(data.dependencies).map((key) => {
        return key;
      });
      setInstalledPackages(dependencies);
    });
  }, [domain]);

  let debounceTimer;

  useEffect(() => {
    if (query == "") {
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      npmSearch(query).then((data) => {
        setItems(
          data.map((item) => {
            return { label: item.package.name, value: item.package.name };
          }),
        );
      });
    }, 250);
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
    const messageBody = { type: "addPackage", packageName: message };
    setPostMessage(messageBody);
    setInstalledPackages([...installedPackages, message]);
  };

  const removePackageFromProject = (message) => {
    const messageBody = { type: "removePackage", packageName: message };
    setPostMessage(messageBody);
    setInstalledPackages(installedPackages.filter((item) => item !== message));
  };


  const renderSearchField = () => {
    return (
      <Select
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
          {renderSearchField()}
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
                      <td className="opacity-70 hover:opacity-100 cursor-pointer">
                        <FontAwesomeIcon
                          className="ml-auto"
                          icon={faTrash}
                          onClick={() => {
                            removePackageFromProject(packageName)
                            toast.success(`Removed ${selectedOption.value} from project`);
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
