export default function Dot ({color}: {color: string}){
    return (
        <div className={`w-2 h-2 rounded-full bg-${color}-400 m-auto mr-1.5 glow-${color}`}>
            {/* Tailwind generates css at build time, so we need to this to load both colors */}
            <div className="hidden bg-green-400 bg-orange-400"></div>
        </div>
    )
}
