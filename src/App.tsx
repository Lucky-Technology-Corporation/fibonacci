import Hotjar from '@hotjar/browser';
import { loadIntercom } from "next-intercom";
import { useEffect } from "react";
import { AuthProvider } from "react-auth-kit";
import "./App.css";
import Dashboard from "./Dashboard";
import { GlobalContextProvider } from "./Utilities/GlobalContext";

function App() {

  useEffect(() => {
    loadIntercom({
      appId: "cxvvsphp",
      email: "",
      name: "",
      ssr: false,
      initWindow: true,
      delay: 0,
    });

    const siteId = 3734575;
    const hotjarVersion = 6;
    Hotjar.init(siteId, hotjarVersion);
  }, [])

  return (
    <AuthProvider
      authType={"cookie"}
      authName={"_auth"}
      cookieDomain={window.location.hostname}
      cookieSecure={window.location.protocol === "https:"}
    >
      <GlobalContextProvider>
        <Dashboard />
      </GlobalContextProvider>
    </AuthProvider>
  );
}

export default App;
