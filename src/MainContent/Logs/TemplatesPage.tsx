import { Card } from "@tremor/react";
import { useContext, useEffect, useState } from "react";
import useTemplateApi from "../../API/TemplatesAPI";
import TemplateInputTaker from "../../LeftSidebar/APIs/TemplateInputTaker";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function TemplatesPage() {
  const { activeProject, environment } = useContext(SwizzleContext);
  const api = useTemplateApi();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    async function runFetcher(){
      var response = await api.getTemplates();
      console.log("response", response)
      setTemplates(response);
    }
    runFetcher()
  }, [])


  const getTemplates = () => {
    return (
      templates.map((template) => {
        if(searchQuery == "" || template.name.toLowerCase().includes(searchQuery.toLowerCase())){
          if(template.type == "dropin"){
            return (
              <Card className="dark-tremor h-90 !bg-[#32333b63] !rounded-md m-2 flex-grow-0 flex-shrink-0" style={{ width: 'calc(33.333% - 1rem)' }}>
                <div className="font-semibold text-lg flex">
                  <img src={template.icon_url || "/puzzle.svg"} className="w-6 h-6 mr-2 rounded my-auto" />
                  <div className="my-auto mr-auto">{template.name}</div>
                  <Button
                    text="Import"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsVisible(true);
                    }}
                  />
                </div>
                <div className="mt-2">{template.description}</div>
              </Card>
            )
          }
        }
      })
    )
  }

  return (
    <div className="h-full overflow-scroll min-h-[50vh]">
      <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
        <div>
          <div className={`font-bold text-base`}>Templates</div>
          <div className={`text-sm mt-0.5`}>Add starter code to your project</div>
        </div>
      </div>
      <div className={`flex pr-2 h-9 mb-4`}>
        <input
          type="text"
          className={`text-s, flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]`}
          placeholder={"Filter..."}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
      </div>

      <div className="px-4 pl-3 pt-1 flex flex-row flex-wrap no-focus-ring">
        {getTemplates()}
        <Card className="dark-tremor h-90 !bg-[#32333b63] !rounded-md m-2 flex-grow-0 flex-shrink-0" style={{ width: 'calc(33.333% - 1rem)' }}>
          <div className="font-semibold text-lg flex">
            <img src={"/email.svg"} className="w-6 h-6 mr-2 rounded my-auto" />
            <div className="my-auto mr-auto">Something else</div>
            <Button
              text="Request"
              onClick={() => {
                window.open("mailto:team@swizzle.co?subject=New Template Request", "_blank")
              }}
            />
          </div>
          <div className="mt-2">Request a new template from the Swizzle team</div>
        </Card>
      </div>
      
      <TemplateInputTaker 
        template={selectedTemplate}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
      />
      
    </div>
  );
}
