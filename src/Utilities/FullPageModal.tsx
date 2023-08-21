import { ReactNode, useState } from "react"

interface ModalDetails {
    title: string,
    description: ReactNode,
    placeholder: string,
    confirmText: string,
    confirmHandler: (input: string) => void
    shouldShowInput?: boolean
    shouldHideCancel?: boolean
}

export default function FullPageModal({isVisible, setIsVisible, modalDetails, regexPattern}: {isVisible: boolean, setIsVisible: (isVisible: boolean) => void, modalDetails: ModalDetails, regexPattern?: RegExp}) {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);

    const confirmHandlerInternal = async () => {
        if(modalDetails.shouldShowInput && inputValue == "") return
        modalDetails.confirmHandler(inputValue)
        setIsVisible(false)
    }

    // const regexPattern = /^[a-zA-Z][a-zA-Z0-9\s]{1,64}$/;
    const errorMessage = "Names must start a letter and not contain special characters.";

    const handleInputChange = (e) => {
        const value = e.target.value;

        setInputValue(value);

        // Check for validity
        if (!regexPattern.test(value)) {
            setError(errorMessage);
        } else {
            setError(null);
        }
    };


    return (
        <div className={`fixed z-50 inset-0 overflow-y-auto ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} aria-labelledby="modal-title" role="dialog" aria-modal="true" style={{transition: "opacity 0.2s"}}>
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-[#32333b] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-[#32333b] px-4 pt-5 pb-2 sm:p-6 sm:pb-4">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                                    {modalDetails.title}
                                </h3>
                                <div className="mt-1">
                                    <div className="text-sm text-[#D9D9D9]">
                                        {modalDetails.description}
                                    </div>
                                </div>
                                <div className={`mt-3 mb-2 ${(modalDetails.shouldShowInput) ? "" : "hidden"}`}>
                                    <input type="text" 
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        pattern="^[a-zA-z]\w{1,24}$"
                                        title="Input must start with a letter and can only contain letters, numbers, or underscores. Total length should be between 2 and 25 characters." 
                                        required
                                        className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2" placeholder={modalDetails.placeholder} 
                                        onKeyDown={(event: any) => {
                                            if(event.key == "Enter"){
                                                confirmHandlerInternal()
                                            }
                                        }
                                    } />
                                    <div className="py-2 text-red-400 text-sm">{error}</div>
                                </div>
                            </div>
                    </div>
                    <div className="bg-[#32333b] px-4 py-3 pt-0 px-6 mb-4 sm:flex sm:flex-row-reverse">
                        <button type="button" onClick={() => { if(error != null) { confirmHandlerInternal() } }} className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698] ${error ? "opacity-40" : ""} sm:ml-3 sm:w-auto sm:text-sm`}>
                            {modalDetails.confirmText}
                        </button>
                        <button type="button" onClick={() => {setIsVisible(false)}} className={`${modalDetails.shouldHideCancel ? "hidden" : ""} mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#32333b] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}