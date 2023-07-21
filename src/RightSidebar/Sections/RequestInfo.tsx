import React, {useEffect, useRef, useState} from 'react'
import ToastWindow from '../ToastWindow';
import InfoItem from '../InfoItem';

//TODO: redesign this to be less shitty
export default function RequestInfo({show}: {show: boolean}) {
    const [isHintWindowVisible, setIsHintWindowVisible] = useState(false)
    const [isResponseHintWindowVisible, setIsResponseHintWindowVisible] = useState(false)
    const timerRef = useRef<number | undefined>();
    const responseTimerRef = useRef<number | undefined>();

    const showHintWindow = () => {
        clearTimeout(timerRef.current);
        setIsResponseHintWindowVisible(false) //we should probably be reusing a single component instead of this 
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

    const showResponseHintWindow = () => {
        clearTimeout(responseTimerRef.current);
        setIsHintWindowVisible(false)
        setIsResponseHintWindowVisible(true)
    }
    const showResponseHintWindowIfOpen = () => {
        if(!isResponseHintWindowVisible) return;
        clearTimeout(responseTimerRef.current);
        setIsResponseHintWindowVisible(true)
    }
    const hideResponseHintWindow = () => {
        responseTimerRef.current = window.setTimeout(() => {
            setIsResponseHintWindowVisible(false)
        }, 300)
    }
    
    useEffect(() => {
        return () => {
            if(timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        return () => {
            if(responseTimerRef.current) {
                clearTimeout(responseTimerRef.current);
            }
        };
    }, []);
      

    return (
        <>
        <div className={`flex-col items-center justify-between ${show ? "opacity-100" : "opacity-0 h-0"}`} style={{transition: "opacity 0.3s"}}>
            <InfoItem
                title={"request"}
                showHintWindow={showHintWindow}
                hideHintWindow={hideHintWindow}
            />
            <ToastWindow
                isHintWindowVisible={isHintWindowVisible}
                showHintWindowIfOpen={showHintWindowIfOpen}
                hideHintWindow={hideHintWindow}
                title={"request"}
                content={<div className='text-gray-400'>Description of the last request</div>}
            />
           <InfoItem
                title={"response"}
                showHintWindow={showResponseHintWindow}
                hideHintWindow={hideResponseHintWindow}
            />
            <ToastWindow
                isHintWindowVisible={isResponseHintWindowVisible}
                showHintWindowIfOpen={showResponseHintWindowIfOpen}
                hideHintWindow={hideResponseHintWindow}
                title={"response"}
                content={<div className='text-gray-400'>Description of the last response</div>}
            />
        </div>

        
         
        
        </>
    )
} 
