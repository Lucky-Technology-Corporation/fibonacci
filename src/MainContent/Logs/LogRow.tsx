import { faRotateRight, faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useMonitoringApi from "../../API/MonitoringAPI";
import { copyText } from "../../Utilities/Copyable";
import { replaceCodeBlocks } from "../../Utilities/DataCaster";
import Dot from "../../Utilities/Dot";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import IconButton from "../../Utilities/IconButton";
import InfoItem from "../../Utilities/Toast/InfoItem";

export default function LogRow({
  message,
  freshLogs,
  setModalText,
  autofixButtonClassName,
}: {
  message: any;
  freshLogs: () => {};
  setModalText: (text: ReactNode) => void;
  autofixButtonClassName?: string;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [headers, setHeaders] = useState<any>({});
  const { getLogDetails, analyzeError } = useMonitoringApi();
  const { domain, environment, fullEndpointList } = useContext(SwizzleContext);

  useEffect(() => {
    setIsExpanded(false);
    setHeaders(message.request.headers);
    delete message.request.headers;
  }, [message]);

  const formatDate = (inputDateStr: string) => {
    const date = new Date(inputDateStr);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const hour = date.getHours() % 12 || 12; // Convert to 12-hour format and make it 12 instead of 0
    const minute = date.getMinutes().toString().padStart(2, "0"); // Add leading zero to single-digit minute
    const second = date.getSeconds().toString().padStart(2, "0"); // Add leading zero to single-digit second
    const ampm = date.getHours() >= 12 ? "pm" : "am";

    const formattedDate = `${month} ${day} ${hour}:${minute}:${second} ${ampm}`;
    return formattedDate;
  };

  const forbiddenHeaders = [
    "Accept-Charset",
    "Accept-Encoding",
    "Access-Control-Request-Headers",
    "Access-Control-Request-Method",
    "Connection",
    "Content-Length",
    "Cookie",
    "Cookie2",
    "Date",
    "DNT",
    "Expect",
    "Host",
    "Keep-Alive",
    "Origin",
    "Proxy-",
    "Sec-",
    "Referer",
    "TE",
    "Trailer",
    "Transfer-Encoding",
    "Upgrade",
    "Via",
    "User-Agent",
  ].map((h) => h.toLowerCase());

  function filterHeaders(headers) {
    const filteredHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      const keyLower = key.toLowerCase();
      if (
        !forbiddenHeaders.some((forbidden) => forbidden.toLowerCase() === keyLower) &&
        !keyLower.startsWith("proxy-") &&
        !keyLower.startsWith("sec-")
      ) {
        filteredHeaders[key] = value;
      }
    }
    return filteredHeaders;
  }
  const retryRequest = async () => {
    try {
      if (message.method == "GET") {
        await axios.get(domain.replace("https://", "https://api.") + message.url, {
          headers: filterHeaders(message.headers),
        });
      } else if (message.method == "POST") {
        await axios.post(domain.replace("https://", "https://api.") + message.url, message.request, {
          headers: filterHeaders(message.headers),
        });
      } else if (message.method == "PUT") {
        await axios.put(domain.replace("https://", "https://api.") + message.url, message.request, {
          headers: filterHeaders(message.headers),
        });
      } else if (message.method == "DELETE") {
        await axios.delete(domain.replace("https://", "https://api.") + message.url, {
          headers: filterHeaders(message.headers),
        });
      }
      return freshLogs();
    } catch (e) {
      return freshLogs();
    }
  };

  const explainError = async (text) => {
    setModalText(<div>{text}</div>);
  };

  const fixRequest = async () => {
    const response = await analyzeError(message);
    if (response == null) {
      return "Something went wrong";
    }
    setModalText(<div dangerouslySetInnerHTML={{ __html: replaceCodeBlocks(response.recommendation_text) }} />);
  };

  const getIconForLevel = (level: string) => {
    if (level == "error") {
      return <img src="/error.svg" className="w-4 h-4" />;
    } else if (level == "warn") {
      return <img src="/warn.svg" className="w-4 h-4" />;
    } else {
      return <img src="/log.svg" className="w-4 h-4" />;
    }
  };

  return (
    <>
      <tr
        className={`${
          isExpanded ? "border-none" : "border-b"
        } border-[#4C4F6B] h-[48px] hover:bg-[#85869855] cursor-pointer`}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <td className="text-left pl-4">
          <IconButton
            icon={<FontAwesomeIcon icon={faRotateRight} className="py-1" />}
            onClick={(e) => {
              e.stopPropagation();
              toast.promise(retryRequest(), {
                loading: "Retrying request...",
                success: () => {
                  return "Retried successfully";
                },
                error: () => {
                  return "Retried and got an error";
                },
              });
            }}
          />
        </td>
        <td className={`text-left pl-4 ${message.responseCode < 400 ? "opacity-50 pointer-events-none" : ""}`}>
          <IconButton
            icon={<FontAwesomeIcon icon={faWrench} className={`py-1 ${autofixButtonClassName}`} />}
            onClick={(e) => {
              e.stopPropagation();
              if (message.responseCode < 400) {
                toast("This request didn't return an error.");
              } else if (message.responseCode == 404) {
                const endpointPath = message.method.toLowerCase() + message.url.split("?")[0];
                var exists = fullEndpointList.includes(endpointPath);
                if (message.url.includes("/swizzle/storage")) {
                  explainError(`A 404 error means something doesn't exist. 
                    It looks like you're trying to access a file in your storage bucket. Make sure:
                    - The file actually exists in Files.\n
                    - The file is publicly accessible, or the user requesting the file has permission to access it.\n
                    - You are including the extension in the URL (e.g. /swizzle/storage/0000000.png)
                    `);
                } else {
                  explainError(`A 404 error means something doesn't exist.\n 
                      ${
                        !exists
                          ? `The endpoint ${message.method} ${
                              message.url.split("?")[0]
                            } doesn't exist in your project files. Check that you're using the correct method and don't have any typos.`
                          : `However, ${message.method} ${
                              message.url.split("?")[0]
                            } does indeed exist in your project files. There could be a few reasons for this:\n
                        ${environment == "test" && "- The test server was restarting. Try again in a few seconds."}
                        - You're returning a 404 in your code manually.
                        - You need to save the file.
                        - The file didn't exist when this request was made, but does now.
                        ${environment == "prod" ? "- You haven't deployed your changes to Production." : ""}`
                      }`);
                }
              } else if (message.responseCode == 401) {
                explainError(
                  `A 401 error means "Permission Denied". This is not neccessarily an error - if someone who isn't logged in makes a request to an endpoint that has "Require Authentication" set, the server will respond with a 401.\n\nIf this 401 was not intended, make sure the client was properly authenticated (the user is signed into the frontend).\n\nIf you're calling your backend from a mobile app or frontend not hosted on Swizzle, make sure you are adding the header "Authorization: Bearer <jwt>" and the JWT is correct and not expired.`,
                );
              } else {
                toast.promise(fixRequest(), {
                  loading: "Looking at your code...",
                  success: "Found an answer",
                  error: "Couldn't find an answer",
                });
              }
            }}
          />
        </td>

        <td className="text-left pl-4">{formatDate(message.createdAt)}</td>
        <td className="text-left pl-4">
          {message.method} {message.url.split("?")[0]}
        </td>
        <td className="text-left pl-4 font-bold">
          <div className="flex">
            <Dot
              color={message.responseCode >= 500 ? "red" : message.responseCode >= 400 ? "yellow" : "green"}
              className="ml-0 mr-2"
            />
            <div>{message.responseCode}</div>
          </div>
        </td>
        <td className={`text-left pl-4 ${message.userId == null ? "" : ""}`}>{message.userId || "None"}</td>
        <td className="text-left pl-4 flex mt-2">
          <>
            <InfoItem
              content={<div className="text-xs font-mono underline decoration-dotted">Request</div>}
              toast={{
                title: "Request details",
                content: (
                  <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap word-break break-all">
                    {JSON.stringify(message.request, null, 2)}
                  </div>
                ),
                isExpandable: true,
              }}
              onClick={() => {
                copyText(JSON.stringify(message.request, null, 2));
              }}
              position="bottom-center"
            />
            &nbsp;&nbsp;
            <div className="pt-1.5">(</div>
            <InfoItem
              content={<div className="text-xs font-mono underline decoration-dotted">headers</div>}
              toast={{
                title: "Headers",
                content: (
                  <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap word-break break-all">
                    {JSON.stringify(headers, null, 2)}
                  </div>
                ),
                isExpandable: true,
              }}
              onClick={() => {
                copyText(JSON.stringify(headers, null, 2));
              }}
              position="bottom-center"
            />
            <div className="pt-1.5">)</div>
          </>
        </td>
        <td className="text-left pl-4">
          <InfoItem
            content={<div className="text-xs font-mono underline decoration-dotted">Response</div>}
            toast={{
              title: "Response details",
              content: (
                <div className="text-gray-400 text-xs max-w-358 font-mono whitespace-pre-wrap word-break break-all">
                  {JSON.stringify(message.response, null, 2)}
                </div>
              ),
              isExpandable: true,
            }}
            onClick={() => {
              copyText(JSON.stringify(message.response, null, 2));
            }}
            position="bottom-center"
          />
        </td>
        <td className="text-left pl-4">{message.timeTaken || "?? "}ms</td>
        <td className="text-right pl-4">
          <ArrowRightIcon
            className={`w-6 h-6 ml-auto mr-2 ${isExpanded ? "rotate-90" : "rotate-0"}`}
            style={{
              transition: "transform .2s",
            }}
          />
        </td>
      </tr>
      <tr className={`${isExpanded ? "" : "hidden"} border-b border-[#4C4F6B]`}>
        <td colSpan={9} className="text-left pl-6 text-xs py-3 word-wrap max-w-full font-mono">
          <div className="font-mono">
            {(message.logs || []).map((logString, index) => {
              var log = JSON.parse(logString);
              return (
                <div className={`mb-1 flex`} key={"message-" + index}>
                  <div className="mr-2">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  <div className="mr-2">{getIconForLevel(log.level)}</div>
                  <div
                    className={
                      log.level == "error" ? "text-red-400" : log.level == "warn" ? "text-yellow-400" : "text-[#d2d3e0]"
                    }
                  >
                    {log.text}
                  </div>
                </div>
              );
            })}
          </div>
        </td>
      </tr>
    </>
  );
}
