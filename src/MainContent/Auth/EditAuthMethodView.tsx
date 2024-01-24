import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useSettingsApi from "../../API/SettingsAPI";
import Button from "../../Utilities/Button";
import { copyText } from "../../Utilities/Copyable";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import TailwindModal from "../../Utilities/TailwindModal";

export default function EditAuthMethodView({ method }: { method: string }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appId, setAppId] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");

  const { getSecrets, saveSecrets, deleteSecret } = useSettingsApi();
  const { setShouldRefreshAuth, setActiveAuthPage, testDomain, prodDomain } = useContext(SwizzleContext);

  const isLoading = useRef<boolean>(false);
  useEffect(() => {
    if (method == null || method == "" || method == "email") return;
    if (isLoading.current) return;
    isLoading.current = true;
    toast.promise(
      getSecrets().then((secrets) => {
        if (secrets == null) return;
        Object.keys(secrets.test).forEach((secretKey: string) => {
          if (method == "google" && secretKey == "GOOGLE_APP_ID") {
            setAppId(secrets.test[secretKey]);
          } else if (method == "facebook" && secretKey == "FACEBOOK_APP_ID") {
            setAppId(secrets.test[secretKey]);
          }

          if (secretKey == "TOKEN_EXPIRY") {
            setExpiry(secrets.test[secretKey]);
          }
        });

        if (expiry == "") {
          setExpiry("24");
        }

        isLoading.current = false;
      }),
      {
        loading: "Loading...",
        success: "Loaded",
        error: "Error loading",
      },
    );
  }, [method]);

  const runDeleteProcess = async () => {
    var secretName = "";
    if (method == "google") {
      secretName = "GOOGLE_APP_ID";
    } else if (method == "facebook") {
      secretName = "FACEBOOK_APP_ID";
    } else if (method == "email") {
      secretName = "SWIZZLE_EMAIL_PASSWORD";
    }

    toast.promise(deleteSecret(secretName), {
      loading: "Deleting...",
      success: () => {
        setShouldRefreshAuth((prev) => !prev);
        setActiveAuthPage("list");
        return "Deleted";
      },
      error: "Error deleting",
    });
  };

  const saveNewDetails = async () => {
    let secrets = {
      test: {},
      prod: {},
    };
    if (method == "google") {
      secrets.test["GOOGLE_APP_ID"] = appId;
      secrets.prod["GOOGLE_APP_ID"] = appId;
    } else if (method == "facebook") {
      secrets.test["FACEBOOK_APP_ID"] = appId;
      secrets.prod["FACEBOOK_APP_ID"] = appId;
    }

    secrets.test["TOKEN_EXPIRY"] = expiry;
    secrets.prod["TOKEN_EXPIRY"] = expiry;

    toast.promise(saveSecrets(secrets), {
      loading: "Saving...",
      success: "Saved",
      error: "Error saving",
    });
  };

  const getAuthMethodInputs = () => {
    if (method == "google") {
      return (
        <div className="flex flex-col items-center justify-center h-full mr-4">
          <div className="text-lg font-bold">Google Credentials</div>
          <div className="text-sm text-gray-400 mb-1">
            Get these values <b>from</b> the{" "}
            <a href="https://docs.swizzle.co/frontend/users/google-setup" target="_blank">
              Google Cloud Console
            </a>
          </div>
          <div className="flex flex-col items-center justify-center mt-4">
            <div>
              <div className="text-sm font-medium">Google Client ID</div>
              <input
                className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] mt-1 p-2"
                value={appId}
                onChange={(e) => {
                  setAppId(e.target.value);
                }}
              />
            </div>
            <div>
              <div className="text-sm font-medium mt-4">Expiry</div>
              <div className="text-sm text-gray-400 mb-1">
                Hours a user can stay signed in without re-authenticating
              </div>
              <input
                className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] mt-1 p-2"
                value={expiry}
                onChange={(e) => {
                  setExpiry(e.target.value);
                }}
              />
            </div>
            <div className="flex space-between align-middle mt-4 w-full">
              <div
                className="text-sm font-medium text-red-400 cursor-pointer my-auto mr-auto"
                onClick={() => setShowDeleteModal(true)}
              >
                Remove Google
              </div>
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
      );
    } else if (method == "facebook") {
      return (
        <div className="flex flex-col items-center justify-center h-full mr-4">
          <div className="text-lg font-bold">Facebook Credentials</div>
          <div className="text-sm text-gray-400 mb-1">
            Get these values <b>from</b> the{" "}
            <a href="https://docs.swizzle.co/frontend/users/facebook-setup" target="_blank">
              Facebook Developer Portal
            </a>
          </div>
          <div className="flex flex-col items-center justify-center mt-4">
            <div>
              <div className="text-sm font-medium">Facebook App ID</div>
              <input
                className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] mt-1 p-2"
                value={appId}
                onChange={(e) => {
                  setAppId(e.target.value);
                }}
              />
            </div>
            <div>
              <div className="text-sm font-medium mt-4">Expiry</div>
              <div className="text-sm text-gray-400 mb-1">
                Hours a user can stay signed in without re-authenticating
              </div>
              <input
                className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] mt-1 p-2"
                value={expiry}
                onChange={(e) => {
                  setExpiry(e.target.value);
                }}
              />
            </div>
            <div className="flex space-between align-middle mt-4 w-full">
              <div
                className="text-sm font-medium mt-4 text-red-400 cursor-pointer"
                onClick={() => setShowDeleteModal(true)}
              >
                Remove Facebook
              </div>
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
      );
    } else if (method == "email") {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-lg font-bold">Email Login</div>
          <div className="flex flex-col items-center justify-center">
            <div>
              <div className="text-sm font-medium mt-4">Expiry</div>
              <div className="text-sm text-gray-400 mb-1">
                Hours a user can stay signed in without re-authenticating
              </div>
              <input
                className="w-96 bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] mt-1 p-2"
                value={expiry}
                onChange={(e) => {
                  setExpiry(e.target.value);
                }}
              />
            </div>
            <div>
              <div
                className="text-sm font-medium mt-4 text-red-400 cursor-pointer"
                onClick={() => setShowDeleteModal(true)}
              >
                Remove Email
              </div>
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
      );
    }
  };

  const getJsOriginText = () => {
    if (method == "google") {
      return "Authorized JavaScript origins";
    } else if (method == "facebook") {
      return "Allowed Domains for the JavaScript SDK";
    }
  };
  const getRedirectUriText = () => {
    if (method == "google") {
      return "Authorized Redirect URIs";
    } else if (method == "facebook") {
      return "Valid OAuth Redirect URIs";
    }
  };

  const getAuthMethodOutputs = () => {
    if (method == "email") {
      return <></>;
    }
    return (
      <div className="ml-4">
        <div className="flex flex-col items-top justify-left">
          <div className="text-center">
            <div className="text-lg font-bold">URIs</div>
            {method == "google" && (
              <div className="text-sm text-gray-400 mb-1">
                Paste these values <b>into</b> the{" "}
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank">
                  Google Cloud Console
                </a>
              </div>
            )}
            {method == "facebook" && (
              <div className="text-sm text-gray-400 mb-1">
                Paste these values <b>into</b> the{" "}
                <a href="https://developers.facebook.com/apps" target="_blank">
                  Facebook Developer Portal
                </a>
              </div>
            )}
          </div>

          {/* JS origins not needed for facebook or email, but maybe for other methods */}
          {method == "google" && (
            <>
              <div className="text-sm font-medium mt-4">{getJsOriginText()}</div>
              <div
                className="w-96 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2 mt-1 truncate cursor-pointer"
                onClick={() => {
                  copyText(`${testDomain}`);
                }}
              >
                {testDomain}
              </div>
              <div
                className="w-96 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2 mt-2 truncate cursor-pointer"
                onClick={() => {
                  copyText(`${prodDomain}`);
                }}
              >
                {prodDomain}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-top justify-left">
          <div className="text-sm font-medium mt-4">{getRedirectUriText()}</div>
          <div
            className="w-96 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2 mt-1 truncate cursor-pointer"
            onClick={() => {
              copyText(`${testDomain}/d/auth/${method}`);
            }}
          >
            {testDomain}/d/auth/{method}
          </div>
          <div
            className="w-96 bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2 mt-2 truncate cursor-pointer"
            onClick={() => {
              copyText(`${prodDomain}/d/auth/${method}`);
            }}
          >
            {prodDomain}/d/auth/{method}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row items-top justify-center h-full">
      {getAuthMethodInputs()}
      {getAuthMethodOutputs()}
    </div>
  );
}
