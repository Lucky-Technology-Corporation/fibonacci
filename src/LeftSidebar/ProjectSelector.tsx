
import { useContext, useEffect, useState } from 'react'
import useApi from '../API/DatabaseAPI'
import Dropdown from '../Utilities/Dropdown'
import toast from 'react-hot-toast';
import FullPageModal from '../Utilities/FullPageModal';
import { SwizzleContext } from '../Utilities/GlobalContext';


export default function ProjectSelector(){
    const [isVisible, setIsVisible] = useState(false);
    const { getProjects, createProject } = useApi();
    const { projects, setProjects, activeProject, setActiveProject, activeProjectName, setActiveProjectName } = useContext(SwizzleContext);

    useEffect(() => {  
        console.log("Getting projects...")
        getProjects().then((data) => {
            console.log("projects")
            console.log(data)
            if(data.length == 0){
                setIsVisible(true)
                setProjects([])
                return
            }
            var flexibleData = data
            if(activeProject){
                const projectIndex = flexibleData.findIndex((project: any) => project.id == activeProject)
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

    useEffect(() => {
        console.log("setting project")
        if(activeProject == "" && projects.length > 0){
            setActiveProject(projects[0].id)
            setActiveProjectName(projects[0].name)
        }
    }, [projects])        

    if(projects == null) return (<div className='text-sm mt-3'>Loading...</div>)

    return (
        <>
            <Dropdown 
                children={projects} 
                onSelect={(id: string) => {setActiveProject(id); setActiveProjectName(projects.filter(p => p.id == id)[0].name) }} 
                lastChild={{id: "_create_new_project", name: "+ New Project"}} 
                lastOnSelect={() => {setIsVisible(true)}} 
                className="mt-2" 
            />
            <FullPageModal isVisible={isVisible} setIsVisible={setIsVisible} modalDetails={{
                title:  "🥋 New project",
                description: <>Enter a name for your project</>,
                placeholder: "My awesome project",
                confirmText: "Create",
                confirmHandler: createNewProject,
                shouldShowInput: true,
                shouldHideCancel: (projects.length == 0)
            }} />
        </>
    )
}