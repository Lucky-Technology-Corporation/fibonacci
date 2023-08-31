import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Button from "../Utilities/Button";

 export default function TestButton() { 

    const popOut = () => {
    }

    return (
        <Button
            className = "w-full py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border"
            text="Test"
            onClick={popOut}
        />
    )
 }