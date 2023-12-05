import { useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import Button from "../../Utilities/Button";

export default function AIResponseWithChat({descriptionIn, operationIn, setResponse, setCurrentDbQuery, historyIn, activeCollection}: {descriptionIn: string, operationIn: string, setResponse: (response: any) => void, setCurrentDbQuery: (query: string) => void, historyIn: any[], activeCollection: string}){
    const [description, setDescription] = useState<string>(descriptionIn);
    const [operation, setOperation] = useState<string>(operationIn);
    const [history, setHistory] = useState<any[]>(historyIn);
    
    const [aiUpdateRequestPrompt, setAiUpdateRequestPrompt] = useState<string>("");
    const { promptDbHelper } = useEndpointApi();

    const runAiAgain = async () => {
        toast.promise(promptDbHelper(aiUpdateRequestPrompt, activeCollection, history), {
            loading: 'Sending...',
            success: (data) => {
                setDescription(data.pending_operation_description)
                setOperation(data.pending_operation)
                setHistory(history.concat([{role: "user", content: aiUpdateRequestPrompt}, {role: "assistant", content: data.pending_operation}]))
                setAiUpdateRequestPrompt("");
                return "Sent!";
            },
            error: (err) => {
                return err;
            }
        })
    }

    return (
      <div className="flex flex-col">
        <div className="text-sm mb-2">{description}</div>
        <div className="flex items-center">
            <div className="font-bold font-mono text-xs my-auto" style={{whiteSpace: "pre-wrap"}}>{operation}</div>
            <Button
                text="Run"
                className="text-sm ml-3 px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border flex-shrink-0 flex-grow-0"
                onClick={() => {
                    setResponse(null);
                    setCurrentDbQuery(operation)
                    //submit to POST collectionId/mongo
                }}
            />
        </div>
        <div className="flex mt-4 no-focus-ring">
          <input 
            className="flex-grow bg-[#85869833] border-[#525363] border rounded-md text-sm px-3 py-1 font-medium mr-3"
            placeholder="Not right? Ask AI to update here"
            value={aiUpdateRequestPrompt}
            onChange={(e) => { setAiUpdateRequestPrompt(e.target.value) } }
            onKeyDown={(event) => {
                if(event.key == "Enter"){
                    runAiAgain()
                }
            }}
          />
            <Button
                text="Send"
                className="text-sm px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
                onClick={runAiAgain}
            />
        </div>

      </div>
    )
}