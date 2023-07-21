import toast from "react-hot-toast";

export function copyText(text: string) {
    navigator.clipboard.writeText(text);
    toast("Copied!", { icon: "🤓"})
}