import { CSSProperties, useContext, useEffect, useRef, useState } from "react";
import useEndpointApi from "../../API/EndpointAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";

type LogWebsocketViewerProps = {
    location: "frontend" | "backend";
    style: CSSProperties;
    selectedTab: Page;
};

export default function LogWebsocketViewer(props: LogWebsocketViewerProps) {
    const [log, setLog] = useState('');
    const [ws, setWs] = useState<WebSocket>(null);
    const endpointApi = useEndpointApi();
    const {testDomain, activeProject, activeEndpoint} = useContext(SwizzleContext);
    const divRef = useRef(null);
    const messageBuffer = useRef([]);

    //Restart websocket on tab change, endpoint change, or project change
    useEffect(() => {
        if(ws){ ws.close() }
        setLog("");
        if(!activeProject || !testDomain || !activeEndpoint) return;
        if(props.selectedTab != Page.Apis && props.selectedTab != Page.Hosting) return;
        reconnectWebsocket();
    }, [activeEndpoint, props.selectedTab, testDomain])

    //Close websocket on unmount
    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    //Reconnect websocket
    const reconnectWebsocket = async () => {
        let messageQueue = [];

        if (ws) {
            ws.close();
        }

        if(!activeProject || !testDomain || !(props.selectedTab == Page.Apis || props.selectedTab == Page.Hosting)) return;

        var fermatJwt = await endpointApi.getFermatJwt();
        fermatJwt = fermatJwt.replace("Bearer ", "");

        const path = props.selectedTab == Page.Hosting ? "frontend/app.log" : "backend/server.log";
        const webSocket = new WebSocket(`wss://${testDomain.replace("https://", "fermat.")}/tail_logs?path=${path}&jwt=${fermatJwt}`);
        

        webSocket.onmessage = (event) => {
            var newLog = event.data
            console.log("socket", "message: " + new Date().getUTCMilliseconds() + ": " + newLog)
            messageQueue.push(newLog);
        };

        const processQueue = () => {
            if (messageQueue.length > 0) {
                const message = messageQueue.shift();
                
                var line = message
                if (
                    (line.includes("0.0.0.0:9229") ||
                    line.includes("For help, see: https://nodejs.org/en/docs/inspector") ||
                    line.includes("ExperimentalWarning: Custom ESM Loaders") ||
                    line.includes("(Use `node --trace-warnings ...")) && !line.includes("\n")
                ){ return }
                
                const regex = /\x1B\[\d+m/g;
                line = line.replace(regex, '');

                try{
                    var lines = [line]
                    if(line.includes("\n")){
                        lines = line.split("\n");
                    }
                    
                    line = ""

                    for(var i = 0; i < lines.length; i++){
                        var currentLine = lines[i] + "\n";

                        try{
                            const parsed = JSON.parse(currentLine);
                            if(parsed.text){
                                const date = new Date(parsed.timestamp).toLocaleTimeString()
                                currentLine = `[${date}] ${parsed.text}\n`;
                            }
                        } catch(e){ }

                        if(currentLine.startsWith("[0] ")){
                            currentLine = currentLine.substring(4);
                        } else if(currentLine.startsWith("[1] ")){
                            currentLine = currentLine.substring(4);
                        }

                        currentLine = currentLine.replace(/\n+$/, "");
                        if(currentLine.trim() != ""){
                            line = line + currentLine + "\n";
                        }
                    }

                    if(line.endsWith("\n")){
                        line = line.substring(0, line.length - 1);
                    }
                } catch (e) {}

                setLog(prevLog => prevLog + '\n' + line);
            }
        };
        
        setInterval(processQueue, 100);
        

        webSocket.onclose = () => {
            console.log("socket", "close")
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