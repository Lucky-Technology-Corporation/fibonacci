import { useState, useEffect } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import useApi from "../../API/DatabaseAPI";
import { toast } from "react-hot-toast";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

export default function DocumentJSON({
  document,
  collection,
  isVisible,
  setIsVisible,
  id,
  onChange,
}: {
  document: any | any[];
  collection: string;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  id?: string;
  onChange: (data: any | any[]) => void;
}) {
  const [data, setData] = useState<string>("");
  const { updateDocument, createDocument } = useApi();
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setData(JSON.stringify(document, null, 2));
  }, [document]);

  useEffect(() => {
    try {
      JSON.parse(data);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
    }
  }, [data]);

  //remove when escape is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVisible(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const submitData = () => {
    // Validate the entire JSON array
    try {
      const dataArray = JSON.parse(data);
      if (Array.isArray(dataArray)) {
        // If 'data' is a JSON array
        // Validate each JSON object in the array
        const isDataValid = dataArray.every((item) => {
          return typeof item === "object" && item !== null;
        });

        if (!isDataValid) {
          toast.error("Invalid JSON in the array");
          return;
        }

        if (id) {
          // If 'id' is provided, we're updating an existing document
          // Loop through each object in the array and update the document
          Promise.all(
            dataArray.map((item) =>
              toast.promise(updateDocument(collection, id, item), {
                loading: "Updating document...",
                success: () => {
                  onChange(dataArray);
                  setIsVisible(false);
                  return "Updated document!";
                },
                error: "Failed to update document",
              }),
            ),
          );
        } else {
          // If 'id' is not provided, we're creating new documents
          // Loop through each object in the array and create a new document
          Promise.all(
            dataArray.map((item) =>
              toast.promise(createDocument(collection, item), {
                loading: "Creating document...",
                success: (response) => {
                  const newDoc = {
                    ...item,
                  };
                  newDoc._id = response.document_id;
                  return "Created document!";
                },
                error: "Failed to create document",
              }),
            ),
          ).then(() => {
            onChange(dataArray);
            setIsVisible(false);
          });
        }
      } else {
        // If 'data' is a JSON object
        // Validate the JSON object
        const isDataValid = typeof dataArray === "object" && dataArray !== null;

        if (!isDataValid) {
          toast.error("Invalid JSON");
          return;
        }

        if (id) {
          // If 'id' is provided, we're updating an existing document
          toast.promise(updateDocument(collection, id, dataArray), {
            loading: "Updating document...",
            success: () => {
              onChange([dataArray]); // Wrap the object in an array since it's a single document
              setIsVisible(false);
              return "Updated document!";
            },
            error: "Failed to update document",
          });
        } else {
          // If 'id' is not provided, we're creating a new document
          toast.promise(createDocument(collection, dataArray), {
            loading: "Creating document...",
            success: (response) => {
              const newDoc = {
                ...dataArray,
              };
              newDoc._id = response.document_id;
              onChange([newDoc]); // Wrap the object in an array since it's a single document
              setIsVisible(false);
              return "Created document!";
            },
            error: "Failed to create document",
          });
        }
      }
    } catch (error) {
      toast.error("Invalid JSON");
    }
  };

  return (
    <div
      className={`fixed max-h-1/2 z-50 inset-0 overflow-y-auto bg-black bg-opacity-50 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ transition: "opacity 0.2s" }}
    >
      <div className="flex items-center justify-center min-h-screen text-center">
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#32333b] rounded-md p-5 z-50 w-3/5 overflow-y-scroll`}
        >
          <div className="pt-2">
            <CodeEditor
              value={data}
              language="json"
              placeholder="Add your JSON array here"
              onChange={(evn) => setData(evn.target.value)}
              padding={15}
              data-color-mode="dark"
              style={{
                fontSize: 12,
                // backgroundColor: "#32333b",
                fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                borderRadius: 4,
                border: "1px solid #525363",
                maxHeight: "50vh",
                overflow: "scroll",
              }}
            />
          </div>
          <div className="bg-[#32333b] py-3 mt-2 flex flex-row justify-between">
            <div className="my-auto">
              {isValid ? (
                <div className="flex">
                  <CheckIcon className="w-6 h-6 mr-1 text-green-400" />
                  <div className="text-base text-green-400">Valid JSON</div>
                </div>
              ) : (
                <div className="flex">
                  <XMarkIcon className="w-6 h-6 mr-1 text-red-400" />
                  <div className="text-base text-red-400">Invalid JSON</div>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsVisible(false);
                }}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
              {isValid && (
                <button
                  type="button"
                  onClick={() => {
                    submitData();
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698] sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {id ? "Update" : "Create"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
