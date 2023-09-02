import { useContext, useEffect, useState } from "react";
import SectionAction from "../../LeftSidebar/SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import Select from "react-select";
import useApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function PackageInfo({ isVisible, setIsVisible }: { isVisible: boolean, setIsVisible: any }) {

  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [installedPackages, setInstalledPackages] = useState<string[]>([]); 
  const [selectedOption, setSelectedOption] = useState(null);

  const { npmSearch, getPackageJson } = useApi();

  const { setPostMessage } = useContext(SwizzleContext);

  useEffect(() => {
    getPackageJson().then((data) => {
      if (data == undefined || data.dependencies == undefined) {
        return;
      }
      const dependencies = Object.keys(data.dependencies).map((key) => {
        return key
      });
      setInstalledPackages(dependencies);
    })
  }, []);

  useEffect(() => {
    if (query == "") { return }
    npmSearch(query).then((data) => {
      setItems(
        data.map((item) => {
          return { label: item.package.name, value: item.package.name };
        }),
      );
    });
  }, [query]);

  const handleInputChange = (inputValue) => {
    setQuery(inputValue);
  };

  const addPackageToProject = (message) => {
    const messageBody = {type: "addPackage", packageName: message};
    setPostMessage(messageBody)
    setInstalledPackages([...installedPackages, message]);
  }

  

  return (
        <FullPageModal
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          modalDetails={{
            title: "📦 Add Package",
            shouldAllowOverflow: true,
            description: (
              <div className="flex flex-col items-center justify-center mt-2">
                <div className="w-full">
                  <div className="text-gray-300 mb-2">Search NPM</div>
                  <Select
                    value={selectedOption}
                    onChange={setSelectedOption}
                    onInputChange={handleInputChange}
                    options={items}
                    placeholder="Search..."
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
                        backgroundColor: state.isSelected
                          ? "#525363"
                          : state.isFocused
                          ? "#525363"
                          : "#32333b",
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
                </div>
              </div>
            ),
            confirmText: "Add Package",
            confirmHandler: () => addPackageToProject(selectedOption.value),
            shouldShowInput: false,
            placeholder: "", //unused since shouldShowInput is false
          }}
        />
  );
}
