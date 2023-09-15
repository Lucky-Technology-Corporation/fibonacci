
export default function FileItem({
  active = false,
  path,
  onClick,
}: {
  active?: boolean;
  path: string;
  onClick?: () => void;
}) {
  return (
    <>
      <div
        className={`font-mono text-xs flex-1 p-1.5 py-2 my-1 font-bold ${
          active ? "bg-[#85869822]" : ""
        } hover:bg-[#85869833] cursor-pointer rounded`}
        onClick={onClick}
      >
        {path}
      </div>
    </>
  );
}
