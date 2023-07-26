import { Method } from "../../Utilities/Method";

export default function EndpointItem({active = false, path, method}: {active?: boolean, path: string, method: Method}) {

    const methodToColor = (method: Method) => {
        switch(method) {
            case Method.GET:
                return "text-green-400"
            case Method.POST:
                return "text-blue-400"
            case Method.PUT:
                return "text-yellow-400"
            case Method.DELETE:
                return "text-red-400"
            case Method.PATCH:
                return "text-purple-400"
        }
    }

    return(
        <>
            <div className={`font-mono text-xs flex-1 p-1.5 py-2 my-1 font-bold ${active ? "bg-[#85869822]" : ""} hover:bg-[#85869833] cursor-pointer rounded`}>
                <span className={methodToColor(method)}>{method}</span> {path}
            </div>
        </>
    )
}