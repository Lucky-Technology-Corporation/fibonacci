import { CSSProperties, ReactNode, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Switch from "react-switch";
import useEndpointApi from "../../API/EndpointAPI";
import { ParsedActiveEndpoint } from "../../Utilities/ActiveEndpointHelper";
import { filenameToEndpoint, formatPath } from "../../Utilities/EndpointParser";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import { Page } from "../../Utilities/Page";

type LogWebsocketViewerProps = {
    location: "frontend" | "backend";
    style: CSSProperties;
    injectedLog: any
    setInjectedLog: any;
    isSidebarOpen: boolean;
    reloadPreviewWindow: () => void;
};

export default function LogWebsocketViewer(props: LogWebsocketViewerProps) {
    const [log, setLog] = useState([]);
    const [ws, setWs] = useState<WebSocket>(null);
    const endpointApi = useEndpointApi();
    const {testDomain, activeProject, activeEndpoint, setPostMessage, selectedTab} = useContext(SwizzleContext);
    const divRef = useRef(null);
    const [currentLocation, setCurrentLocation] = useState<string>("backend");
    const [didRestartRecently, setDidRestartRecently] = useState<boolean>(false);

    const isReconnecting = useRef(false);

    //Restart websocket on tab change, endpoint change, or project change
    useEffect(() => {
        //Don't reconnect if we're already on the right tab
        // console.log("ws", ws)
        // console.log("ws_open", ws ? ws.OPEN : "false")
        // console.log("currentLocation", currentLocation)
        // console.log("selectedTab", selectedTab)

        // if(ws && ws.OPEN && currentLocation == "backend" && selectedTab == Page.Apis){ return } 
        // else if(ws && ws.OPEN && currentLocation == "frontend" && selectedTab == Page.Hosting){ return }

        //Close and reset
        if(ws){ ws.close() }
        setLog([]);

        //Don't connect if we don't have the right data
        if(!activeProject || !testDomain) return;
        if(selectedTab != Page.Apis && selectedTab != Page.Hosting) {
            if(ws){
                ws.close()
                setLog([])
            }
            return
        };


        //Set our location
        const newLocation = (selectedTab == Page.Hosting ? "frontend" : "backend");

        setCurrentLocation(newLocation)
        reconnectWebsocket(newLocation)

    }, [selectedTab])


    //Close websocket on unmount
    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    useEffect(() => {
        if(props.injectedLog == "" || props.injectedLog == undefined){ return }

        const timestamp = new Date().toLocaleTimeString()
        var errorMethod = props.injectedLog.method
        if(errorMethod == 'window_error'){
            errorMethod = 'uncaught error'
        }
        var color = ""
        if(errorMethod.includes("error")){
            color = "text-red-400"
        } else if(errorMethod.includes("warn")){
            color = "text-yellow-400"
        } else if(errorMethod.includes("info")){
            color = "text-blue-400"
        }
        const newLine = <span className={`font-mono text-sm ${color}`} key={`injected-${timestamp}`}>{"[react "+errorMethod+"] " + props.injectedLog.message}</span>
        setLog(prevLog => [...prevLog, newLine]);
        props.setInjectedLog("")
    }, [props.injectedLog])

    const greyOutUnimportantLines = (inputLine: string): ReactNode => {
        const timestamp = new Date().toLocaleTimeString()
        if(inputLine == undefined){ return <></> }
        return inputLine.split("\n").map((line, index) => {
            if(line.trimStart().startsWith("at ")){
                return <span className="text-gray-500" key={"grey-"+index+"-"+timestamp}>{line}<br/></span>
            } else if(line.trimStart().startsWith("diagnosticCodes: [")){
                return <span className="text-gray-500" key={"grey-"+index+"-"+timestamp}>{line}<br/></span>
            } else if(line.replace(/\s/g, '') == "}"){
                return <span className="text-gray-500" key={"grey-"+index+"-"+timestamp}>{line}<br/></span>
            } else if(line.replace(/\s/g, '') == "^"){
                return <></>
            } else if(line.replace(/\s/g, '') == "Serverrunning!"){
                return <span className="text-green-500" key={"grey-"+index+"-"+timestamp}>{line}<br/></span>
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
                return <span key={"grey-"+index+"-"+timestamp}>{line}<br/></span>
            }
        })
    }

    const parseOutFilenamesAndCreateElement = (line: string, key: string) => {
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
                        return <span className="font-mono text-sm" key={key}><span className="text-purple-500 mr-2 cursor-pointer underline decoration-dotted" onClick={autoFixImportJs("/backend/user-dependencies/" + fileName, line.split("):")[1], lineNumber)}>[Autofix this issue]</span><span className="text-red-500">Error in {niceEndpoint.method} {niceEndpoint.fullPath} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/backend/user-dependencies/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.includes("):") ? line.split("):")[1] : line)}</span>
                    }
                    return (
                        <span className="font-mono text-sm" key={key}>
                            <span className="text-red-500">Error in {niceEndpoint.method} {niceEndpoint.fullPath} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/backend/user-dependencies/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> 
                            {greyOutUnimportantLines(line.includes("):") ? line.split("):")[1] : line)}
                        </span>
                    )
                } else {
                    const fileName = line.split("user-dependencies/")[1].split(":")[0]
                    const niceEndpoint = new ParsedActiveEndpoint(filenameToEndpoint(fileName))
                    const lineNumbers = line.split(fileName + ":")[1].split("\n")[0].replace(":", ",").split(",")
                    const lineNumber = lineNumbers[0]
                    const columnNumber = lineNumbers[1]
                    if(line.split(":")[1].includes("Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'")){
                        return <span className="font-mono text-sm"><span className="text-purple-500 mr-2 cursor-pointer underline decoration-dotted" onClick={autoFixImportJs("/backend/user-dependencies/" + fileName, line.split("):")[1], lineNumber)}>[Autofix this issue]</span><span className="text-red-500">Error in {niceEndpoint.method} {niceEndpoint.fullPath} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/backend/user-dependencies/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.includes("):") ? line.split("):")[1] : line)}</span>
                    }
                    return <span className="font-mono text-sm" key={key}><span className="text-red-500">Error in {niceEndpoint.method} {niceEndpoint.fullPath} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/backend/user-dependencies/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.includes("):") ? line.split("):")[1] : line)}</span>
                }
            } else if(line.includes("helpers/") && !line.includes("\n") && !line.includes("Internal watch failed: ENOSPC")){
                const fileName = line.split("helpers/")[1].split("(")[0]
                const lineNumbers = line.split(fileName)[1].split(")")[0].replace("(", "").replace(")", "").replace(/\s+/g, '').split(",")
                const lineNumber = lineNumbers[0]
                const columnNumber = lineNumbers[1]
                return <span className="font-mono text-sm" key={key}><span className="text-red-500">{fileName} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/backend/helpers/" + fileName, line: lineNumber, column: columnNumber})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(line.includes("):") ? line.split("):")[1] : line)}</span>
            }
        } else if(currentLocation == "frontend"){
            if(line.includes("ERROR in")){
                const page = "frontend/" + line.split("ERROR in ")[1].split(".tsx")[0] + ".tsx"
                const lineNumber = line.split("\n")[0].split(/:/g)[1]
                const urlPath = formatPath(page, page.split("pages/")[1])
                return <span className="font-mono text-sm" key={key}><span className="text-red-500">Error in {urlPath} at <span onClick={() => { setPostMessage({type: "openFile", fileName: "/" + page, line: lineNumber, column: 0})}} className="cursor-pointer underline decoration-dotted">line {lineNumber}</span></span> {greyOutUnimportantLines(getStringAfterFirstNewline(line))}</span>
            }
        }

        return <span className="font-mono text-sm" id={key} key={key}>{greyOutUnimportantLines(cleanLine)}</span>
    }

    function getStringAfterFirstNewline(str) {
        const newlineIndex = str.indexOf('\n');
        if (newlineIndex === -1) {
            return ''; // Return an empty string if no newline character is found
        }
        return str.substring(newlineIndex + 1);
    }    

    const autoFixImportJs = (fileName, errorText, lineNumber) => {
        if(errorText.includes("Did you mean '")){
            const fixedImport = errorText.split("Did you mean '")[1].split("'")[0]
            return () => {
                setPostMessage({type: "openFile", fileName: fileName, line: 0, column: 0})
                setTimeout(() => {
                    setPostMessage({type: "findAndReplace", findText: fixedImport.replace(".js", ""), replaceText: fixedImport})
                }, 200);
                setTimeout(() => {
                    setPostMessage({type: "saveFile"})
                }, 400);
            }
        }
        if(errorText.includes("Consider adding an extension to the import path")){
            return async () => {
                const contents = await endpointApi.getFile(fileName)
                const lineInQuestion = contents.split("\n")[lineNumber - 1]
                //handle " ' and ;
                var fixedImport = ""
                if(lineInQuestion.includes("\"")){
                    fixedImport = replaceLastInstance(lineInQuestion, "\"", ".js\"")
                } else if(lineInQuestion.includes("'")){
                    fixedImport = replaceLastInstance(lineInQuestion, "'", ".js'")
                }

                setPostMessage({type: "openFile", fileName: fileName, line: 0, column: 0})
                setTimeout(() => {
                    setPostMessage({type: "findAndReplace", findText: lineInQuestion, replaceText: fixedImport})
                }, 200);
                setTimeout(() => {
                    setPostMessage({type: "saveFile"})
                }, 400);
            }
        }
    }

    function replaceLastInstance(str, substring, replacement) {
        const index = str.lastIndexOf(substring);
        if (index === -1) {
            return str; // substring not found
        }
        return str.slice(0, index) + replacement + str.slice(index + substring.length);
    }
    

    //Reconnect websocket
    const reconnectWebsocket = async (withLocation: string) => {
        if (isReconnecting.current) return;
        isReconnecting.current = true;

        if (ws) {
            ws.close();
        }

        if(!activeProject || !testDomain || !(selectedTab == Page.Apis || selectedTab == Page.Hosting)) return;

        var fermatJwt = await endpointApi.getFermatJwt();
        fermatJwt = fermatJwt.replace("Bearer ", "");

        const path = withLocation == "frontend" ? "frontend/app.log" : "backend/server.log";
        const webSocket = new WebSocket(`wss://${testDomain.replace("https://", "fermat.")}/tail_logs?path=${path}&jwt=${fermatJwt}&initial_lines=25`);
        
        setWs(webSocket);

        isReconnecting.current = false;
    }

    useEffect(() => {
        if(didRestartRecently){
            setTimeout(() => {
                setDidRestartRecently(false)
            }, 10000);
        }
    }, [didRestartRecently])

    useEffect(() => {
        if(ws){
            let messageQueue = [];

            ws.onmessage = (event) => {
                var newLog = event.data
                messageQueue.push(...(newLog.split("\n")));
            };

            ws.onclose = (event) => {
                console.log("close", event)
            }

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
                    const datetime = new Date().getTime()
                    allMessages.forEach((lineIn, index) => {
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
                                if(currentLine.includes("ERROR in src/RouteList.tsx")){
                                    if(!didRestartRecently){
                                        setDidRestartRecently(true)
                                        toast("Restarting frontend to refresh route list cache...")
                                        endpointApi.restartFrontend()
                                    }
                                }

                                if(didRestartRecently && currentLine.includes("No issues found.")){
                                    props.reloadPreviewWindow()
                                }

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
    
                        const lineJsxElement = parseOutFilenamesAndCreateElement(filteredLine, `${datetime}_${index}`);
                        allElements.push(lineJsxElement);
                    })
                    setLog(prevLog => [...prevLog, ...allElements]);
                }
            };
            
            const intervalId = setInterval(processQueue, 100);
            return () => {
                clearInterval(intervalId);
            };    
        }
    }, [ws])

    useEffect(() => {
        setTimeout(() => {
            if(divRef.current && divRef.current.scrollHeight){
                divRef.current.scrollTop = divRef.current.scrollHeight;
            }
        }, 50);
    }, [log])


    // if(ws && (ws.readyState == ws.CLOSED || ws.readyState == ws.CLOSING)){
    //     return (
    //         <div ref={divRef} style={props.style} className="overflow-y-scroll border-t border-gray-700 py-1 mr-4 bg-[#1e1e1e]">
    //             <span className="m-auto text-center mt-2 text-sm">Socket closed</span>
    //         </div>
    //     )
    // }

