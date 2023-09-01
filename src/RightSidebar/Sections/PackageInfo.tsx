import { useContext, useEffect, useState } from "react";
import SectionAction from "../../LeftSidebar/SectionAction";
import FullPageModal from "../../Utilities/FullPageModal";
import Select from "react-select";
import useApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function PackageInfo({ show }: { show: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const { npmSearch } = useApi();

  const { setPostMessage } = useContext(SwizzleContext);

  useEffect(() => {
    npmSearch(query).then((data) => {
      setItems(
        data.map((item) => {
          return { label: item.package.name, value: item.package.name };
        }),
      );
      console.log(items);
    });
  }, [query]);

  const handleInputChange = (inputValue) => {
    setQuery(inputValue);
  };

  const postCommandToIframe = (message) => {
    const messageBody = {type: "addPackage", packageName: message};
    setPostMessage(messageBody)
  }

  return (
    <>
      <div
        className={`flex-col items-center justify-between ${
          show ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
        }`}
        style={{ transition: "opacity 0.3s" }}
      >
        <div className="h-1"></div>
        <SectionAction
          text="+ Add Package"
          onClick={() => {
            setIsVisible(true);
          }}
        />
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
            confirmHandler: () => postCommandToIframe(selectedOption.value),
            shouldShowInput: false,
            placeholder: "", //unused since shouldShowInput is false
          }}
        />
      </div>
    </>
  );
}
