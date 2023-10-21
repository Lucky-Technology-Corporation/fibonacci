import React from "react";

interface NiceInfoProps {
  title: string;
  subtitle: string;
}

const NiceInfo = ({ title, subtitle }: NiceInfoProps) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center">
      <div className="text-lg font-bold mt-4">{title}</div>
      <div className="text-sm text-center mt-2">{subtitle}</div>
    </div>
  );
};

export default NiceInfo;
