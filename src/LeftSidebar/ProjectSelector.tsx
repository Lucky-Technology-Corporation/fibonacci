
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

            // Move active project to the top, if it exists
            if(activeProject != null && activeProject != ""){
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

    //Set the current project in the context and save it in session storage
    const setCurrentProject = (id: string) => {
        const project = projects.filter(p => p.id == id)[0]
        if(project == null) return

        setActiveProject(project.id)
        setActiveProjectName(project.name)
        sessionStorage.setItem("activeProject", project.id)
        sessionStorage.setItem("activeProjectName", project.name)

        if(project.edges.project_vm && project.edges.project_vm.length > 0){
            setDomain(project.edges.project_vm[0].domain + ".swizzle.run")
            sessionStorage.setItem("domain", project.edges.project_vm[0].domain + ".swizzle.run")
        }
    }

    //When projects is set, set the active project to the first project in the list or the one stored in session storage
    useEffect(() => {
        if(activeProject == "" && projects.length > 0){
            var storedActiveProject = sessionStorage.getItem("activeProject")
            if(storedActiveProject != undefined && storedActiveProject != ""){
                setCurrentProject(storedActiveProject)
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