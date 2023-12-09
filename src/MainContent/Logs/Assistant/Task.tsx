import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { methodToColor } from "../../../Utilities/Method";
import TaskComponent from "./TaskComponent";

export default function Task({ task, removeTask, editTask, allTasks }: { task: any, removeTask: any, editTask: any, allTasks: any[] }) {
    switch(task.type){
        case "CreateEndpoint":
            return (
                <TaskComponent
                    removeTask={removeTask}
                    editTask={editTask}
                    task={task}
                    allTasks={allTasks}
                    headerNode={
                        <>
                            <img src="/cloud.svg" className="w-4 h-4 mr-2" />
                            <span className={`${methodToColor(undefined, task.inputs.method)} font-bold font-mono`}>{task.inputs.method}</span><span className="font-mono ml-1">{task.inputs.path}</span>
                        </>
                    }
                />
            )
        case "CreatePage":
            return (
                <TaskComponent
                    removeTask={removeTask}
                    editTask={editTask}
                    task={task}
                    allTasks={allTasks}
                    headerNode={
                        <>
                            <img src="/world.svg" className="w-4 h-4 mr-2" />
                            <span className={`${task.inputs.requiresAuth && "text-blue-200"} font-mono`}>{task.inputs.path}</span>
                            <FontAwesomeIcon
                                className={`h-2 mb-0.5 ml-1 ${task.inputs.requiresAuth ? "text-blue-200" : "hidden"}`}
                                icon={faLock}
                            />
                        </>
                    }
                />
            )
        case "CreateComponent":
            return (
                <TaskComponent
                    removeTask={removeTask}
                    editTask={editTask}
                    task={task}
                    allTasks={allTasks}
                    headerNode={
                        <>
                            <img src="/world.svg" className="w-4 h-4 mr-2" />
                            <span className={`font-mono`}>{task.inputs.name}</span>
                        </>
                    }
                />
            )    
        case "CreateHelper":
            return (
                <TaskComponent
                    removeTask={removeTask}
                    editTask={editTask}
                    task={task}
                    allTasks={allTasks}
                    headerNode={
                        <>
                            <img src="/cloud.svg" className="w-4 h-4 mr-2" />
                            <span className={`font-mono`}>{task.inputs.name}</span>
                        </>
                    }
                />
            )    
    }
}