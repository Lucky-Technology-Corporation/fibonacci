import { useEffect, useState } from "react";
import Button from "../../../Utilities/Button";
import Dropdown from "../../../Utilities/Dropdown";

export default function NewFieldModal({
  addFieldHandler,
  addVisible,
  setAddVisible,
  collectionName,
  keyPath,
}: {
  addFieldHandler: any;
  addVisible: boolean;
  setAddVisible: any;
  collectionName: string;
  keyPath: string[];
}) {
  const [selectedType, setSelectedType] = useState<string>("string");
  const [selectedSubtype, setSelectedSubtype] = useState<string>("string");
  const [fieldName, setFieldName] = useState<string>("");

  const primitives = [
    { id: "string", name: "string" },
    { id: "number", name: "number" },
    { id: "boolean", name: "boolean" },
    { id: "object", name: "object" },
    { id: "date", name: "date" },
  ];

  const handleAddProcess = () => {
    var newSchemaField = {};
    if (selectedType == "array") {
      newSchemaField[fieldName] = selectedSubtype + "[]";
    } else {
      newSchemaField[fieldName] = selectedType;
    }
    addFieldHandler(collectionName, keyPath, newSchemaField);
    setAddVisible(false);
  };

  useEffect(() => {
    if (addVisible) {
      setFieldName("");
      setSelectedType("string");
      setSelectedSubtype("string");
    }
  }, [addVisible]);

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full z-50 overflow-y-auto ${
        addVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ transition: "opacity 0.2s" }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="absolute inset-0 bg-black bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#32333b] rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-[#32333b] px-4 pt-5 pb-2 sm:p-6 sm:pb-4 rounded-lg">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-base leading-4 font-medium text-[#D9D9D9]" id="modal-title">
                Add field to <span className="font-semibold font-mono">{collectionName}</span>
              </h3>
              <div className="mt-4 mb-4 flex no-focus-ring h-8">
                <input
                  type="text"
                  className="px-2 w-full mr-4 ml-[-4px] h-[36px] bg-[#252629] border-[#525363] text-xs font-mono font-semibold rounded mx-0"
                  placeholder="Field name"
                  value={fieldName}
                  onChange={(e) => {
                    setFieldName(e.target.value);
                  }}
                />
                <Dropdown
                  onSelect={(item: any) => {
                    setSelectedType(item);
                  }}
                  title={selectedType}
                  children={[...primitives, { id: "array", name: "array" }]}
                  selectorClass="ml-auto mr-0"
                  direction="center"
                  className="fixed"
                />
                {selectedType == "array" && (
                  <Dropdown
                    onSelect={(item: any) => {
                      setSelectedSubtype(item);
                    }}
                    children={[...primitives]}
                    title={"[" + selectedSubtype + "]"}
                    direction="center"
                    className="fixed"
                    selectorClass="ml-2"
                  />
                )}
              </div>
              <div className="flex w-full mr-2 mt-8">
                <Button
                  className="text-sm px-3 py-2 mr-4 ml-auto font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                  onClick={() => {
                    setAddVisible(false);
                  }}
                  text={"Cancel"}
                />
                <Button
                  className="text-sm px-3 py-2 mr-0 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                  onClick={handleAddProcess}
                  text={"Add"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
