import axios from 'axios';
import {useAuthHeader} from 'react-auth-kit'

const BASE_URL = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1';

export default function useApi() {
    const authHeader = useAuthHeader();

    const getCollections = async () => {
        const projectId = localStorage.getItem("projectId");
        if(!projectId) throw new Error("No project id");
        const response = await axios.get(`${BASE_URL}/projects/${projectId}/collections`, {
            headers: {
                Authorization: authHeader(), 
            },
        });
        return response.data;
    };
  
    const getDocuments = async (activeCollection: string, page: number = 0, sortByKey: string = "") => {
        const projectId = localStorage.getItem("projectId");
        try{
            if(!projectId) throw new Error("No project id");
            const response = await axios.get(`${BASE_URL}/projects/${projectId}/collections/${activeCollection}?page=${page}&sort=${sortByKey}`, {
                headers: {
                    Authorization: authHeader(), 
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
            return {error: true, message: e.message}
        }
    };

    const updateDocument = async (id: string, data: any) => {
        // const projectId = localStorage.getItem("projectId");
        // if(!projectId) throw new Error("No project id");
        // const response = await axios.put(`${BASE_URL}/projects/${projectId}/db/${id}`, data, {
        //     headers: {
        //         Authorization: authHeader(),
        //     },
        // });
        // return response.data;
    }

    const createProject = async (name: string) => {
        const response = await axios.post(`${BASE_URL}/projects`, {name}, {
            headers: {
                Authorization: authHeader(),
            },
        });
        return response.data;
    }

    const getProjects = async () => {
        const response = await axios.get(`${BASE_URL}/projects`, {
            headers: {
                Authorization: authHeader(),
            },
        });
        return response.data;
    }
  
    return { getDocuments, updateDocument, createProject, getProjects, getCollections };
}