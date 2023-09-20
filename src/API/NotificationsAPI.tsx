import axios from "axios";
import { useContext } from "react";
import { useAuthHeader } from "react-auth-kit";
import { SwizzleContext } from "../Utilities/GlobalContext";

const BASE_URL = process.env.BASE_URL;

export default function useApi() {
    const { activeProject } = useContext(SwizzleContext)
    const authHeader = useAuthHeader();

    const setNotificationKey = async (p8Key, keyID, teamID) => {
        try {
            if (!activeProject) { 
                throw new Error("No active project selected")
            }

            const payload = {
                p8_key_base64: p8Key, 
                key_id: keyID,
                developer_id: teamID
            }

            const url = `${BASE_URL}/projects/${activeProject}/setNotificationKeys`
            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: authHeader(),  
                },
            });            console.log(response)

        } catch (error) {
            console.error("Error posting notification key", error);
        }
    }
    return {setNotificationKey}
}
