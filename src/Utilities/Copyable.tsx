import toast from "react-hot-toast";

export function copyText(text: string, skipToast?: boolean) {
  navigator.clipboard.writeText(text);
  if (skipToast) return;
  toast("Copied!", { icon: "🤓" });
}
