export default function Button({
  text,
  onClick,
  className,
  moreClasses,
  children,
  onMouseEnter = () => {},
  onMouseLeave = () => {},
  style,
  ref,
}: {
  text?: any;
  onClick: () => void;
  className?: string;
  moreClasses?: string;
  children?: any;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  style?: any;
  ref?: any;
}) {
  const defaultClass =
    "text-sm px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border";

  return (
    <div onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={className ? className : defaultClass + " " + moreClasses } style={{transition: "background 0.3s ease-in-out", ...style}}>
      {children || text}
    </div>
  );
}
