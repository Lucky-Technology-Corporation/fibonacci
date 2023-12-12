import { CSSProperties, ReactNode, useContext, useEffect, useRef, useState } from "react";
import Switch from "react-switch";
import useEndpointApi from "../../API/EndpointAPI";
import { ParsedActiveEndpoint } from "../../Utilities/ActiveEndpointHelper";
import { filenameToEndpoint } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";

type LogWebsocketViewerProps = {
    location: "frontend" | "backend";
    style: CSSProperties;
};

export default function LogWebsocketViewer(props: LogWebsocketViewerProps) {
    const [log, setLog] = useState([]);
    const [ws, setWs] = useState<WebSocket>(null);
    const endpointApi = useEndpointApi();
    const {testDomain, activeProject, activeEndpoint, setPostMessage, selectedTab} = useContext(SwizzleContext);
    const divRef = useRef(null);
    const [currentLocation, setCurrentLocation] = useState<string>();
    const [socketDomain, setSocketDomain] = useState<string>();
    
    const [didTryToReconnect, setDidTryToReconnect] = useState(false);

    //Restart websocket on tab change, endpoint change, or project change
    useEffect(() => {
        
        //Don't reconnect if we're already on the right tab
        if(ws && ws.OPEN && currentLocation == "backend" && selectedTab == Page.Apis){ return } 
        else if(ws && ws.OPEN && currentLocation == "frontend" && selectedTab == Page.Hosting){ return }

        //Close and reset
        if(ws){ ws.close() }
        setLog([]);

        //Don't connect if we don't have the right data
        if(!activeProject || !testDomain || !activeEndpoint) return;
        if(selectedTab != Page.Apis && selectedTab != Page.Hosting) return;

        //Set our location
        setCurrentLocation(selectedTab == Page.Hosting ? "frontend" : "backend");
    }, [activeEndpoint, selectedTab])

    useEffect(() => {
        if(socketDomain != testDomain){
            if(selectedTab == Page.Hosting || selectedTab == Page.Apis){
                reconnectWebsocket()
            }
            setSocketDomain(testDomain)
        }
    }, [testDomain])

    useEffect(() => {
        console.log("location", currentLocation)
        if(currentLocation){
            reconnectWebsocket()
        }
    }, [currentLocation])

    //Close websocket on unmount
    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    const greyOutUnimportantLines = (inputLine: string): ReactNode => {
        if(inputLine == undefined){ return <></> }
        return inputLine.split("\n").map((line, index) => {
            if(line.trimStart().startsWith("at ")){
                return <span className="text-gray-500">{line}<br/></span>
            } else if(line.trimStart().startsWith("diagnosticCodes: [")){
                return <span className="text-gray-500">{line}<br/></span>
            } else if(line.replace(/\s/g, '') == "}"){
                return <span className="text-gray-500">{line}<br/></span>
            } else if(line.replace(/\s/g, '') == "^"){
                return <></>
            } else if(line.replace(/\s/g, '') == "Serverrunning!"){
                return <span className="text-green-500">{line}<br/></span>
            } else if(line.trimStart().startsWith("/swizzle/code/node_modules/ts-node/src/index.ts:")){
                return <></>
            } else if(line.trimStart().startsWith("return new TSError(diagnosticText, diagnosticCodes, diagnostics);")){
                return <></>
            } else if(line.trimEnd().endsWith("Unable to compile TypeScript:")){
                return <></>
            } else if(line.includes("ExperimentalWarning:") && line.includes("(node:")){
                return <></>
            } else if(line.includes("--import 'data:text/javascript,import { register } from")){
                return <></>
            } else {
                return <span key={index}>{line}<br/></span>
            }
        })
    }

    const parseOutFilenamesAndCreateElement = (line: string) => {
        var cleanLine = line
        if(currentLocation == "backend"){
            if(line.includes("user-dependencies/") && !line.includes("Internal watch failed: ENOSPC")){
                if(line.includes("):")){
                    const fileName = line.split("user-dependencies/")[1].split("(")[0]
                    const niceEndpoint = new ParsedActiveEndpoint(filenameToEndpoint(fileName))
                    const lineNumbers = line.split(fileName)[1].split(")")[0].replace("(", "").replace(")", "").replace(/\s+/g, '').split(",")
                    const lineNumber = lineNumbers[0]
                    const columnNumber = lineNumbers[1]
                    if(line.split("):")[1].includes("Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'")){
                        return <span className="font-mono text-sm"><span className="text-purple-500 mr-2 cursor-pointer underline decoration-dotted" onClick={autoFixImportJs("/backend/user-dependencies/" + fileName, line.split("):")[1])}>[Autofix this issue]</span><span className="text-red-500">Error in {niceEndpoint.method} {niceEndpoint.fullPath} at <span onClick={() => { console.log("open the offender"); setPostMessage({type: "openFile", fileName: "/backend/user-dependencies/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.split("):")[1])}</span>
                    }
                    return <span className="font-mono text-sm"><span className="text-red-500">Error in {niceEndpoint.method} {niceEndpoint.fullPath} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/backend/user-dependencies/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.split("):")[1])}</span>
                } else {
                    const fileName = line.split("user-dependencies/")[1].split(":")[0]
                    const niceEndpoint = new ParsedActiveEndpoint(filenameToEndpoint(fileName))
                    const lineNumbers = line.split(fileName + ":")[1].split("\n")[0].replace(":", ",").split(",")
                    const lineNumber = lineNumbers[0]
                    const columnNumber = lineNumbers[1]
                    if(line.split(":")[1].includes("Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'")){
                        return <span className="font-mono text-sm"><span className="text-purple-500 mr-2 cursor-pointer underline decoration-dotted" onClick={autoFixImportJs("/backend/user-dependencies/" + fileName, line.split("):")[1])}>[Autofix this issue]</span><span className="text-red-500">Error in {niceEndpoint.method} {niceEndpoint.fullPath} at <span onClick={() => { console.log("open the offender"); setPostMessage({type: "openFile", fileName: "/backend/user-dependencies/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.split("):")[1])}</span>
                    }
                    return <span className="font-mono text-sm"><span className="text-red-500">Error in {niceEndpoint.method} {niceEndpoint.fullPath} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/backend/user-dependencies/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.split("):")[1])}</span>
                }
            } else if(line.includes("helpers/") && !line.includes("\n") && !line.includes("Internal watch failed: ENOSPC")){
                const fileName = line.split("helpers/")[1].split("(")[0]
                const lineNumbers = line.split(fileName)[1].split(")")[0].replace("(", "").replace(")", "").replace(/\s+/g, '').split(",")
                const lineNumber = lineNumbers[0]
                const columnNumber = lineNumbers[1]
                return <span className="font-mono text-sm"><span className="text-red-500">{fileName} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/backend/helpers/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.split("):")[1])}</span>
            }
        }

        return <span className="font-mono text-sm">{greyOutUnimportantLines(cleanLine)}</span>
    }

    const autoFixImportJs = (fileName, errorText) => {
        if(!errorText.includes("Did you mean '")){ return () => {} }
        const fixedImport = errorText.split("Did you mean '")[1].split("'")[0]
        return () => {
            setPostMessage({type: "openFile", fileName: fileName, line: 0, column: 0})
            setTimeout(() => {
                setPostMessage({type: "findAndReplace", findText: fixedImport.replace(".js", ""), replaceText: fixedImport})
            }, 200);
        }
    }


    //Reconnect websocket
    const reconnectWebsocket = async () => {
        let messageQueue = [];

        if (ws) {
            ws.close();
        }
        console.log("socket", "connect")
        if(!activeProject || !testDomain || !(selectedTab == Page.Apis || selectedTab == Page.Hosting)) return;

        var fermatJwt = await endpointApi.getFermatJwt();
        fermatJwt = fermatJwt.replace("Bearer ", "");

        const path = currentLocation == "frontend" ? "frontend/app.log" : "backend/server.log";
        const webSocket = new WebSocket(`wss://${testDomain.replace("https://", "fermat.")}/tail_logs?path=${path}&jwt=${fermatJwt}&initial_lines=25`);
        

        webSocket.onmessage = (event) => {
            var newLog = event.data
            messageQueue.push(...(newLog.split("\n")));
        };

        const processQueue = () => {
            if (messageQueue.length > 0) {
                // const message = messageQueue.shift();
                // var line = message

                const regex = /\x1B\[\d+m/g;
                // line = line.replace(regex, '');

                const allMessages = [];
                while (messageQueue.length > 0) {
                    allMessages.push(messageQueue.shift().replace(regex, ''));
                }
                var allElements = [];
                console.log("allMessages", allMessages)
                allMessages.forEach((lineIn) => {
                    try{
                        var lines;
                        if(lineIn.includes("\n")){
                            lines = lineIn.split("\n");
                        } else{
                            lines = [lineIn];
                        }
                        
                        var line = ""

                        for(var i = 0; i < lines.length; i++){
                            var currentLine = lines[i];

                            if (
                                (currentLine.includes("0.0.0.0:9229") ||
                                currentLine.includes("For help, see: https://nodejs.org/en/docs/inspector") ||
                                currentLine.includes("ExperimentalWarning: Custom ESM Loaders") ||
                                currentLine.includes("(Use `node --trace-warnings ...")) ||
                                currentLine.includes("[nodemon] to restart at any time, enter `rs`") ||
                                currentLine.includes("[nodemon] watching path(s): **/*") ||
                                currentLine.includes("[nodemon] watching extensions: ts") ||
                                currentLine.includes("[nodemon] 3.0.1") ||
                                currentLine.includes("npm WARN exec The following package was not found and will be installed")
                            ){ continue }        

                            try{
                                const parsed = JSON.parse(currentLine);
                                if(parsed.text !== null && parsed.text !== undefined){
                                    const date = new Date(parsed.timestamp).toLocaleTimeString()
                                    currentLine = `[${date}] ${parsed.text}`;
                                }
                            } catch(e){ }
                            
                            if(currentLine.startsWith("[0] ")){
                                currentLine = currentLine.substring(4);
                            } else if(currentLine.startsWith("[1] ")){
                                currentLine = currentLine.substring(4);
                            }

                            currentLine = currentLine.replace(/\n+$/, ""); //remove trailing newlines

                            if(currentLine.replace(/\s/g, '') !== ""){ //replace all whitespace
                                line = line + currentLine + "\n";
                            }                        
                        }
                        if(line == ""){ return }
                        if(line.endsWith("\n")){
                            line = line.substring(0, line.length - 1);
                        }
                    } catch (e) {}

                    const filteredLine = line.split('\n')
                    .filter(line => line.replace(/^\s+/, '') !== '') // Remove lines that are empty or contain only whitespace
                    .join('\n')

                    const lineJsxElement = parseOutFilenamesAndCreateElement(filteredLine);
                    allElements.push(lineJsxElement);
                })
                setLog(prevLog => [...prevLog, ...allElements]);
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
            setTimeout(() => {
                if(didTryToReconnect){ 
                    console.log("Not retrying")
                    return 
                }
                console.log("Trying to reconnect...")
                reconnectWebsocket();
                setDidTryToReconnect(true);
            }, 1000);
        }

        setWs(webSocket);
    }

    useEffect(() => {
        setTimeout(() => {
            if(divRef.current && divRef.current.scrollHeight){
                divRef.current.scrollTop = divRef.current.scrollHeight;
            }
        }, 50);
    }, [log])

    return (
        <>        
        <div ref={divRef} style={props.style} className="overflow-y-scroll border-t border-gray-700 py-1 mr-4 bg-[#1e1e1e]">
            <div className="flex mt-1 z-40 fixed right-0 mr-[188px] rounded mt-0 p-1 bg-[#1e1e1e] bg-opacity-70">
                {currentLocation == "backend" ? (
                    <div className="text-sm font-bold m-auto ml-1">Backend Logs</div>
                ) : (
                    <div className="text-sm font-bold m-auto ml-1">Frontend Logs</div>
                )}
                <Switch
                    className="ml-1 scale-75 env-toggle"
                    onChange={() => {
                        if(ws){ ws.close(); }
                        setLog([]);
                        setCurrentLocation(currentLocation == "frontend" ? "backend" : "frontend");
                    }}
                    checked={currentLocation == "backend"}
                    uncheckedIcon={<img src="/world.svg" className="w-4 ml-1.5 pt-1" />}
                    checkedIcon={<img src="/cloud.svg" className="w-4 ml-2.5 pt-1" />}
                    offColor="#333336"
                    onColor="#333336"
                />
            </div>
            <span className="font-mono text-sm">{log.map((entry, index) => {
                return (
                    <div key={index}>{entry}</div>
                )
            })}</span>
        </div>
        </>
    );
}