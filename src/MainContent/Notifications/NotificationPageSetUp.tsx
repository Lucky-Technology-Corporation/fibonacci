import { useState, useRef } from "react";
import useNotificationApi from "../../API/NotificationsAPI";
import Button from "../../Utilities/Button";
import toast from "react-hot-toast";

type NotificationPageSetUpProps = {
  setShowSetUp: (value: boolean) => void;
  savedP8Key?: string;
  savedKeyID?: string;
  savedTeamID?: string;
  savedBundleID?: string;
};

export default function NotificationPageSetUp({
  setShowSetUp,
  savedP8Key,
  savedKeyID,
  savedTeamID,
  savedBundleID,
}: NotificationPageSetUpProps) {
  const api = useNotificationApi();
  const fileInputRef = useRef(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [p8Key, setp8Key] = useState(savedP8Key || "");
  const [teamID, setTeamID] = useState(savedTeamID || "");
  const [keyID, setKeyID] = useState(savedKeyID || "");
  const [bundleID, setBundleID] = useState(savedBundleID || "");

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
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const save = async (p8Key, keyID, teamID, bundleID) => {
    try {
      await api.setNotificationKey(p8Key, keyID, teamID, bundleID);
      setShowSetUp(false);
    } catch (error) {
      toast.error("Error saving settings");
      console.error("Error in saving:", error);
    }
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
          <div className={`w-1/2 text-center ${fileUploaded || savedP8Key ? "text-green-500" : ""}`}>
            {fileUploaded || savedP8Key ? "Uploaded" : "Not uploaded yet"}
          </div>
        </div>

        <input
          className="bg-transparent border-[#525363] w-80 border rounded outline-none focus:border-[#68697a] p-2"
          placeholder={savedKeyID || "Key ID"}
          onChange={handleKeyIDChange}
        />
        <input
          className="bg-transparent border-[#525363] w-80 border rounded outline-none focus:border-[#68697a] p-2"
          placeholder={savedTeamID || "Team ID"}
          onChange={handleTeamIDChange}
        />
        <input
          className="bg-transparent border-[#525363] w-80 border rounded outline-none focus:border-[#68697a] p-2"
          placeholder={savedBundleID || "Bundle ID"}
          onChange={handleBundleIDChange}
        />
      </div>
      <div className="flex justify-center items-center">
        <div className="w-80 flex justify-end mt-4">
          <Button
            text="Cancel"
            onClick={() => setShowSetUp(false)}
            className={`${
              savedBundleID && savedKeyID && savedP8Key && savedTeamID ? "" : "hidden"
            } mr-2 w-20 inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 text-base font-medium hover:bg-[#44464f] sm:text-sm cursor-pointer`}
          />
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
