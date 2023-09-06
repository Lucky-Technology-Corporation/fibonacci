import { useContext, useEffect, useState } from "react";
import useApi from "../API/DatabaseAPI";
import Dropdown from "../Utilities/Dropdown";
import toast from "react-hot-toast";
import FullPageModal from "../Utilities/FullPageModal";
import { SwizzleContext } from "../Utilities/GlobalContext";

export default function ProjectSelector() {
  const [isVisible, setIsVisible] = useState(false);
  const { createProject } = useApi();
  const {
    projects,
    setProjects,
    activeProject,
    setActiveProject,
    activeProjectName,
    setActiveProjectName,
    setDomain,
    setIsCreatingProject,
    isCreatingProject,
  } = useContext(SwizzleContext);

  const createNewProject = (projectName: string) => {
    setIsCreatingProject(true);
    toast.promise(createProject(projectName), {
      loading: "Creating project...",
      success: () => {
        window.location.reload();
        return "Created project!";
      },
      error: () => {
        setIsCreatingProject(false);
        return "Failed to create project";
      },
    });
  };

  //Set the current project in the context and save it in session storage
  const setCurrentProject = (id: string) => {
    const project = projects.filter((p) => p.id == id)[0];
    if (project == null) return;

    setActiveProject(project.id);
    setActiveProjectName(project.name);
    sessionStorage.setItem("activeProject", project.id);
    sessionStorage.setItem("activeProjectName", project.name);
    if (project.test_swizzle_domain) {
      setDomain(project.test_swizzle_domain);
      sessionStorage.setItem(
        "domain",
        project.test_swizzle_domain,
      );
    }
  };

  //When projects is set, set the active project to the first project in the list or the one stored in session storage
  useEffect(() => {
    if (projects && activeProject == "" && projects.length > 0) {
      var storedActiveProject = sessionStorage.getItem("activeProject");
      if (storedActiveProject != undefined && storedActiveProject != "") {
        setCurrentProject(storedActiveProject);
      } else {
        setCurrentProject(projects[0].id);
      }
    } else {
      if (projects.length == 0) {
        setIsVisible(true);
      }
    }
  }, [projects]);

  if (projects == null) return <div className="text-sm mt-3">Loading...</div>;

  return (
    <>
      <Dropdown
        children={projects}
        onSelect={(id: string) => {
          setCurrentProject(id);
        }}
        lastChild={{
          id: "_create_new_project",
          name: "+ New Project",
        }}
        lastOnSelect={() => {
          if(isCreatingProject){ alert("A project is already being created for you now!"); return; }
          setIsVisible(true);
        }}
        className={`mt-2 ${isCreatingProject ? "opacity-70" : ""}`}
        title={activeProjectName}
      />
      <FullPageModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        regexPattern={/^[a-zA-Z][a-zA-Z0-9\s]{1,64}$/}
        errorMessage="Names must start a letter and not contain special characters."
        modalDetails={{
          title: "🥋 New project",
          description: <>Enter a name for your project</>,
          placeholder: "My awesome project",
          confirmText: "Create",
          confirmHandler: createNewProject,
          shouldShowInput: true,
          shouldHideCancel: projects.length == 0,
        }}
      />
    </>
  );
}
