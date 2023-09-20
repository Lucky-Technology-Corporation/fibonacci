export default function Chevron({
  size = 16,
  active = false,
  tease = false,
}: {
  size: number;
  active: boolean;
  tease?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className={`bi bi-chevron-right ${active ? "rotate-90" : "rotate-[-90deg]"} ${tease ? "rotate-45" : ""}`}
      viewBox="0 0 16 16"
      style={{ transition: "transform .2s" }}
    >
      <path
        fillRule="evenodd"
        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );
}
