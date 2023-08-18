import axios from 'axios';
import { useContext } from 'react';
import { useAuthHeader } from 'react-auth-kit';
import { SwizzleContext } from '../Utilities/GlobalContext';

// const BASE_URL = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1';
const BASE_URL = 'http://localhost:4000/api/v1';

export default function useApi() {
    const authHeader = useAuthHeader();
    const { activeProject } = useContext(SwizzleContext);

    const getData = async (startDate: string, endDate: string) => {
        try {
            if (!activeProject) {
                throw new Error("No active project selected");
            }

            const response = await axios.get(`${BASE_URL}/projects/${activeProject}/monitoring`, {
                headers: {
                    Authorization: authHeader(),
                },
                params: { 
                    project_id: activeProject,
                    start: startDate,
                    end: endDate,

                }, 
            });
            return response.data;
        } catch (e) {
            console.log(e);
            throw e;
        }
    };

    return {
        getData,
    };
}
