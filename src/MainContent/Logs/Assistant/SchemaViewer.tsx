import { faChevronDown, faChevronRight, faPlus, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Button from "../../../Utilities/Button";
import NewFieldModal from "./NewFieldModal";

export default function SchemaViewer({schema, setSchema, commitSchema, schemaRef}: {schema: any, setSchema: any, commitSchema: any, schemaRef: any}){
  
  const [addVisible, setAddVisible] = useState<boolean>(false);
  const [inputCollection, setInputCollection] = useState<string>("");
  const [inputKeyPath, setInputKeyPath] = useState<string[]>([]);

  const handleAdd = (collection, keyPath, schemaEntry) => {
    const newData = { ...schema };
  
    // Helper function to recursively add the field
    const addField = (obj, path, value) => {
      const key = path[0];
      if (path.length === 0) {
        const key = Object.keys(value)[0];
        var valueToSet = value[key];
        if(valueToSet == "object"){
          valueToSet = {}
        }
        obj[key] = valueToSet // Set value at the last key
        if(path[0] != value){
          delete obj[path[0]];
        }
        return;
      }
  
      if (!obj[key]) {
        obj[key] = {}; 
      }
  
      addField(obj[key], path.slice(1), value);
    };
  

    addField(newData[collection], keyPath, schemaEntry);
  
    setSchema(newData);
    commitSchema(newData);
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
      if(Object.keys(newData[collection]).length == 0){
        delete newData[collection]
      }
    } else{
      delete newData[collection]
    }

    setSchema(newData);
    commitSchema(newData)
  };

  const handleEdit = (collection, keyPath: string[], value, shouldCommit) => {
    const newData = { ...schema };

    // Helper function to recursively set the field
    const setField = (obj, path, value) => {
      if (path.length === 1) {
        obj[value] = obj[path[0]]; // Set value at the last key
        if(path[0] != value){
          delete obj[path[0]];
        }
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
      commitSchema(newData)
    }
  }

  const changeCollectionName = (collection, value) => {
    const newData = { ...schema };
    if(collection == value){ return }

    newData[value] = newData[collection]
    delete newData[collection]

    setSchema(newData);
    commitSchema(newData)
  }

  const openAddModal = (collection, keyPath) => {
    setInputKeyPath(keyPath)
    setInputCollection(collection)
    setAddVisible(true)
  }

  const CollapsibleSection = ({ title, children, keyPath, collection, level = 0 }) => {
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
          <div className="my-auto text-xs font-mono font-semibold bg-transparent rounded p-1 px-1 mx-0">{title}</div>
          <div className="my-auto ml-1 mr-auto cursor-pointer" onClick={() => {openAddModal(collection, keyPath)}}><FontAwesomeIcon icon={faPlus} className="text-sm w-3 h-3 opacity-70 hover:opacity-100" /></div>
          <div className="my-auto ml-auto mr-2">Object</div>
        </div>

        {isOpen && children}
      </>
    );
  };  

  const InputField = ({ initialValue, onBlur, ...props }) => {
    const [value, setValue] = useState(initialValue);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (e) => {
      if (!isDirty) setIsDirty(true);
      setValue(e.target.value);
    };
  
    const handleBlur = (e) => {
      if (isDirty && onBlur) {
        onBlur(e.target.value);
        setIsDirty(false);
      }
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
        <CollapsibleSection key={field} title={field} keyPath={keyPath} collection={collection} level={level}>
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
            className={`my-auto w-full text-xs font-mono font-semibold ${field == "_id" ? "bg-transparent" : "bg-[#85869822]"} border-[#525363] rounded p-1 px-1 mx-0 mr-2`}
            initialValue={field}
            onBlur={(newValue) => handleEdit(collection, keyPath, newValue, true)}
          />
          <div className="my-auto mr-2">{JSON.stringify(type).replace(/"/g,"")}</div>
        </div>
      );
    }
  };
    
  if(!schema){
    return <div></div>
  }
  
  return(
    <div className="w-full overflow-scroll" ref={schemaRef}>
      {Object.entries(schema).sort((a, b) => {
          if (a[0] === "") return -1; // If the first entry's key is an empty string, it should come first
          if (b[0] === "") return 1;  // If the second entry's key is an empty string, it should come second
          return 0; // If neither key is an empty string, keep original order
        }).map(([collection, fields]) => (
        <div key={collection} className="my-2 bg-[#85869822] p-2 rounded">
            <div className="text-sm font-bold font-mono text-center my-1 no-focus-ring flex">
              <Button
                className={`w-3 ml-auto text-sm font-sans mr-2 py-1 font-medium rounded flex justify-center items-center cursor-pointer hover:bg-[#85869822]`} 
                onClick={() => handleRemove(collection, [])}
                children={<FontAwesomeIcon icon={faXmarkCircle} className="text-sm w-3 h-3 opacity-70 hover:opacity-100" />}
              />
              <InputField
                key={collection + "-name-input"}
                className={`my-auto text-center w-full font-mono font-semibold bg-[#85869822] border-[#525363] rounded p-1 px-1 mx-0 mr-2`}
                initialValue={collection}
                onBlur={(newValue) => changeCollectionName(collection, newValue)}
                placeholder="collectionName"
              />
            </div>
            {Object.entries(fields).map(([field, type]) =>
              renderField(field, type, collection, handleRemove, [field])
            )}
          <div className="my-auto ml-2 mb-1 mr-auto cursor-pointer" onClick={() => {openAddModal(collection, [])}}><FontAwesomeIcon icon={faPlus} className="text-sm w-3 h-3 opacity-70 hover:opacity-100" /></div>
        </div>
      ))}
      <NewFieldModal addFieldHandler={handleAdd} addVisible={addVisible} setAddVisible={setAddVisible} collectionName={inputCollection} keyPath={inputKeyPath} />
    </div>
  )
}