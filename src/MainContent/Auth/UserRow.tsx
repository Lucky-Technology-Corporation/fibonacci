import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import useDatabaseApi from "../../API/DatabaseAPI";
import { copyText } from "../../Utilities/Copyable";
import InfoItem from "../../Utilities/Toast/InfoItem";

const formatDateIfISO8601 = (date: string): string => {
  const iso8601Regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{1,3}Z/;
  if (iso8601Regex.test(date)) {
    const dateTime = new Date(date);
    const formattedDate = `${
      dateTime.getMonth() + 1
    }/${dateTime.getDate()}/${dateTime.getFullYear()}, ${dateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
    return formattedDate;
  }
  return date;
};

export default function UserRow({
  collection,
  keys,
  data,
  rowKey,
  setShouldShowSaveHint,
  showDetailView,
  style,
  shouldHideFields = ["_id"],
  shouldBlockEdits = [],
  shouldShowStrikethrough = false,
}: {
  collection: string;
  keys: string[];
  data: any;
  rowKey: string;
  setShouldShowSaveHint: (isEditing: boolean) => void;
  showDetailView: MouseEventHandler<SVGSVGElement>;
  style?: any;
  shouldHideFields?: string[];
  shouldBlockEdits?: string[];
  shouldShowStrikethrough?: boolean;
}) {
  const [editing, setEditing] = useState("");
  const [rowValues, setRowValues] = useState(data);
  const [pendingInputValue, setPendingInputValue] = useState("");
  const { updateDocument } = useDatabaseApi();

  useEffect(() => {
    setRowValues(data);
  }, [data]);

  const setupEditing = (key: string) => {
    if (shouldBlockEdits.includes(key)) return;
    setEditing(key);
    setShouldShowSaveHint(true);
    setPendingInputValue(rowValues[key]);
  };

  const endEditing = () => {
    setEditing("");
    const focusableElements = document.querySelectorAll("input");
    focusableElements.forEach((element) => element.blur());
    setShouldShowSaveHint(false);
  };

  const modalRef = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        endEditing();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const saveNewValues = (key: string, value: string) => {
    var document = { ...rowValues };
    document[key] = value;
    setRowValues({ ...rowValues, [key]: pendingInputValue });
    toast.promise(updateDocument(collection, document._id, document), {
      loading: "Updating document...",
      success: "Updated document!",
      error: "Failed to update document",
    });
    endEditing();
  };

  return (
    <tr className="hover:bg-[#85869822]" ref={modalRef} key={rowKey} style={style}>
      <td className={`font-mono border-none`} key={`${rowKey}-${0}`}>
        <EllipsisVerticalIcon onClick={showDetailView} className="h-5 m-auto py-0.5 cursor-pointer text-[#D9D9D9]" />
      </td>
      {/* <td>
        {rowValues["countryCode"] && <img src={`https://flagsapi.com/${rowValues["countryCode"]}/flat/48.png`} />}
      </td> */}
      <td className="flex">
        {(rowValues["isVerified"] ?? false) == true ? (
          <div className="rounded-md bg-green-300 bg-opacity-30 px-2 mt-1 py-0.5 text-xs font-medium text-green-300 ring-1 ring-inset ring-green-300/20">
            true
          </div>
        ) : (
          <div className="rounded-md bg-yellow-300 bg-opacity-30 px-2 mt-1 py-0.5 text-xs font-medium text-yellow-300 ring-1 ring-inset ring-yellow-300/20">
            false
          </div>
        )}
      </td>
      {keys
        .filter((k) => !shouldHideFields.includes(k))
        .map((key, index) => {
          const originalValue = rowValues[key];
          const isObject = typeof originalValue === "object" && originalValue !== null && !Array.isArray(originalValue);

          let value = originalValue;
          if (typeof originalValue === "string") {
            value = formatDateIfISO8601(originalValue);
          }
          return (
            <td
              className={`font-mono p-1 border-none ${editing === key ? "bg-[#383842]" : ""}`}
              key={`${rowKey}-${index + 1}`}
            >
              {isObject ? (
                <InfoItem
                  content={<div className="text-xs font-mono underline decoration-dotted">Object</div>}
                  toast={{
                    title: "",
                    content: (
                      <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap word-break">
                        {JSON.stringify(value, null, 2)}
                      </div>
                    ),
                    isLarge: true,
                  }}
                  position="bottom-right"
                />
              ) : (value || "").toString().startsWith("http") &&
                editing !== key &&
                (value || "").toString().match(/\.(jpeg|jpg|png|gif)$/) ? (
                <img
                  src={value}
                  className="h-8 w-8 rounded-md cursor-pointer"
                  onClick={() => {
                    if (!shouldBlockEdits.includes(key)) {
                      setupEditing(key);
                    } else {
                      window.open(value, "_blank");
                    }
                  }}
                />
              ) : (
                <input
                  type="text"
                  className={`w-full bg-transparent border-0 outline-0 text-xs ${
                    shouldShowStrikethrough ? "line-through" : ""
                  } ${
                    ((value || "").toString().startsWith("https://") && shouldBlockEdits.includes(key)) ||
                    shouldBlockEdits.includes(key)
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onFocus={() => {
                    if (!shouldBlockEdits.includes(key)) {
                      setupEditing(key);
                    }
                  }}
                  value={editing === key ? pendingInputValue : value || ""}
                  onClick={() => {
                    if (!shouldBlockEdits.includes(key)) {
                      setupEditing(key);
                    } else {
                      copyText(value);
                    }
                  }}
                  readOnly={shouldBlockEdits.includes(key)}
                  onChange={(event) => setPendingInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      saveNewValues(key, pendingInputValue);
                    } else if (event.key === "Escape") {
                      endEditing();
                    }
                  }}
                />
              )}
            </td>
          );
        })}
    </tr>
  );
}
