import { faChevronDown, faChevronRight, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Button from "../../../Utilities/Button";

export default function SchemaViewer({schema, setSchema, commitSchema}: {schema: any, setSchema: any, commitSchema: any}){
  
  const handleAdd = (collection, field) => {
    const newData = { ...schema };
    // Assuming the field value is a string for simplicity
    newData[collection][field] = '';
    setSchema(newData);
  };

  const handleRemove = (collection, keyPath: string[]) => {
    const newData = { ...schema };

    // Helper function to recursively delete the field
    const deleteField = (obj, path) => {
      if (path.length === 1) {
        delete obj[path[0]]; // Delete the field at the last key
        return;
      }

      if (obj[path[0]]) {
        deleteField(obj[path[0]], path.slice(1)); // Recurse with the next level
      }
    };

    if (keyPath.length > 0) {
      deleteField(newData[collection], keyPath);
    }

    setSchema(newData);
    commitSchema(newData)
  };

  const handleEdit = (collection, keyPath: string[], value, shouldCommit) => {
    console.log("shouldCommit", shouldCommit)
    const newData = { ...schema };

    // Helper function to recursively set the field
    const setField = (obj, path, value) => {
      if (path.length === 1) {
        obj[value] = obj[path[0]]; // Set value at the last key
        delete obj[path[0]];
        return;
      }

      if (obj[path[0]]) {
        setField(obj[path[0]], path.slice(1), value); // Recurse with the next level
      }
    };

    if (keyPath.length > 0) {
      setField(newData[collection], keyPath, value);
    }

    setSchema(newData);

    if(shouldCommit){
      // commitSchema(newData)
    }
  }

  const CollapsibleSection = ({ title, children, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);
  
    return (
      <>
        <div key={title} className="flex justify-between align-middle my-2 p-1 rounded no-focus-ring" style={{ marginLeft: `${level * 20}px` }}>
          <div className="my-auto">
            <Button
              className={`${title == "_id" && "opacity-0 pointer-events-none"} w-3 ml-auto text-sm font-sans mr-2 py-1 font-medium rounded flex justify-center items-center cursor-pointer hover:bg-[#85869822]`} 
              onClick={() => setIsOpen(!isOpen)}
              children={<FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} className="text-sm w-3 h-3 opacity-70 hover:opacity-100" />}
            />
          </div>
          <input className="my-auto text-xs font-mono font-semibold bg-transparent rounded p-1 px-1 mx-0" value={title} onChange={() => {}} />
          <div className="my-auto ml-auto mr-4">Object</div>
        </div>

        {isOpen && children}
      </>
    );
  };  

  const InputField = ({ initialValue, onBlur, ...props }) => {
    const [value, setValue] = useState(initialValue);
  
    const handleChange = (e) => {
      setValue(e.target.value);
    };
  
    const handleBlur = (e) => {
      onBlur?.(e.target.value); // Call onBlur prop with the final value
    };
  
    return (
      <input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  };  

  const renderField = (field, type, collection, handleRemove, keyPath: string[], level = 0) => {
    if (typeof type === 'object' && !Array.isArray(type)) {
      return (
        <CollapsibleSection key={field} title={field} level={level}>
          {Object.entries(type).map(([nestedField, nestedType]) => (
            renderField(nestedField, nestedType, collection, handleRemove, [...keyPath, nestedField], level + 1)
          ))}
        </CollapsibleSection>
      );
    } else {
      return (
        <div key={field} className="flex justify-between align-middle my-2 p-1 rounded no-focus-ring" style={{ marginLeft: `${level * 20}px` }}>
          <div className="my-auto">
            <Button
              className={`${field == "_id" && "opacity-0 pointer-events-none"} w-3 ml-auto text-sm font-sans mr-2 py-1 font-medium rounded flex justify-center items-center cursor-pointer hover:bg-[#85869822]`} 
              onClick={() => handleRemove(collection, keyPath)}
              children={<FontAwesomeIcon icon={faXmarkCircle} className="text-sm w-3 h-3 opacity-70 hover:opacity-100" />}
            />
          </div>
          <InputField
            key={keyPath.join("-") + "-" + field + "-input"}
            className={`my-auto text-xs font-mono font-semibold ${field == "_id" ? "bg-transparent" : "bg-[#85869822]"} border-[#525363] rounded p-1 px-1 mx-0`}
            initialValue={field}
            // onChange={(newValue) => handleEdit(collection, keyPath, newValue, false)}
            onBlur={(newValue) => handleEdit(collection, keyPath, newValue, true)}
          />
          <div className="my-auto ml-auto mr-4">{JSON.stringify(type).replace(/"/g,"")}</div>
        </div>
      );
    }
  };
    
  if(!schema){
    return <div></div>
  }
  
  return(
    <div className="w-full overflow-scroll">
      {Object.entries(schema).map(([collection, fields]) => (
        <div key={collection} className="my-2 bg-[#85869822] p-2 rounded">
          <div className="text-sm font-bold font-mono text-center my-1">{collection}</div>
            {Object.entries(fields).map(([field, type]) =>
              renderField(field, type, collection, handleRemove, [field])
            )}
          <Button
              className={`text-sm my-4 px-3 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border`} 
              onClick={() => {  }}
              text={"Add Field"}
          />
        </div>
      ))}
    </div>
  )
}