//     const refreshSpinner = useRef(null)
//     const spin = () => {
//       const spinner = refreshSpinner.current
//       if (spinner) {
//         spinner.classList.add("spin-rotate");
//         setTimeout(() => {
//           spinner.classList.remove("spin-rotate");
//         }, 500);
//       }
//     }
//     {/* <div className="w-10 ml-2 mt-3">
//     <IconTextButton
//     textHidden={true}
//     onClick={() => {
//         spin()
//         toast.promise(restartFrontend(), {
//         loading: "Sending restart command...",
//         success: "Restarting!",
//         error: "Error restarting frontend",
//         });
//     }}
//     className="p-[0.57rem]"
//     icon={<img src="/restart.svg" className="w-4 h-4 m-auto" ref={refreshSpinner} />}
//     text="Restart"
//     />
// </div> */}

const getPosition = () => {
    if(selectedTab == Page.Hosting){
        if(props.isSidebarOpen){
            return "calc(40% - 76px)"
        } else{ 
            return "8px"
        }
    } else{
        if(props.isSidebarOpen){
            return "356px"
        } else{ 
            return "8px"
        }
    }
}

    return (
        <>        
        <div ref={divRef} style={props.style} className="overflow-y-scroll border-t border-gray-700 py-1 mr-4 bg-[#1e1e1e]">
            <div className="flex mt-1 z-40 fixed right-0 rounded mt-[-4px] p-1 bg-[#1e1e1e]" style={{marginRight: getPosition()}}>
                    {currentLocation == "backend" ? (
                        <div className="flex flex-col">
                            <div className="text-sm font-bold m-auto">Backend</div>
                            <div className="underline cursor-pointer" onClick={() => {toast("Restarting..."); endpointApi.restartBackend()}}>
                                Restart
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="text-sm font-bold m-auto">Frontend</div>
                            <div className="underline cursor-pointer" onClick={() => {toast("Restarting..."); endpointApi.restartFrontend()}}>
                                Restart
                            </div>
                        </div>
                    )}
                    <Switch
                        className="ml-1 my-auto scale-75 env-toggle"
                        onChange={() => {
                            if(ws){ ws.close(); }
                            setLog([]);
                            const newLocation = currentLocation == "frontend" ? "backend" : "frontend"
                            setCurrentLocation(newLocation);
                            reconnectWebsocket(newLocation)
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
                    <div id={`parent_${index}`} key={`parent_${index}`}>{entry}</div>
                )
            })}</span>
        </div>
        </>
    );
}