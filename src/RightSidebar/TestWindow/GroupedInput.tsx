import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export default function GroupedInput({valueList, setValueList, isQuery = false}: {valueList: {id: number, key: string, value: string}[], setValueList: Dispatch<SetStateAction<object[]>>, isQuery: boolean}){
    const lastEditedRef = useRef(null);
    const prevLength = useRef(valueList.length);
    const [emptyRow, setEmptyRow] = useState({ key: "", value: "" });

    useEffect(() => {
        console.log("valueList", valueList)
        if (valueList.length > prevLength.current && lastEditedRef.current) {
            lastEditedRef.current.focus();
        }
        prevLength.current = valueList.length;
    }, [valueList]);

    const handleInputChange = (id: number, newKey: string, newValue: string) => {
    const updatedValueList = [...valueList];
    const index = updatedValueList.findIndex((q) => q.id === id);

    if (index > -1) {
        updatedValueList[index] = { id, key: newKey, value: newValue };

        // Remove the row if both key and value are empty
        if (newKey === "" && newValue === "") {
        updatedValueList.splice(index, 1);
        }

        setValueList(updatedValueList);
    }
    };
    
    if(!valueList) return <></>
    console.log("valueList", typeof valueList)
    return (
        <div key="grouped-rows" className="w-full">
            {valueList.map(({ id, key, value }) => (
              <div className="flex w-full" key={id}>
                <div className={`${isQuery ? "" : "hidden"} p-1 mx-1 ml-0 my-1`}>{id == 0 ? "?" : "&"}</div>
                <input
                  placeholder="Key"
                  value={key}
                  onChange={(e) => handleInputChange(id, e.target.value, value)}
                  className="text-s p-1 flex-grow bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] my-1"
                />
                <div className="p-1 mx-1 my-1">=</div>
                <input
                  placeholder="Value"
                  value={value}
                  onChange={(e) => handleInputChange(id, key, e.target.value)}
                  className="text-s p-1 flex-grow bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] mr-2 my-1"
                  ref={id == valueList.length - 1 ? lastEditedRef : null}
                />
              </div>
            ))}

            {/* Empty set of boxes */}
            <div className="flex w-full" key="empty-row">
              <div className={`${isQuery ? "" : "hidden"} p-1 mx-1 ml-0 my-1`}>{valueList.length == 0 ? "?" : "&"}</div>
              <input
                placeholder="New Key"
                value={emptyRow.key}
                onChange={(e) => setEmptyRow({ ...emptyRow, key: e.target.value })}
                onBlur={() => {
                  if (emptyRow.key == "") {
                    return;
                  }
                  setValueList([
                    ...valueList,
                    { id: valueList.length, key: emptyRow.key, value: emptyRow.value },
                  ]);
                  setEmptyRow({ key: "", value: "" });
                }}
                onKeyDown={(e) => {
                  if (e.key == "Tab") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="text-s p-1 flex-grow bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] my-1"
              />
              <div className="p-1 mx-1 my-1">=</div>
              <input
                placeholder="New Value"
                value={emptyRow.value}
                disabled={true}
                className="text-s p-1 flex-grow bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] mr-2 my-1"
              />
            </div>
          </div>
    )
}