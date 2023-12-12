import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSettingsApi from '../API/SettingsAPI';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
}

export default function AddEmailModal({
    isOpen,
    onClose,
    title = "Finish setting up",
    confirmText = "Close"
  }: ModalProps) {  
    
    const [email, setEmail] = useState<string>("");
    const [projectType, setProjectType] = useState<string>("");

    const { addEmailToAccount } = useSettingsApi();

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={`absolute top-0 left-0 w-full h-full z-50 overflow-y-auto ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            style={{ transition: "opacity 0.2s" }}
        >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
            </span>
            <div className="inline-block align-bottom bg-[#32333b] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-[#32333b] px-4 pt-5 pb-2 sm:p-6 sm:pb-4">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg leading-4 font-medium text-[#D9D9D9]" id="modal-title">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className='text-sm mt-2 mb-1'>Where should we send project & budget alerts?</p>
                    <ul className="text-sm text-[#D9D9D9] no-focus-ring">
                        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#2D2E33] border-[#525363] border rounded p-2 my-1 text-sm m-auto" placeholder="Email" />
                        {/* Radio buttons */}
                        <p className='mt-2'>What are you making?</p>
                        <div className="flex items-center my-1">
                            <input type="radio" id="sideproject" name="fav_language" value="sideproject" className="mr-2" onChange={(e) => { if(e.target.checked){ setProjectType("sideproject")}}} />
                            <label htmlFor="sideproject" className="text-sm">Side project</label>
                        </div>
                        <div className="flex items-center my-1">
                            <input type="radio" id="startup" name="fav_language" value="startup" className="mr-2" onChange={(e) => { if(e.target.checked){ setProjectType("startup")}}} />
                            <label htmlFor="startup" className="text-sm">Startup</label>
                        </div>
                        <div className="flex items-center my-1">
                            <input type="radio" id="game" name="fav_language" value="game" className="mr-2" onChange={(e) => { if(e.target.checked){ setProjectType("game")}}} />
                            <label htmlFor="game" className="text-sm">Game</label>
                        </div>
                        <div className="flex items-center my-1">
                            <input type="radio" id="internaltool" name="fav_language" value="internaltool" className="mr-2" onChange={(e) => { if(e.target.checked){ setProjectType("internaltool")}}} />
                            <label htmlFor="internaltool" className="text-sm">Internal Tool</label>
                        </div>
                        <div className="flex items-center my-1">
                            <input type="radio" id="none" name="fav_language" value="none" className="mr-2" onChange={(e) => { if(e.target.checked){ setProjectType("looking")}}} />
                            <label htmlFor="none" className="text-sm">Just looking around</label>
                        </div>
                    </ul>
                    <Button
                        onClick={() => {
                            if(email == ""){
                                alert("Please enter an email");
                                return;
                            }
                            if(projectType == ""){
                                alert("Please select a project type");
                                return;
                            }
                            toast.promise(addEmailToAccount(email, projectType), {
                                loading: "Setting up...",
                                success: () => {
                                    onClose();
                                    return "You're in!";
                                },
                                error: "Error setting up. Email team@swizzle.co for help.",
                            });
                            
                        }}
                        moreClasses='mt-2 w-fit ml-auto'
                        text={"Get Started"}
                    />
                </div>

                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
