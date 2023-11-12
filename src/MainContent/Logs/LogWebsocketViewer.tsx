import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";

type LogWebsocketViewerProps = {
    location: "frontend" | "backend";
    style: CSSProperties
};

export default function LogWebsocketViewer(props: LogWebsocketViewerProps) {
    const [log, setLog] = useState('');
    const [ws, setWs] = useState(null);
    const endpointApi = useEndpointApi();
    const {testDomain, activeProject} = useContext(SwizzleContext);
    const divRef = useRef(null);
    const messageBuffer = useRef([]);

    useEffect(() => {
        async function connect() {
            if(!activeProject || !testDomain) return;

            var fermatJwt = await endpointApi.getFermatJwt();
            fermatJwt = fermatJwt.replace("Bearer ", "");

            const path = props.location == "frontend" ? "frontend/app.log" : "backend/server.log";
            const webSocket = new WebSocket(`wss://${testDomain.replace("https://", "fermat.")}/tail_logs?path=${path}&jwt=${fermatJwt}`);
            webSocket.onopen = () => {
                console.log("Websocket connected")
            };
            webSocket.onmessage = (event) => {
                var newLog = event.data
                console.log("newLog", newLog)
                messageBuffer.current.push(event.data);
            };

            webSocket.onclose = () => {
                // Try to reconnect after a few seconds
                console.error("Websocket closed")
                setTimeout(connect, 3000);
            };

            webSocket.onerror = (err) => {
                console.error(
                    "Socket encountered error: ",
                    err,
                    "Closing socket"
                );
                webSocket.close();
            }

            setWs(webSocket);
        }

        if (ws) {
            ws.close();
        }
        connect();

        const intervalId = setInterval(() => {
            if (messageBuffer.current.length > 0) {
                var newLogs = messageBuffer.current.join('\n')
                
                const regex = /\x1B\[\d+m/g;
                newLogs = newLogs.replace(regex, '');

                setLog(prevLog => prevLog + '\n' + newLogs);
                messageBuffer.current = [];
            }
        }, 1000);    

        return () => {
            clearInterval(intervalId);
            if (ws) {
                ws.close();
            }
        };
    }, [activeProject, testDomain]);

    useEffect(() => {
        setTimeout(() => {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }, 50);
    }, [log])

    return (
        <div ref={divRef} style={props.style} className="overflow-y-scroll border-t border-gray-700 py-1 mr-4">
            <span className="font-mono text-sm">{log}</span>
        </div>
    );
}