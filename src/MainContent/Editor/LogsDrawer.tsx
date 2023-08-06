import Button from "../../Utilities/Button"
import HoverableObject from "./HoverableObject"

export default function LogsDrawer({}: {}) {

    return (
        <div className="h-[280px] pr-3 bottom-0 w-full">
            <table className="w-full h-full">
                <thead className="bg-[#85869822]">
                    <tr className="border-b border-[#4C4F6B]">
                        <th className="text-left py-1 pl-4">Logs</th>
                        <th className="text-left py-1 pl-4">Request</th>
                        <th className="text-left py-1 pl-4">Response</th>
                        <th className="text-left py-1 pl-4"></th>
                    </tr>
                </thead>
                <tbody className="overflow-y-scroll">
                    <tr className="border-b border-[#4C4F6B] h-[40px] hover:bg-[#85869855]">
                        <td className="text-left pl-4">Today 12:00:05</td>
                        <td className="text-left pl-4">
                            <HoverableObject text={"Object"} object={{}} /> from user <HoverableObject text={"sI82nd82n9923"} object={{}} />
                        </td>
                        <td className="text-left pl-4"> <HoverableObject text={"Object"} object={{}} /> with status 200</td>
                        <td className="w-24 pr-2">
                            <Button text="Retry" onClick={() => {}} />
                        </td>
                    </tr>
                    <tr className="border-b border-[#4C4F6B] h-[40px] hover:bg-[#85869855]">
                        <td className="text-left pl-4">Today 12:00:00</td>
                        <td className="text-left pl-4">
                            <HoverableObject text={"Object"} object={{}} /> from user <HoverableObject text={"sI82nd82n9923"} object={{}} />
                        </td>
                        <td className="text-left pl-4"> <HoverableObject text={"Error"} object={{}} /> with status 500</td>
                        <td className="w-24 pr-2">
                            <Button text="Retry" onClick={() => {}} />
                        </td>

                    {/* Take up the extra space if needed with an empty row */}
                    </tr>
                    <tr>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}