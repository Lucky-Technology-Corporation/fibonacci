import {useEffect, useRef, useState} from 'react'
import ToastWindow from '../ToastWindow';
import InfoItem from '../InfoItem';
import { copyText } from '../../Utilities/Copyable';
import SectionAction from '../../LeftSidebar/SectionAction';
import FullPageModal from '../../Utilities/FullPageModal';

export default function SecretInfo({show}: {show: boolean}) {
    const [isVisible, setIsVisible] = useState(false)
    const [isHintWindowVisible, setIsHintWindowVisible] = useState(false)
    const timerRef = useRef<number | undefined>();

    const showHintWindow = () => {
        clearTimeout(timerRef.current);
        setIsHintWindowVisible(true)
    }
    const showHintWindowIfOpen = () => {
        if(!isHintWindowVisible) return;
        clearTimeout(timerRef.current);
        setIsHintWindowVisible(true)
    }
    const hideHintWindow = () => {
        timerRef.current = window.setTimeout(() => {
            setIsHintWindowVisible(false)
        }, 300)
    }
    
    useEffect(() => {
        return () => {
            if(timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);
      

    return (<>
        <div className={`flex-col items-center justify-between ${show ? "opacity-100" : "opacity-0 h-0 pointer-events-none"}`} style={{transition: "opacity 0.3s"}}>
            <div className="h-1"></div>
            <SectionAction text="+ New Secret" onClick={() => {setIsVisible(true)}} />
            <FullPageModal 
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                modalDetails={{
                    title: "🔒 New Secret",
                    description: 
                        <div className="flex flex-col items-center justify-center mt-2">
                            <div className="w-full">
                                <div className="text-gray-300 mb-2">Secret name</div>
                                <input className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2" placeholder="" />
                            </div>
                            <div className="w-full">
                                <div className="text-gray-300 mb-2 mt-4">Test value</div>
                                <textarea className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2" placeholder="" />
                            </div>
                            <div className="w-full">
                                <div className="text-gray-300 mb-2 mt-4">Production value</div>
                                <textarea className="w-full bg-transparent border-[#525363] border rounded outline-0 focus:border-[#68697a] p-2" placeholder="" />
                            </div>
                        </div>,
                    placeholder: "/path/:variable",
                    confirmText: "Create",
                    confirmHandler: () => {},  
                    shouldShowInput: false,
                }}
            />
            
        </div>
    </>)
} 
