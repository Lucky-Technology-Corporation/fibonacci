import EndpointList from "./Endpoints/EndpointList";
import SectionHeader from "./SectionHeader";

export default function LeftSidebar({}: {}){
    return (
        <>
            <div className="flex"><h1 className="font-bold text-md">Project Name</h1></div>
            <SectionHeader icon="database.svg" text="Database" active={false} />
            <SectionHeader icon="gear.svg" text="Endpoints" active={true} />
            <EndpointList />
        </>
    )
}