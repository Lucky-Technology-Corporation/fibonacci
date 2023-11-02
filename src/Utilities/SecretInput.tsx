import { useEffect, useState } from "react";
import useSettingsApi from "../API/SettingsAPI";

export default function SecretInput({ name, secretName, desc, inputState, setInputState }) {
  const [showText, setShowText] = useState(false);
  const api = useSettingsApi();
  const [filledSecrets, setFilledSecrets] = useState({
    test: false,
    prod: false,
  });

  useEffect(() => {
    const checkSecrets = async () => {
      const testFilled = await isSecretFilled(secretName, "test");
      const prodFilled = await isSecretFilled(secretName, "prod");
      setFilledSecrets({
        test: testFilled,
        prod: prodFilled,
      });
    };
    checkSecrets();
  }, [secretName]);

  async function isSecretFilled(secretName: string, environment: "test" | "prod"): Promise<boolean> {
    try {
      const secrets = await api.getSecrets();

      if (!secrets) {
        console.error("Failsed to retrieve secrets");
        return false;
      }

      if (environment === "test") {
        return secrets.Test && secrets.Test[secretName] !== undefined && secrets.Test[secretName] !== "";
      } else if (environment === "prod") {
        return secrets.Prod && secrets.Prod[secretName] !== undefined && secrets.Prod[secretName] !== "";
      } else {
        console.error("Invalid environment specified");
        return false;
      }
    } catch (error) {
      console.error("Error in isSecretFilled:", error);
      return false;
    }
  }

  const updateValue = (env, value) => {
    setInputState((prevState) => ({
      ...prevState,
      [`${secretName}_${env}`]: value,
    }));
  };

  return (
    <>
      {["test", "prod"].map(
        (env) =>
          !filledSecrets[env] && (
            <div className="relative mt-4" key={secretName + "_" + env}>
              <div className="text-gray-300">{`${env == "test" ? "Test mode" : "Production mode"} ${name}`}</div>
              <input
                type={"text"}
                className="w-full mt-2 bg-transparent border rounded outline-0 p-2 border-[#525363] focus:border-[#68697a]"
                placeholder={`${desc} (${env})`}
                value={inputState[`${secretName}_${env}`] || ""}
                onChange={(e) => updateValue(env, e.target.value)}
              />
            </div>
          ),
      )}
    </>
  );
}
