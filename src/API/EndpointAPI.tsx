import axios from 'axios';
import {useAuthHeader} from 'react-auth-kit'

// const BASE_URL = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1';
const BASE_URL = 'http://localhost:4000/api/v1'

export default function useApi() {
    const authHeader = useAuthHeader();

    const createAPI = async (apiName: string) => {
       return true
    };
  
    return { createAPI };
}

