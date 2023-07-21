import { useEffect, useState } from 'react'
import './App.css'
import { Method } from './Utilities/Method'
import Editor from './Editor'
import EditorHeader from './EditorHeader'
import RightSidebar from './RightSidebar/RightSidebar'
import { Toaster, toast } from 'react-hot-toast'
import LeftSidebar from './LeftSidebar/LeftSidebar'
import { Page } from './Utilities/Page'

function App() {
  //Auth checkbox handler
  const [prepndCode, setPrependCode] = useState("")
  //Deploy state handler
  const [didDeploy, setDidDeploy] = useState(false)
  //Content handler
  const [selectedTab, setSelectedTab] = useState<Page>(Page.Apis)

  return (
    <>
      <div><Toaster/></div>
      <div className="grid grid-cols-[auto,1fr,auto] gap-0">
        <LeftSidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

        <div className="m-4 ml-0 text-sm whitespace-pre-line">
          <EditorHeader method={Method.GET} path="/" didDeploy={didDeploy} />
          <Editor prepend={prepndCode} setDidDeploy={setDidDeploy} />
        </div>

        <RightSidebar setPrependCode={setPrependCode} setDidDeploy={setDidDeploy} />
        
      </div>
    </>
  )
}

export default App
