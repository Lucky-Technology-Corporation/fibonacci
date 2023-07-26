import toast from "react-hot-toast";
import useApi from "./API/DatabaseAPI"

export default function NewAPIInput({isVisible, setIsVisible}: {isVisible: boolean, setIsVisible: (isVisible: boolean) => void}) {
    const { createCollection } = useApi();

    const createNewCollection = async () => {
        const apiName = (document.getElementById("api-name") as HTMLInputElement).value
        toast.promise(
            createCollection(apiName),
            {
                loading: "Creating API...",
                success: () => {
                    window.location.reload()
                    return "Created API!"
                },
                error: <b>Failed to create API</b>
            }
        );
        setIsVisible(false)
    }
    
    return (
        <div className={`fixed z-50 inset-0 overflow-y-auto ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} aria-labelledby="modal-title" role="dialog" aria-modal="true" style={{transition: "opacity 0.2s"}}>
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-[#32333b] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-[#32333b] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                                    New API
                                </h3>
                                <div className="mt-1">
                                    <p className="text-sm text-[#D9D9D9]">
                                        Enter the path to your new API. Use <span className="font-bold font-mono">:variable</span> to create a variable in your path.
                                    </p>
                                </div>
                                <div className="mt-3 mb-2">
                                    <input type="text" id="api-name" className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2" placeholder="/path/:variable" />
                                </div>
                            </div>
                    </div>
                    <div className="bg-[#32333b] px-4 py-3 pt-0 px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" onClick={() => {createNewCollection()}} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm">
                            Create
                        </button>
                        <button type="button" onClick={() => {setIsVisible(false)}} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}