export default function Button({
  text,
  onClick,
  className,
  children,
  onMouseEnter = () => {},
  onMouseLeave = () => {},
}: {
  text?: any;
  onClick: () => void;
  className?: string;
  children?: any;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const defaultClass =
    "text-sm px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border";

  return (
    <div onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={className ? className : defaultClass} style={{transition: "background 0.3s ease-in-out"}}>
      {children || text}
    </div>
  );
}
