import { useContext, useEffect } from "react";
import { SwizzleContext } from "../../Utilities/GlobalContext";
import Dropdown from "../../Utilities/Dropdown";
import { useState } from "react";
import Button from "../../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import FullPageModal from "../../Utilities/FullPageModal";
import axios from "axios";
import useApi from "../../API/EndpointAPI";
import toast from "react-hot-toast";

export default function AppCodePage() {
    const { activeProject, environment, figmaToken, setFigmaToken } = useContext(SwizzleContext);

    const {getCodeFromFigma} = useApi()

    const languages: any = [
        { id: "swift", name: "Swift" },
        { id: "unity", name: "Unity (C#)" },
        { id: "react", name: "React (Javascript)" },
    ];
    const [selectedMethod, setSelectedMethod] = useState<string>("swift");
    const [isInputVisible, setIsInputVisible] = useState<boolean>(false);

    const authenticateAndOpen = () => {
        if(figmaToken == ""){
            const randomString = Math.random().toString(36).substring(7);
            location.href = `https://www.figma.com/oauth?client_id=4bYemRCF1wcQlAlSSDRvLD44VE3wxr&redirect_uri=https://usesilverback.com&scope=files:read&state=${randomString}&response_type=code`
        } else{ 
            setIsInputVisible(true);
        }
    }

    const importFigmaFile = async (url: string) => {
        const code = await getCodeFromFigma(url, "swift")
        
    }


    return(
        <div className="h-full overflow-scroll min-h-[50vh]">

        <div className={`flex-1 pr-2 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
          <div>
            <div className={`font-bold text-base`}>Frontend</div>
            <div className={`text-sm mt-0.5`}>Download pre-generated code linked to your backend</div>
          </div>

          <Dropdown
            className="my-auto"
            onSelect={(item: any) => {
                if(item != "swift"){
                    toast.error("Only Swift is supported for now")
                    return;
                }
                setSelectedMethod(item);
            }}
            children={languages}
            direction="right"
            title={languages.find((language: any) => language.id == selectedMethod)?.name}
            />
        </div>
       
  
        <div className="pr-2 mr-4 pl-4 pt-1 flex flex-row space-x-2">
          <table className="w-full">
            <thead className="bg-[#85869822]">
              <tr className="border-b border-[#4C4F6B]">
                <th className="text-left pl-2 py-1 font-light rounded-tl-md">File</th>
                <th className="text-left py-1 font-light ">Description</th>
                <th className="w-6 rounded-tr-md"></th>
              </tr>
            </thead>
            <tbody className="overflow-y-scroll">
                <tr>
                    <td className="py-2 pl-2 underline decoration-dotted cursor-pointer">Model.swift</td>
                    <td className="py-2">Provides the functions that call your backend</td>
                    <td className="py-2 opacity-70 cursor-pointer hover:opacity-100"><FontAwesomeIcon icon={faTrash} /></td>
                </tr>
                <tr>
                    <td className="pt-2 pl-2 flex">
                        <div className="w-42">
                            <Button text="Add from Figma" onClick={() => {authenticateAndOpen()}} />
                        </div>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
        <FullPageModal
            isVisible={isInputVisible}
            setIsVisible={setIsInputVisible}
            regexPattern={/^https:\/\/www\.figma\.com\/file\/.*node-id=(?!0-1\b).+$/}
            errorMessage="Select a specific Figma component or group and copy the link"
            modalDetails={{
                title: "Import from Figma",
                description: "Enter the Figma file URL below",
                placeholder: "https://www.figma.com/file/...",
                confirmText: "Import",
                shouldShowInput: true,
                shouldHideCancel: false,
                confirmHandler: (url: string) => {importFigmaFile(url)},
            }}
        />

      </div>  
     //https://www.figma.com/file/fkfjxzRHqwqXjHhSqTSLGK/Backend?type=design&node-id=7-841&mode=design&t=XYI7W6LwbhBzyY3l-0   
    )
}