import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
}

export default function InProgressDeploymentModal({
    isOpen,
    onClose,
    title = "Setting up your project",
    confirmText = "Close"
  }: ModalProps) {  
    
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            const interval = setInterval(() => {
                setCurrentStep(prev => prev + 1);
            }, 10000); // 10 seconds

            return () => clearInterval(interval); // Cleanup on unmount or when modal closes
        } else {
            setCurrentStep(0); // Reset when modal is not open
        }
    }, [isOpen]);

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
                <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                    <svg className="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {title}
                </h3>
                <div className="mt-2">
                    <ul className="text-sm text-[#D9D9D9]">
                    <li className="mt-2 ml-8">If this is a new project, your dashboard will be ready in ~5 minutes.<br/><br/>If this is an existing project, your test environment was put to sleep due to inactivity and will resume in ~2 minutes. <span className='font-medium text-green-500'>Your production environment isx always available to customers.</span></li>
                        {/* {currentStep >= 1 && <li className="mt-2 ml-8">Creating test environment...</li>}
                        {currentStep >= 1 && <li className="mt-2 ml-8">Creating test environment...</li>}
                        {currentStep >= 2 && <li className="mt-2 ml-8">Provisioning SSL certificates...</li>}
                        {currentStep >= 3 && <li className="mt-2 ml-8">Cloning server code...</li>}
                        {currentStep >= 4 && <li className="mt-2 ml-8">Creating production resources...</li>}
                        {currentStep >= 5 && <li className="mt-2 ml-8">Setting up IDE...</li>}
                        {currentStep >= 6 && <li className="mt-2 ml-8">Finishing up...</li>}
                        {currentStep >= 7 && <li className="mt-2 ml-8">This can take up to 5 minutes. Please be patient.</li>} */}
                    </ul>
                </div>

                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
