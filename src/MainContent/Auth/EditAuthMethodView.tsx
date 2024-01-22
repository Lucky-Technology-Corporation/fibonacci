import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useSettingsApi from "../../API/SettingsAPI";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import TailwindModal from "../../Utilities/TailwindModal";

export default function EditAuthMethodView({method}: {method: string}){

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appId, setAppId] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  
  const { getSecrets, saveSecrets, deleteSecret } = useSettingsApi();
  const { setShouldRefreshAuth, setActiveAuthPage } = useContext(SwizzleContext);

  const isLoading = useRef<boolean>(false);
  useEffect(() => {
    if(isLoading.current) return;
    isLoading.current = true;
    toast.promise(getSecrets().then((secrets) => {
      if (secrets == null) return;
      Object.keys(secrets.test).forEach((secretKey: string) => {
        if(secretKey == "GOOGLE_APP_ID"){
          setAppId(secrets.test[secretKey]);
        } else if(secretKey == "FACEBOOK_APP_ID"){
          setAppId(secrets.test[secretKey]);
        }

        if(secretKey == "TOKEN_EXPIRY"){
          setExpiry(secrets.test[secretKey]);
        }
      })

      if(expiry == ""){
        setExpiry("24");
      }

      isLoading.current = false;
    }), {
      loading: "Loading...",
      success: "Loaded",
      error: "Error loading",
    })
  }, [])

  const runDeleteProcess = async () => {
    var secretName = ""
    if(method == "google"){
      secretName = "GOOGLE_APP_ID";
    } else if(method == "facebook"){
      secretName = "FACEBOOK_APP_ID";
    } else if(method == "email"){
      secretName = "SWIZZLE_EMAIL_PASSWORD";
    }
    console.log("run delete", secretName)
    toast.promise(deleteSecret(secretName), 
    {
      loading: "Deleting...",
      success: () => {
        setShouldRefreshAuth(prev => !prev)
        setActiveAuthPage("list")
        return "Deleted"
      },
      error: "Error deleting",
    })
  }

  const saveNewDetails = async () => {
    let secrets = {
      test: {},
      prod: {}
    }
    if(method == "google"){
      secrets.test["GOOGLE_APP_ID"] = appId;
      secrets.prod["GOOGLE_APP_ID"] = appId;
    } else if(method == "facebook"){
      secrets.test["FACEBOOK_APP_ID"] = appId;
      secrets.prod["FACEBOOK_APP_ID"] = appId;
    }

    secrets.test["TOKEN_EXPIRY"] = expiry;
    secrets.prod["TOKEN_EXPIRY"] = expiry;

    toast.promise(saveSecrets(secrets), 
    {
      loading: "Saving...",
      success: "Saved",
      error: "Error saving",
    })
  }

  if(method == "google"){
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg font-bold">Google Login</div>
        <div className="flex flex-col items-center justify-center mt-4">
          <div>
            <div className="text-sm font-medium">Google Client ID</div>
            <div className="text-sm text-grey-600 mb-1">Get this from the <a href='https://console.cloud.google.com/apis/credentials' target='_blank'>Google Cloud Console</a></div>
            <input className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2" value={appId} onChange={(e) => {setAppId(e.target.value)}} />
          </div>
          <div>
            <div className="text-sm font-medium mt-4">Expiry</div>
            <div className="text-sm text-grey-600 mb-1">Hours a user can stay signed in without re-authenticating</div>
            <input className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2" value={expiry} onChange={(e) => {setExpiry(e.target.value)}} />
          </div>
          <div className="flex space-between align-middle mt-4 w-full">
            <div className="text-sm font-medium text-red-400 cursor-pointer my-auto mr-auto" onClick={() => setShowDeleteModal(true)}>Remove Google</div>
            <Button
              className="ml-auto text-sm px-4 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border" 
              onClick={saveNewDetails}
              text="Update"
            />
          </div>
        </div>
        <TailwindModal
          open={showDeleteModal}
          setOpen={setShowDeleteModal}
          title="Remove Google Login"
          subtitle="Are you sure you want to remove Google Login? Users will no longer be able to sign in with Google until you re-add it."
          confirmButtonText="Remove"
          confirmButtonAction={() => {
            toast.promise(runDeleteProcess(), {
              loading: "Deleting...",
              success: "Deleted",
              error: "Error deleting",
            });
          }}
        />
      </div>
    )
  } else if(method == "facebook"){
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg font-bold">Facebook Login</div>
        <div className="flex flex-col items-center justify-center mt-4">
          <div>
            <div className="text-sm font-medium">Facebook App ID</div>
            <div className="text-sm text-grey-600 mb-1">Get this from the <a href='https://console.cloud.google.com/apis/credentials' target='_blank'>Google Cloud Console</a></div>
            <input className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2" value={appId} onChange={(e) => {setAppId(e.target.value)}} />
          </div>
          <div>
            <div className="text-sm font-medium mt-4">Expiry</div>
            <div className="text-sm text-grey-600 mb-1">Hours a user can stay signed in without re-authenticating</div>
            <input className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2" value={expiry} onChange={(e) => {setExpiry(e.target.value)}} />
          </div>
          <div>
            <div className="text-sm font-medium mt-4 text-red-400 cursor-pointer" onClick={() => setShowDeleteModal(true)}>Remove Facebook</div>
          </div>
        </div>
        <TailwindModal
          open={showDeleteModal}
          setOpen={setShowDeleteModal}
          title="Remove Facebook Login"
          subtitle="Are you sure you want to remove Facebook Login? Users will no longer be able to sign in with Facebook until you re-add it."
          confirmButtonText="Remove"
          confirmButtonAction={() => {
            toast.promise(runDeleteProcess(), {
              loading: "Deleting...",
              success: "Deleted",
              error: "Error deleting",
            });
          }}
        />
      </div>
    )
  } else if(method == "email"){
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg font-bold">Email Login</div>
        <div className="flex flex-col items-center justify-center mt-4">
          <div>
            <div className="text-sm font-medium mt-4">Expiry</div>
            <div className="text-sm text-grey-600 mb-1">Hours a user can stay signed in without re-authenticating</div>
            <input className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2" value={expiry} onChange={(e) => {setExpiry(e.target.value)}} />
          </div>
          <div>
            <div className="text-sm font-medium mt-4 text-red-400 cursor-pointer" onClick={() => setShowDeleteModal(true)}>Remove Email</div>
          </div>
        </div>
        <TailwindModal
          open={showDeleteModal}
          setOpen={setShowDeleteModal}
          title="Remove Email Login"
          subtitle="Are you sure you want to remove Email Login? Users will no longer be able to sign in with an email until you re-add it."
          confirmButtonText="Remove"
          confirmButtonAction={() => {
            toast.promise(runDeleteProcess(), {
              loading: "Deleting...",
              success: "Deleted",
              error: "Error deleting",
            });
          }}
        />
      </div>
    )
  }

  return <></>
}