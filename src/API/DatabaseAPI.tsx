import axios from 'axios';
import {useAuthHeader} from 'react-auth-kit'

// const BASE_URL = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1';
const BASE_URL = 'http://localhost:4000/api/v1'

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
            console.log(e)
            throw e;
        }
    };

    const updateDocument = async (activeCollection: string, id: string, data: any) => {
        var newDocument = data;
        delete newDocument._id;
        const projectId = localStorage.getItem("projectId");
        try{
            if(!projectId) throw new Error("No project id");
            const response = await axios.patch(`${BASE_URL}/projects/${projectId}/collections/${activeCollection}/${id}`, {document: data}, {
                headers: {
                    Authorization: authHeader(), 
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
        }
    }

    const createDocument = async (activeCollection: string, data: any) => {
        var newDocument = data;
        delete newDocument._id;
        const projectId = localStorage.getItem("projectId");
        try{
            if(!projectId) throw new Error("No project id");
            const response = await axios.post(`${BASE_URL}/projects/${projectId}/collections/${activeCollection}`, {document: data}, {
                headers: {
                    Authorization: authHeader(), 
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
        }
    }

    const deleteDocument = async (activeCollection: string, id: string) => {
        const projectId = localStorage.getItem("projectId");
        try{
            if(!projectId) throw new Error("No project id");
            const response = await axios.delete(`${BASE_URL}/projects/${projectId}/collections/${activeCollection}/${id}`, {
                headers: {
                    Authorization: authHeader(), 
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
        }
    }

    const createCollection = async (name: string) => {
        const projectId = localStorage.getItem("projectId");
        try{
            if(!projectId) throw new Error("No project id");
            const response = await axios.post(`${BASE_URL}/projects/${projectId}/collections`, {name: name}, {
                headers: {
                    Authorization: authHeader(), 
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
        }
    }

    const deleteCollection = async (name: string) => {
        const projectId = localStorage.getItem("projectId");
        try{
            if(!projectId) throw new Error("No project id");
            const response = await axios.delete(`${BASE_URL}/projects/${projectId}/collections/${name}`, {
                headers: {
                    Authorization: authHeader(), 
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
        }
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
        try {
            const response = await axios.get(`${BASE_URL}/projects`, {
                headers: {
                    Authorization: authHeader(),
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
        }
    }
  
    return { getDocuments, updateDocument, createProject, getProjects, getCollections, deleteDocument, createCollection, createDocument, deleteCollection };
}

