export default function Button({
  text,
  onClick,
  className,
  children,
}: {
  text: any;
  onClick: () => void;
  className?: string;
  children?: any;
}) {
  const defaultClass =
    "text-sm px-5 py-1 font-medium rounded flex justify-center items-center cursor-pointer bg-[#85869833] hover:bg-[#85869855] border-[#525363] border";

  return (
    <div onClick={onClick} className={className ? className : defaultClass}>
      {children || text}
    </div>
  );
}
