import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import LogRow from "./LogRow";
import Switch from "react-switch";
import useWebSocket from 'react-use-websocket';
import toast from "react-hot-toast";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { useAuthHeader } from "react-auth-kit";

export default function LogsPage(){
    const {activeProject} = useContext(SwizzleContext);
    const authHeader = useAuthHeader();

    const [messages, setMessages] = useState([]);
    const [wsUrl, setWsUrl] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);


    const { lastMessage, getWebSocket, readyState } = useWebSocket(wsUrl, {
        onError: (e) => {
            toast.error("Error connecting to logs stream")
            console.log(e)
            setTimeout(() => {
                setIsStreaming(false)
            }, 200)
        }
    });
    
    //Handle incoming messages
    useEffect(() => {
        if (lastMessage !== null) {
          console.log('Received a message from the server:', lastMessage.data);
        }
    }, [lastMessage]);
    
    //Connect/disconnect websocket when switch is toggled
    useEffect(() => {
        if(isStreaming){
            setWsUrl("ws://localhost:4000/api/v1/projects/" + activeProject + "/monitoring/logs/stream?token=" + authHeader());
        } else{
            setWsUrl(null);
        }
    }, [isStreaming])

    //Disconnect websocket when component unmounts
    useEffect(() => {
        return () => {
            setWsUrl(null);
        }
    }, [])

    return(
        <div>
            <div className={`flex-1 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
                <div>
                    <div className={`font-bold text-base`}>Logs</div>
                    <div className={`text-sm mt-0.5`}>Click any request to see its logs</div>
                </div> 
                <div className="flex">
                    <div className="text-sm m-auto mr-2">Stream {isStreaming ? "active" : "paused"}</div>
                    <Switch className="m-auto" onChange={() => setIsStreaming(!isStreaming)} checked={isStreaming} checkedIcon={<PlayIcon className="p-2" />} uncheckedIcon={<PauseIcon className="p-2" />} offColor="#474752" />
                </div>
            </div>
            <div className="mx-4 pt-1 flex flex-row space-x-2">
                <table className="w-full h-full">
                <thead className="bg-[#85869822]">
                    <tr className="border-b border-[#4C4F6B]">  
                        <th className="text-left py-1 pl-4 w-12 font-light">Retry</th>
                        <th className="text-left py-1 pl-4 font-light">Timestamp</th>
                        <th className="text-left py-1 pl-4 font-light">Endpoint</th>
                        <th className="text-left py-1 pl-4 font-light">Result</th>
                        <th className="text-left py-1 pl-4 font-light">User</th>
                        <th className="text-left py-1 pl-4 font-light">Request</th>
                        <th className="text-left py-1 pl-4 font-light">Response</th>
                        <th className="text-left py-1 pl-4 font-light">Runtime</th>
                        <th className="text-right pr-2 py-1 pl-4 rounded-tr-md"></th>
                    </tr>
                </thead>
                <tbody className="overflow-y-scroll">
                    {messages.map((message, index) => {
                        return <LogRow key={index} />
                    })}
                    <tr>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>
    )
}