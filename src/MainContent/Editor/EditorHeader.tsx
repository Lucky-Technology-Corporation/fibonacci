import Dot from "../../Utilities/Dot";
import { Method } from "../../Utilities/Method";

export default function EndpointItem({
  method,
  path,
}: {
  method: Method;
  path: string;
}) {
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
      <div className={`flex-1 ml-8 mb-2 text-lg font-bold font-mono`}>
        <div className="flex">
          <span className={`${methodToColor(method)} mr-2`}>{method}</span>{" "}
          {path}
        </div>
      </div>
    </>
  );
}
