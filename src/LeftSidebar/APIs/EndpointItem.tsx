import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Method } from "../../Utilities/Method";

export default function EndpointItem({
  active = false,
  path,
  method,
  onClick,
}: {
  active?: boolean;
  path: string;
  method: Method;
  onClick?: () => void;
}) {
  const { deleteFile } = useEndpointApi()
  const { setPostMessage, setShouldRefreshList, shouldRefreshList } = useContext(SwizzleContext);

  const methodToColor = (method: Method) => {
    switch (method) {
      case Method.GET:
        return "text-green-400";
      case Method.POST:
        return "text-blue-400";
      case Method.PUT:
        return "text-yellow-400";
      case Method.DELETE:
        return "text-red-400";
      case Method.PATCH:
        return "text-purple-400";
    }
  };

  return (
    <>
      <div
        className={`font-mono text-xs flex-1 p-1.5 py-2 my-1 font-bold ${
          active ? "bg-[#85869822]" : ""
        } hover:bg-[#85869833] cursor-pointer rounded`}
        onClick={onClick}
      >
        <div className="flex">
        <div><span className={methodToColor(method)}>{method}</span> {path}</div>
        <FontAwesomeIcon
          className="mr-2 ml-auto opacity-50 hover:opacity-100 rounded transition-all cursor-pointer"
          icon={faTrash}
          onClick={() => {
            console.log(path)
            const c = confirm("Are you sure you want to delete this endpoint?");
            if(c){
              console.log("CLICK DELETE")
              try{
                const fileName = method.toLowerCase() + path.replace(/\//g, "-").replace(/:/g, "_");
                
                let newEndpointName;
                if (path === "") {
                  newEndpointName = `${method}/`;
                } else {
                  newEndpointName = `${method}/${path.replace(/\/+$/, "")}`;
                }
                
                console.log("will send", {
                  type: "removeFile",
                  fileName: "/backend/user-dependencies/" + fileName.replace("/", "") + ".js",
                  endpointName: newEndpointName,
                })
                
                setPostMessage({
                  type: "removeFile",
                  fileName: "/backend/user-dependencies/" + fileName.replace("/", "") + ".js",
                  endpointName: newEndpointName,
                });
                deleteFile(fileName, "backend")
                setShouldRefreshList(!shouldRefreshList)
              } catch(e){
                toast.error("Error deleting endpoint")
              }
            }
          }}
        />
      </div>
      </div>
    </>
  );
}
