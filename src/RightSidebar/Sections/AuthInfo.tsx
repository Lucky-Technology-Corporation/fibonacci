import {useEffect, useRef, useState} from 'react'
import ToastWindow from '../ToastWindow';
import InfoItem from '../InfoItem';
import { copyText } from '../../Utilities/Copyable';

export default function AuthInfo({show}: {show: boolean}) {
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
            <InfoItem
                title={"user"}
                showHintWindow={showHintWindow}
                hideHintWindow={hideHintWindow}
            />
            <ToastWindow
                isHintWindowVisible={isHintWindowVisible}
                showHintWindowIfOpen={showHintWindowIfOpen}
                hideHintWindow={hideHintWindow}
                title={"user"}
                content={
                <div className='text-gray-400'>If the request is made from a client that has not signed in, <span className='font-bold font-mono'>user</span> will <span className='font-bold font-mono'>null</span>. 
                <div className='h-4'></div>Otherwise, you can access the following properties:
                    <table className='table-auto min-w-full my-4'>
                        <thead className="bg-[#85869833]">
                            <tr>
                                <th className='text-left'>Value</th><th className='text-left'>Type</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-[#85869833]'>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("UID(request.user)")}}>UID(request.user)</td><td>Swizzle UID</td>
                            </tr>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("user.created_at")}}>user.createdAt</td><td>Date</td>
                            </tr>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("user.is_anonymous")}}>user.isAnonymous</td><td>boolean</td>
                            </tr>
                        </tbody>
                    </table>
                    and these (but they might be null!)
                    <table className='table-auto min-w-full mt-4'>
                        <thead className="bg-[#85869833]">
                            <tr>
                                <th className='text-left'>Optional Value</th><th className='text-left'>Type</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-[#85869833]'>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("user.username")}}>user.username</td><td>string</td>
                            </tr>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("user.email")}}>user.email</td><td>string</td>
                            </tr>
                            <tr>
                                <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText("user.phone_number")}}>user.phoneNumber</td><td>string (E.164)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                }
            />
        </div>
    </>)
} 
