
import { useEffect, useState } from 'react'
import useApi from '../API/DatabaseAPI'
import Dropdown from '../Utilities/Dropdown'
import NewProjectInput from '../NewResourceModals/NewProjectInput';


export default function ProjectSelector(){
    const [projects, setProjects] = useState(null);
    const [isProjectCreatorOpen, setIsProjectCreatorOpen] = useState(false);
    const { getProjects } = useApi();

    useEffect(() => {  
        getProjects().then((data) => {
            if(data.length == 0){
                setIsProjectCreatorOpen(true)
                setProjects([])
                return
            }
            var flexibleData = data
            const projectId = localStorage.getItem("projectId")
            if(projectId){
                const projectIndex = flexibleData.findIndex((project: any) => project.id == projectId)
                if(projectIndex != -1){
                    const project = flexibleData[projectIndex]
                    flexibleData.splice(projectIndex, 1)
                    flexibleData.unshift(project)
                }
            }
            setProjects(flexibleData);
        })
    }, [])


    if(projects == null) return (<div className='text-sm mt-3'>Loading...</div>)

    return (
        <>
            <Dropdown 
                children={projects} 
                onSelect={(id: string) => {localStorage.setItem("projectId", id); location.reload(); }} 
                lastChild={{id: "_create_new_project", name: "+ New Project"}} 
                lastOnSelect={() => {setIsProjectCreatorOpen(true)}} 
                className="mt-2" 
            />
            <NewProjectInput isVisible={isProjectCreatorOpen} setIsVisible={setIsProjectCreatorOpen} />
        </>
    )
}