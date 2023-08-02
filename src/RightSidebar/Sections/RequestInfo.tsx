import React, {useEffect, useRef, useState} from 'react'
import ToastWindow from '../ToastWindow';
import InfoItem from '../InfoItem';
import { copyText } from '../../Utilities/Copyable';

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
                isLarge={true}
                content={<div className='text-gray-400'>Access request info using the following syntax:
                    <table className='table-auto min-w-full my-4'>
                        <thead className="bg-[#85869833]">
                            <tr>
                                <th className='text-left'>Value</th><th className='text-left'>Type</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-[#85869833]'>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("request.query.myQueryVariable")}}>request.query.myQueryVariable</td><td>Query variables (?myQueryVariable=myValue)</td>
                            </tr>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("request.params.myPathVariable")}}>request.params.myPathVariable</td><td>Path variables (/api/:myPathVariable)</td>
                            </tr>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("request.body")}}>request.body</td><td>Body object (whatever is sent in the body)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>}
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
                isLarge={true}
                content={<div className='text-gray-400'>Send your response with the following syntax:
                    <table className='table-auto min-w-full my-4'>
                        <thead className="bg-[#85869833]">
                            <tr>
                                <th className='text-left'>Value</th><th className='text-left'>Type</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-[#85869833]'>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("return response.send(object)")}}>return response.send(object)</td><td>Send an object back to the frontend</td>
                            </tr>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("return response.status(400).send(object)")}}>return response.status(400).send(object)</td><td>Define the status code sent back to the frontend</td>
                            </tr>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("return response.redirect(url)")}}>return response.redirect(url)</td><td>Redirect to another url</td>
                            </tr>
                        </tbody>
                    </table>
                </div>}
            />
        </div>

        
         
        
        </>
    )
} 
