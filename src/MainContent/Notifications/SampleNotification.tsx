import React from "react";
import { useState } from "react";

type SampleNotificationProps = {
  appIcon?: string;
};

const SampleNotification = ({ appIcon }: SampleNotificationProps) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const saveNotification = async () => {};

  return (
    <div className="rounded-lg mb-4 shadow-lg w-90 h-20 bg-[#acacac] p-4 flex items-center space-x-4">
      <img src={appIcon || "iosicongridsmall.png"} alt="App Icon" className="w-12 h-12 rounded" />

      <div className="flex flex-col">
      <input
            type="text"
            className="text-s mb-1 font-bold h-6 text-black flex-grow p-2 bg-transparent border-[#a5a5a5] border rounded outline-0 focus:border-[#68697a] mr-2"
            placeholder={"Title"}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key == "Enter") {
              
              }
            }}
          />
          <input
            type="text"
            className="text-xs text-black flex-grow p-2 bg-transparent border-[#a5a5a5] border rounded outline-0 focus:border-[#68697a] mr-2"
            placeholder={"Body"}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key == "Enter") {
              
              }
            }}
          />
      </div>
    </div>
  );
};

export default SampleNotification;
