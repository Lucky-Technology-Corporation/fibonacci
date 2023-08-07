
import { useContext, useEffect, useState } from 'react'
import useApi from '../API/DatabaseAPI'
import Dropdown from '../Utilities/Dropdown'
import toast from 'react-hot-toast';
import FullPageModal from '../Utilities/FullPageModal';
import { SwizzleContext } from '../Utilities/GlobalContext';


export default function ProjectSelector(){
    const [isVisible, setIsVisible] = useState(false);
    const { getProjects, createProject } = useApi();
    const { projects, setProjects, activeProject, setActiveProject, activeProjectName, setActiveProjectName, setDomain } = useContext(SwizzleContext);

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

    const setCurrentProject = (id: string) => {
        const project = projects.filter(p => p.id == id)[0]

        setActiveProject(project.id)
        setActiveProjectName(project.name)
        sessionStorage.setItem("activeProject", project.id)
        sessionStorage.setItem("activeProjectName", project.name)

        if(project.edges.project_vm && project.edges.project_vm.length > 0){
            setDomain(project.edges.project_vm[0].domain + ".swizzle.run")
            sessionStorage.setItem("domain", project.edges.project_vm[0].domain + ".swizzle.run")
        }
    }

    useEffect(() => {
        if(activeProject == "" && projects.length > 0){
            if(sessionStorage.getItem("activeProject")){
                setActiveProject(sessionStorage.getItem("activeProject")!)
                setActiveProjectName(sessionStorage.getItem("activeProjectName")!)
                setDomain(sessionStorage.getItem("domain")!)
                
            } else {
                setCurrentProject(projects[0].id)
            }
        }
    }, [projects])        

    if(projects == null) return (<div className='text-sm mt-3'>Loading...</div>)

    return (
        <>
            <Dropdown 
                children={projects} 
                onSelect={(id: string) => { setCurrentProject(id) }} 
                lastChild={{id: "_create_new_project", name: "+ New Project"}} 
                lastOnSelect={() => {setIsVisible(true)}} 
                className="mt-2" 
                title={activeProjectName}
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