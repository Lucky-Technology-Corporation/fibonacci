import { useContext, useState } from "react";
import toast from "react-hot-toast";
import useEndpointApi from "../../API/EndpointAPI";
import Button from "../../Utilities/Button";
import { SwizzleContext } from "../../Utilities/GlobalContext";

export default function AIResponseWithChat({
  descriptionIn,
  operationIn,
  historyIn,
  activeCollection,
  selectedText,
  onApprove,
}: {
  descriptionIn: string;
  operationIn: string;
  historyIn: any[];
  activeCollection?: string;
  selectedText?: string;
  onApprove: () => void;
}) {
  const [description, setDescription] = useState<string>(descriptionIn);
  const [operation, setOperation] = useState<string>(operationIn);
  const [history, setHistory] = useState<any[]>(historyIn);

  const [aiUpdateRequestPrompt, setAiUpdateRequestPrompt] = useState<string>("");
  const { promptDbHelper, promptAiEditor } = useEndpointApi();

  const { setPostMessage } = useContext(SwizzleContext);

  const runAiAgain = async () => {
    if (activeCollection) {
      toast.promise(promptDbHelper(aiUpdateRequestPrompt, activeCollection, history), {
        loading: "Working...",
        success: (data) => {
          setDescription(data.pending_operation_description);
          setOperation(data.pending_operation);
          setHistory(
            history.concat([
              { role: "user", content: aiUpdateRequestPrompt },
              { role: "assistant", content: data.pending_operation },
            ]),
          );
          setAiUpdateRequestPrompt("");
          return "Done";
        },
        error: (err) => {
          return err;
        },
      });
    } else {
      toast.promise(promptAiEditor(aiUpdateRequestPrompt, activeCollection, selectedText, history), {
        loading: "Working...",
        success: (data) => {
          setOperation(data.new_code);
          setHistory(
            history.concat([
              { role: "user", content: aiUpdateRequestPrompt },
              { role: "assistant", content: data.new_code },
            ]),
          );
          setAiUpdateRequestPrompt("");
          return "Done";
        },
        error: (err) => {
          return err;
        },
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-2">
        <div className="text-sm">{description}</div>
        {!activeCollection && (
          <Button
            text="Approve"
            className="text-sm ml-3 px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border flex-shrink-0 flex-grow-0"
            onClick={onApprove}
          />
        )}
      </div>
      <div className="flex items-center">
        <div className="font-bold font-mono text-xs my-auto" style={{ whiteSpace: "pre-wrap" }}>
          {operation}
        </div>
        {activeCollection && (
          <Button
            text="Run"
            className="text-sm ml-3 px-3 py-1 font-medium rounded-md flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border flex-shrink-0 flex-grow-0"
            onClick={onApprove}
          />
        )}
      </div>
      <div className="flex mt-4 no-focus-ring">
        <input
          className="flex-grow bg-[#85869833] border-[#525363] border rounded-md text-sm px-3 py-1 font-medium mr-3"
          placeholder="Not right? Ask AI to update here"
          value={aiUpdateRequestPrompt}
          onChange={(e) => {
            setAiUpdateRequestPrompt(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              runAiAgain();
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
  );
}
