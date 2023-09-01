import Button from "../Utilities/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask } from "@fortawesome/free-solid-svg-icons";

export default function TestButton({
  shouldShowTestWindow,
}: {
  shouldShowTestWindow: () => void;
}) {
  return (
    <>
      <Button
        className="w-full py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
        onClick={shouldShowTestWindow}
        text="Test"
      >
        <FontAwesomeIcon icon={faFlask} />
        <span className="ml-2">Test</span>
      </Button>
    </>
  );
}
