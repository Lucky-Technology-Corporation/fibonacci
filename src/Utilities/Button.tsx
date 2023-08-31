export default function Button({
  text,
  onClick,
  className,
}: {
  text: string;
  onClick: () => void;
  className?: string; 
}) {
  const defaultClass =
    "px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border";

  return (
    <div
      onClick={onClick}
      className={className ? className : defaultClass} 
    >
      {text}
    </div>
  );
}
