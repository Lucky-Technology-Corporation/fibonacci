import Lottie from "lottie-react";
import dog from "../../public/dog.json";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Lobby(){    

    return (
        <div>
            <Lottie animationData={dog} loop={true} className="w-48 h-48 m-auto mt-2" />
            <div className="m-auto w-fit mt-[-36px] text-center">This might take a few moments - enjoy some Tetris in the meantime!</div>
            <iframe src="https://blockrain-omega.vercel.app/" style={{width: "250px", height: "500px"}} className="m-auto mt-8"/>
        </div>
    )
}