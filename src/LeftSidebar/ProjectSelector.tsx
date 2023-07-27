
import { useEffect, useState } from 'react'
import useApi from '../API/DatabaseAPI'
import Dropdown from '../Utilities/Dropdown'
import toast from 'react-hot-toast';
import FullPageModal from '../Utilities/FullPageModal';


export default function ProjectSelector(){
    const [projects, setProjects] = useState<any[] | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { getProjects, createProject } = useApi();

    useEffect(() => {  
        getProjects().then((data) => {
            if(data.length == 0){
                setIsVisible(true)
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
        }).catch((e) => {
            toast.error("Error fetching projects")
            console.log(e)
            //TODO: decide if we should sign out here...
        })
    }, [])

    const createNewProject = (projectName: string) => {
        toast.promise(
            createProject(projectName),
            {
                loading: "Creating project...",
                success: () => {
                    window.location.reload()
                    return "Created project!"
                },
                error: "Failed to create project"
            }
        );
    }


    if(projects == null) return (<div className='text-sm mt-3'>Loading...</div>)

    return (
        <>
            <Dropdown 
                children={projects} 
                onSelect={(id: string) => {localStorage.setItem("projectId", id); location.reload(); }} 
                lastChild={{id: "_create_new_project", name: "+ New Project"}} 
                lastOnSelect={() => {setIsVisible(true)}} 
                className="mt-2" 
            />
            <FullPageModal isVisible={isVisible} setIsVisible={setIsVisible} modalDetails={{
                title:  "New project",
                description: <>Enter a name for your project</>,
                placeholder: "My awesome project",
                confirmText: "Create",
                confirmHandler: createNewProject
            }} />
        </>
    )
}