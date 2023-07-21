import { Method } from "../../Utilities/Method";

export default function EndpointItem({active = false, level = 0, method}: {active?: boolean, level: number, method: Method}) {

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
            <div className={`font-mono flex-1 p-2 font-bold ${methodToColor(method)} ${active ? "bg-[#85869833]" : "hover:bg-[#85869833]"} cursor-pointer rounded`} style={{marginLeft: (level*8)+"px"}}>
                {method}
            </div>
        </>
    )
}