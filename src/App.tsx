import { useEffect, useState } from 'react'
import './App.css'
import { Method } from './Utilities/Method'
import Editor from './Editor'
import EditorHeader from './EditorHeader'
import RightSidebar from './RightSidebar/RightSidebar'
import { Toaster, toast } from 'react-hot-toast'
import LeftSidebar from './LeftSidebar/LeftSidebar'

function App() {
  //Auth checkbox handler
  const [prepndCode, setPrependCode] = useState("")
  const [didDeploy, setDidDeploy] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((window.navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        toast.success("Miramount autosaves your work!")
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);

    setTimeout(() => {
      toast("Try typing '/' and asking for something", {
        icon: '🔮',
        duration: 2000
      })
    }, 1000)
  
    // Clean up the effect
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };



  }, []);
  

  return (
    <>
      <div><Toaster/></div>
      <div className="grid grid-cols-[auto,1fr,auto] gap-0">

        <div className='min-w-[200px] border-r border-[#4C4F6B]'>
          <div className='flex flex-col items-center mt-4 h-screen'>
            <LeftSidebar />
          </div>
        </div>

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
