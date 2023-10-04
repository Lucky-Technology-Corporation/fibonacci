import InfoItem from "../../Utilities/Toast/InfoItem";
import { copyText } from "../../Utilities/Copyable";

export default function DBInfo({ show }: { show: boolean }) {
  return (
    <>
      <div
        className={`flex-col items-center justify-between ${
          show ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
        }`}
        style={{ transition: "opacity 0.3s" }}
      >
        <InfoItem
          position="top-left"
          content={
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#D2D3E0"
                viewBox={`0 0 50 50`}
                width={`${14}px`}
                height={`${14}px`}
              >
                <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z" />
              </svg>
              <div className="ml-2 text-xs font-mono">sendNotification</div>
            </>
          }
          toast={{
            title: "sendNotification()",
            isLarge: true,
            content: (
              <div className="text-gray-400">
                Send push notifications automatically. <div className="w-full h-2"></div>
                <span className="underline">Send a standard notification</span>
                <br />
                <span
                  className="font-bold font-mono text-xs break-all cursor-pointer"
                  onClick={() => copyText(`sendNotification(userId, "Title", "Notification Body")`)}
                >{`sendNotification(userId, "Title", "Notification Body")`}</span>
                <div className="w-full h-2"></div>
                <span className="underline">Change the app badge number to "2"</span>
                <br />
                <span
                  className="font-bold font-mono text-xs break-all cursor-pointer"
                  onClick={() => copyText(`sendNotification(userId, "Title", "Notification Body", 2)`)}
                >{`sendNotification(userId, "Title", "Notification Body", 2)`}</span>
              </div>
            ),
          }}
        />
      </div>
    </>
  );
}
