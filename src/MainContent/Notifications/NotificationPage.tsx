import NotificationPageSetUp from "./NotificationPageSetUp";
import NotificationControls from "./NotificationControls";
import { useState } from "react";

export default function NotificationPage() {
  const [setUp, setSetup] = useState(true);

  return (
    <NotificationControls ></NotificationControls>
  );
  
}
