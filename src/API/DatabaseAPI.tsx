import axios from 'axios';
import {useAuthHeader} from 'react-auth-kit'
import { SwizzleContext } from '../Utilities/GlobalContext';
import { useContext } from 'react';

// const B ASE_URL = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1';
const BASE_URL = 'http://localhost:4000/api/v1'

export default function useApi() {
    const authHeader = useAuthHeader();
    const { activeProject } = useContext(SwizzleContext);

    const getCollections = async () => {
        if(activeProject == "") return
        const response = await axios.get(`${BASE_URL}/projects/${activeProject}/collections`, {
            headers: {
                Authorization: authHeader(), 
            },
        });
        return response.data;
    };
  
    const getDocuments = async (activeCollection: string, page: number = 0, sortByKey: string = "") => {
        try{
            if(activeProject == "") return
            if(activeCollection == "") return
            const response = await axios.get(`${BASE_URL}/projects/${activeProject}/collections/${activeCollection}?page=${page}&sort=${sortByKey}`, {
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
        if(activeProject == "") return
        if(activeCollection == "") return
        try{
            const response = await axios.patch(`${BASE_URL}/projects/${activeProject}/collections/${activeCollection}/${id}`, {document: data}, {
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
        try{
            if(activeProject == "") return
            if(activeCollection == "") return
            const response = await axios.post(`${BASE_URL}/projects/${activeProject}/collections/${activeCollection}`, {document: data}, {
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
        try{
            if(activeProject == "") return
            if(activeCollection == "") return
            const response = await axios.delete(`${BASE_URL}/projects/${activeProject}/collections/${activeCollection}/${id}`, {
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
        try{
            if(activeProject == "") return
            const response = await axios.post(`${BASE_URL}/projects/${activeProject}/collections`, {name: name}, {
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
        try{
            if(activeProject == "") return
            const response = await axios.delete(`${BASE_URL}/projects/${activeProject}/collections/${name}`, {
                headers: {
                    Authorization: authHeader(), 
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
        }
    }
    
    const runEnglishSearchQuery = async (query: string, exampleDoc: string) => {
        try{
            const response = await axios.post(`${BASE_URL}/ai`, {"english_description": query, "example_doc": exampleDoc}, {
                headers: {
                    Authorization: authHeader(), 
                },
            });
            return response.data;
        } catch(e: any){
            throw e;
        }
    }  

    const runQuery = async (query: string, queryType: string, collectionName: string, sortByKey: string = "") => {
        try{
            if(activeProject == "") return
            var queryObject = {"mongo_query": query, "mongo_function": queryType}
            if(sortByKey !== ""){
                queryObject["sort"] = sortByKey
            }

            var lowercasedQueryType = queryType.toLowerCase();

            if(lowercasedQueryType === "updateone"){
                lowercasedQueryType = "update";
            } else if(lowercasedQueryType === "updatemany"){
                lowercasedQueryType = "update";
            }
            
            var url = `${BASE_URL}/projects/${activeProject}/collections/${collectionName}/${lowercasedQueryType}`

            const response = await axios.post(url, queryObject, {
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
            timeout: 180000,
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
  
    return { getDocuments, updateDocument, createProject, getProjects, getCollections, deleteDocument, createCollection, createDocument, deleteCollection, runEnglishSearchQuery, runQuery };
}

