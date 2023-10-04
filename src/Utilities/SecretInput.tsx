import { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useApi from "../API/SettingsAPI";

export default function SecretInput({ name, desc, inputState, setInputState }) {
    const [showText, setShowText] = useState(false);
    const api = useApi();
    const [filledSecrets, setFilledSecrets] = useState({
        test: false,
        prod: false,
    });

    useEffect(() => {
        const checkSecrets = async () => {
            const testFilled = await isSecretFilled(name, "test");
            const prodFilled = await isSecretFilled(name, "prod");
            setFilledSecrets({
                test: testFilled,
                prod: prodFilled,
            });
        };
        checkSecrets();
    }, [name]);

    async function isSecretFilled(name: string, environment: "test" | "prod"): Promise<boolean> {
        try {
            const secrets = await api.getSecrets();
            
            if (!secrets) {
                console.error("Failsed to retrieve secrets");
                return false;
            }

            if (environment === "test") {
                return secrets.Test[name] !== undefined && secrets.Test[name] !== "";
            } else if (environment === "prod") {
                return secrets.Prod[name] || false;
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
        [`${name}_${env}`]: value,
      }));
    };
  
    return (
        <>
            {["test", "prod"].map((env) => (
                !filledSecrets[env] && (
                    <div className="relative mt-4" key={env}>
                        <div className="text-gray-300">{`${desc} (${env})`}</div>
                        <input
                            type={showText ? "text" : "password"}
                            className="w-full mt-2 bg-transparent border rounded outline-0 p-2 border-[#525363] focus:border-[#68697a]"
                            placeholder={`${desc} (${env})`}
                            value={inputState[`${name}_${env}`] || ""}
                            onChange={(e) => updateValue(env, e.target.value)}
                        />
                        <span
                            className="absolute right-3 mt-5 cursor-pointer"
                            onClick={() => setShowText(prev => !prev)}
                        >
                            {showText ? <FiEye /> : <FiEyeOff />}
                        </span>
                    </div>
                )
            ))}
        </>
    );
}