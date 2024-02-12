import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import useEndpointApi from "../../API/EndpointAPI"
import useJarvis from "../../API/JarvisAPI"
import Button from "../../Utilities/Button"

export default function InlineAssistantUI({position, setPosition, currentFileProperties}:  {position: {x: number, y: number, line: number, column: number}, setPosition: any, currentFileProperties: any}){

  const [codeContent, setCodeContent] = useState("")
  const [prompt, setPrompt] = useState("")
  
  const { getFile } = useEndpointApi()
  const { addSnippet } = useJarvis()

  const getCodeAndAddComment = async () => {
    var fileContentWithComment = ""
    if (currentFileProperties && currentFileProperties.fileUri) {
      const currentFile = currentFileProperties.fileUri.replace("file:///swizzle/code/", "");
      const fileContent = await getFile(currentFile)
      var lineIterator = 0
      fileContent.split("\n").forEach((line: string) => {
        lineIterator += 1
        if(lineIterator == position.line){
          var lineWithComment = line.substring(0, position.column) + "/* SNIPPET GOES HERE */" + line.substring(position.column)
          fileContentWithComment += lineWithComment
        } else{
          fileContentWithComment += line
        }
      })
    }
    return fileContentWithComment
  }

  useEffect(() => {
    if(position != null){
      getCodeAndAddComment().then(content => {
        setCodeContent(content)
      })
    }
  }, [position])

  const runAi = () => {
    toast.promise(addSnippet(prompt, codeContent), {
      loading: "Thinking...",
      success: () => {
        //reload file if we used euler, replaceText if we're doing that instead
        return "Success"
      },
      error: "An error occured"
    })
  }


  if(position == null) return <></>
  return (
    <div style={{position: "fixed", top: (position.y + 200) + "px", left: (position.x + 200) + "px" }}>
      <div className="bg-[#252629] border border-[#525363] w-[50vw] rounded-lg shadow-lg p-4">
      <div className="flex">
        <FontAwesomeIcon icon={faXmark} className="text-[#D9D9D9] cursor-pointer my-auto mr-1" onClick={() => {
          setPosition(null)
        }}/>
        <div className="text-[#D9D9D9]">Add code here</div>
      </div>
        <div className="flex mt-2">
          <input
            className="w-full bg-transparent border rounded outline-0 py-1 px-2 border-[#525363] focus:border-[#68697a]"
            placeholder={"Prompt AI"}
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value) }}
            onKeyDown={(event: any) => {
              if (event.key == "Enter") {
                runAi()
              }
            }}
          />
          <Button
            text={"Add Code"}
            className="ml-2 my-auto text-sm px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
            onClick={() => {
              runAi()
            }}
          />
        </div>
      </div>
    </div>
  )
}