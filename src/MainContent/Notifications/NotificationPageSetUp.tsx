import { useState, useEffect, useContext, useRef } from "react";
import useNotificationApi from "../../API/NotificationsAPI";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import Button from "../../Utilities/Button";

export default function NotificationPageSetUp() {
  const api = useNotificationApi();
  const { activeProject } = useContext(SwizzleContext);
  const fileInputRef = useRef(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [p8Key, setp8Key] = useState("");
  const [teamID, setTeamID] = useState("");
  const [keyID, setKeyID] = useState("");
  const [bundleID, setBundleID] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File chosen:", file.name);
      const reader = new FileReader();

      reader.onload = function (event) {
        const base64String = (event.target.result as string).split(",")[1];
        setp8Key(base64String);
      };

      reader.readAsDataURL(file);
    }
    setFileUploaded(true);
  };

  const handleKeyIDChange = (event) => {
    setKeyID(event.target.value);
  };

  const handleTeamIDChange = (event) => {
    setTeamID(event.target.value);
  };

  const handleBundleIDChange = (event) => {
    setBundleID(event.target.value);
  }

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const save = async (p8Key, keyID, teamID, bundleID) => {
    api.setNotificationKey(p8Key, keyID, teamID, bundleID);
  };

  return (
    <div className="h-full overflow-scroll">
      <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div>
          <div className={`font-bold text-base`}>Push Notifications</div>
          <div className={`text-sm mt-0.5`}>Finish setting up</div>
        </div>
      </div>

      <div className="flex justify-center items-center flex-col space-y-4">
        <div className="font-bold text-center mt-2">Add your key (read the docs)</div>

        <div className="flex justify-center items-center space-x-4 w-80">
          <div className="w-1/2">
            <Button
              text="Upload P8 Key"
              onClick={triggerFileInput}
              className="w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#33333c] text-base font-medium hover:bg-[#44464f] sm:text-sm cursor-pointer"
            />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
          </div>
          <div className={`w-1/2 text-center ${fileUploaded ? "text-green-500" : ""}`}>
            {fileUploaded ? "Uploaded" : "Not uploaded yet"}
          </div>
        </div>

        <input
          className="bg-transparent border-[#525363] w-80 border rounded outline-none focus:border-[#68697a] p-2"
          placeholder="Key ID"
          onChange={handleKeyIDChange}
        />
        <input
          className="bg-transparent border-[#525363] w-80 border rounded outline-none focus:border-[#68697a] p-2"
          placeholder="Team ID"
          onChange={handleTeamIDChange}
        />
        <input
          className="bg-transparent border-[#525363] w-80 border rounded outline-none focus:border-[#68697a] p-2"
          placeholder="Bundle ID"
          onChange={handleBundleIDChange}
        />
      </div>
      <div className="flex justify-center items-center">
        <div className="w-80 flex justify-end mt-4">
          <Button
            text="Save"
            onClick={() => save(p8Key, keyID, teamID, bundleID)}
            className="w-20 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#33333c] text-base font-medium hover:bg-[#44464f] sm:text-sm cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
