import { useState, useEffect } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import useApi from '../../API/DatabaseAPI';
import { toast } from 'react-hot-toast';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';

export default function DocumentJSON({document, collection, isVisible, setIsVisible, id, onChange}: {document: any, collection: string, isVisible: boolean, setIsVisible: (isVisible: boolean) => void, id?: string, onChange: (data: any) => void}) {
    const [data, setData] = useState(JSON.stringify(document, null, 2));
    const { updateDocument, createDocument } = useApi();
    const [isValid, setIsValid] = useState(true);
    
    useEffect(() => {
        setData(JSON.stringify(document, null, 2))
    }, [document])

    useEffect(() => {
      try{
        JSON.parse(data)
        setIsValid(true)
      }
      catch(e){
        setIsValid(false)
      }
    }, [data])


    //remove when escape is pressed
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if(event.key == "Escape"){
                setIsVisible(false)
            }
        }
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const submitData = () => {
      if(!isValid){
        toast.error("Invalid JSON")
        return
      }

      if(id){
        toast.promise(updateDocument(collection, id, JSON.parse(data)), {
            loading: "Updating document...",
            success: () => {
                onChange(JSON.parse(data))
                setIsVisible(false)
                return "Updated document!"
            },
            error: "Failed to update document"
        })
      } else{
        toast.promise(createDocument(collection, JSON.parse(data)), {
          loading: "Creating document...",
          success: (response) => {
              var newDoc = JSON.parse(data)
              newDoc._id = response.document_id
              onChange(newDoc)
              setIsVisible(false)
              return "Created document!"
          },
          error: "Failed to create document"
       })
      }
    }

    return  (
      <div className={`fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} style={{transition: "opacity 0.2s"}}>
          <div className="flex items-center justify-center min-h-screen text-center">
            <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#32333b] rounded-md p-5 z-50 w-3/5 overflow-y-scroll`}>
              <div className='pt-2'>
                <CodeEditor
                  value={data}
                  language="json"
                  placeholder="Add your JSON here"
                  onChange={(evn) => setData(evn.target.value)}
                  padding={15}
                  data-color-mode="dark"
                  style={{
                      fontSize: 12,
                      // backgroundColor: "#32333b",
                      fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                      borderRadius: 4,
                      border: "1px solid #525363",
                  }}
                />
              </div>
            <div className="bg-[#32333b] py-3 mt-2 flex flex-row justify-between">
              <div className='my-auto'>
                  {isValid ? (
                    <div className='flex'><CheckIcon className='w-6 h-6 mr-1 text-green-400' /><div className="text-base text-green-400">Valid JSON</div></div>
                  ) : (
                    <div className='flex'><XMarkIcon className='w-6 h-6 mr-1 text-red-400' /><div className="text-base text-red-400">Invalid JSON</div></div>
                  )}
              </div>
              <div>
                  <button type="button" onClick={() => {setIsVisible(false)}} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                      Cancel
                  </button>
                  {isValid && (
                    <button type="button" onClick={() => {submitData()}} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698] sm:ml-3 sm:w-auto sm:text-sm">
                        {id ? "Update" : "Create"}
                    </button>
                  )}
              </div>
              </div>
            </div>
          </div>
        </div>
  
    )
}