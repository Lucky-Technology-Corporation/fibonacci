export default function HoverableObject({
  text,
  object,
}: {
  text: string;
  object: any;
}) {
  return (
    <span className="cursor-pointer font-bold font-mono underline decoration-dotted">
      {text}
    </span>
  );
}
