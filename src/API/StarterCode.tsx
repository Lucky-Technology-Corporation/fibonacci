export function starterEndpoint(method: string, endpoint: string, isAuthRequired: boolean){
    const fileContent = 
`import express, { Response } from "express";
import { AuthenticatedRequest, ${isAuthRequired ? "requiredAuthentication" : "optionalAuthentication"}, db } from "swizzle-js";
const router = express.Router();

router.${method}('${endpoint}', ${isAuthRequired ? "requiredAuthentication" : "optionalAuthentication"}, async (request: AuthenticatedRequest, response: Response) => {
    //Your code goes here
    return response.json({ message: "It works!" });
});

export default router;`

    return fileContent;
}

export function starterJob(endpoint: string){
    const fileContent = 
`import express, { Response } from "express";
import { AuthenticatedRequest, jobAuthentication, db } from "swizzle-js";
const router = express.Router();

router.get('${endpoint}', jobAuthentication, async (request: AuthenticatedRequest, response: Response) => {

    return response.status(200) //Return 200 to indicate success
});

export default router;`

    return fileContent;
}

export function starterHTML(){
    const fileContent = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Title</title>
    </head>
    <body>

        <!-- Your content here -->

    </body>
</html>`
    return fileContent;
}

export function starterCSS(){
    const fileContent = `/* Your CSS here */`
    return fileContent;
}

export function starterComponent(fileName: string, hasAuth: boolean, path: string, isNamed: boolean = true){
    const levels = path.split('/').length - 1;
    const apiImport = '../'.repeat(levels) + 'Api';
    
    return `import React from 'react';
import api from '${apiImport}'; //Use this to make API calls (e.g. await api.get("/endpoint"))
${hasAuth ? `import { useAuthUser } from 'react-auth-kit';
` : ``}
${isNamed ? `const ${fileName} = () => {` : `export default () => {`}
${hasAuth ? `    const auth = useAuthUser();` : ``}
    return (
        <div>
            {/* Your content here */}
        </div>
    );
};${isNamed ? `

export default ${fileName};` : ``}`
}

export function starterHelper(fileName: string){
    return `export default function ${fileName}(){

}`
}