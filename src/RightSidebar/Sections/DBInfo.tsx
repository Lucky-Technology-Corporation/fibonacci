import { useEffect, useRef, useState } from "react";
import ToastWindow from "../ToastWindow";
import InfoItem from "../InfoItem";
import { copyText } from "../../Utilities/Copyable";

export default function DBInfo({ show }: { show: boolean }) {
   const [isHintWindowVisible, setIsHintWindowVisible] = useState(false);
   const timerRef = useRef<number | undefined>();

   const showHintWindow = () => {
      clearTimeout(timerRef.current);
      setIsHintWindowVisible(true);
   };
   const showHintWindowIfOpen = () => {
      if (!isHintWindowVisible) return;
      clearTimeout(timerRef.current);
      setIsHintWindowVisible(true);
   };
   const hideHintWindow = () => {
      timerRef.current = window.setTimeout(() => {
         setIsHintWindowVisible(false);
      }, 300);
   };

   useEffect(() => {
      return () => {
         if (timerRef.current) {
            clearTimeout(timerRef.current);
         }
      };
   }, []);

   return (
      <>
         <div
            className={`flex-col items-center justify-between ${
               show ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
            }`}
            style={{ transition: "opacity 0.3s" }}
         >
            <InfoItem
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
                     <div className="ml-2 text-sm font-mono">db</div>
                  </>
               }
               toast={{
                  title: "db",
                  content: (
                     <div className="text-gray-400">
                        You can interact with your MongoDB instance easily.{" "}
                        <a
                           href="https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/retrieve/"
                           target="_blank"
                           rel="noreferrer"
                        >
                           Learn more
                        </a>
                        <div className="w-full h-2"></div>
                        <span className="underline">Add a document</span>
                        <br />
                        <span
                           className="font-bold font-mono text-xs break-all cursor-pointer"
                           onClick={() =>
                              copyText(
                                 `await db.collection("users").insertOne({"name": "Jimmy"})`,
                              )
                           }
                        >{`await db.collection("users").insertOne({"name": "Jimmy"})`}</span>
                        <div className="w-full h-2"></div>
                        <span className="underline">Get a document</span>
                        <br />
                        <span
                           className="font-bold font-mono text-xs break-all cursor-pointer"
                           onClick={() =>
                              copyText(
                                 `const user = await db.collection("users").findOne({"id", "0001"})`,
                              )
                           }
                        >{`const user = await db.collection("users").findOne({"name", "Jimmy"})`}</span>
                        <div className="w-full h-2"></div>
                        <span className="underline">Update the document</span>
                        <br />
                        <span
                           className="font-bold font-mono text-xs break-all cursor-pointer"
                           onClick={() =>
                              copyText(`await user.update({"name": "Steve"})`)
                           }
                        >{`await user.update({"name": "Steve"})`}</span>
                     </div>
                  ),
               }}
            />
         </div>
      </>
   );
}
