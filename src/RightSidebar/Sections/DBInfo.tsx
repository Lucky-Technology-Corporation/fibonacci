import {useEffect, useRef, useState} from 'react'
import ToastWindow from '../ToastWindow';
import InfoItem from '../InfoItem';
import { copyText } from '../../Utilities/Copyable';

export default function DBInfo({show}: {show: boolean}) {
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
                title={"db"}
                showHintWindow={showHintWindow}
                hideHintWindow={hideHintWindow}
            />
            <ToastWindow
                isHintWindowVisible={isHintWindowVisible}
                showHintWindowIfOpen={showHintWindowIfOpen}
                hideHintWindow={hideHintWindow}
                title={"db"}
                content={
                <div className='text-gray-400'>You can interact with your MongoDB instance easily. <a href="https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/retrieve/" target='_blank' rel='noreferrer'>Learn more</a>
                    <div className='w-full h-2'></div>
                    <span className='underline'>Add a document</span><br/>
                    <span className='font-bold font-mono text-xs break-all cursor-pointer' onClick={() => copyText(`await db.collection("users").insertOne({"name": "Jimmy"})`)}>{`await db.collection("users").insertOne({"name": "Jimmy"})`}</span>
                    <div className='w-full h-2'></div>
                    <span className='underline'>Get a document</span><br/>
                    <span className='font-bold font-mono text-xs break-all cursor-pointer' onClick={() => copyText(`const user = await db.collection("users").findOne({"id", "0001"})`)}>{`const user = await db.collection("users").findOne({"name", "Jimmy"})`}</span>
                    <div className='w-full h-2'></div>
                    <span className='underline'>Update the document</span><br/>
                    <span className='font-bold font-mono text-xs break-all cursor-pointer' onClick={() => copyText(`await user.update({"name": "Steve"})`)}>{`await user.update({"name": "Steve"})`}</span>
                </div>
                }
            />
        </div>
    </>)
} 
