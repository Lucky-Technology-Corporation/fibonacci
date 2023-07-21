export default function Dot ({color}: {color: string}){
    return (
        <div className={`w-2 h-2 rounded-full bg-${color}-400 m-auto mr-1.5 glow-${color}`}></div>
    )
}
