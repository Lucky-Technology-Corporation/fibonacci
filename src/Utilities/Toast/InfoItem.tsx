import React, { useContext, useEffect, useRef, useState } from "react";
import { SwizzleContext } from "../GlobalContext";
import ToastWindow from "./ToastWindow";

type ToastProps = {
  title: string;
  content: React.ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";
  isExpandable?: boolean;
  isLarge?: boolean;
};

export default function InfoItem({
  content,
  toast,
  position,
  onClick
}: {
  content: React.ReactNode;
  toast: ToastProps;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";
  onClick?: () => void;
}) {
  const [id, setId] = useState(Math.random().toString(36).substring(7));
  const timerRef = useRef<number | undefined>();
  const { activeToast, setActiveToast } = useContext(SwizzleContext);

  const [isHintWindowVisible, setIsHintWindowVisible] = useState(false);
  const showHintWindow = () => {
    clearTimeout(timerRef.current);
    setActiveToast(id);
    setIsHintWindowVisible(true);
  };
  const showHintWindowIfOpen = () => {
    if (!isHintWindowVisible) return;
    clearTimeout(timerRef.current);
    setIsHintWindowVisible(true);
  };

  const hideHintWindow = () => {
    timerRef.current = window.setTimeout(() => {
      setIsHintWindowVisible(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeToast !== id) {
      setIsHintWindowVisible(false);
    }
  }, [activeToast]);
  
  function extractTextFromHTML(node) {
    if (!node) return "";
    if (typeof node === "string" || typeof node === "number") {
        return node.toString();
    }
    if (Array.isArray(node)) {
        return node.map(extractTextFromHTML).join("");
    }
    if (React.isValidElement(node) && (node.props as any).children) {
        return extractTextFromHTML((node.props as any).children);
    }
    return "";
  }
  
  return (
    <>
      <div
        className="py-1 flex items-center mt-1 cursor-pointer"
        onMouseEnter={showHintWindow}
        onMouseLeave={hideHintWindow}
        onClick={onClick}
      >
        {content}
      </div>
      <ToastWindow
        isHintWindowVisible={isHintWindowVisible}
        showHintWindowIfOpen={showHintWindowIfOpen}
        hideHintWindow={hideHintWindow}
        title={toast.title}
        isLarge={toast.isLarge}
        isExpandable={toast.isExpandable}
        content={toast.content}
        position={position}
        titleClass="text-sm mb-1 font-sans"
      />
    </>
  );
}
