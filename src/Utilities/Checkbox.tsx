import React from "react";

export default function Checkbox({
  id,
  label,
  checkedLabel,
  isChecked,
  setIsChecked,
}: {
  id: string;
  label: string;
  checkedLabel?: string;
  isChecked: boolean;
  setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <input
        id={id}
        className="inp-cbx"
        type="checkbox"
        style={{ display: "none" }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setIsChecked(e.target.checked);
        }}
        checked={isChecked}
      />
      <label className="cbx" htmlFor={id}>
        <span>
          <svg width="12px" height="10px" viewBox="0 0 12 10">
            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
          </svg>
        </span>
        <span
          className={`text-sm`}
          style={{
            transition: "font-weight 0.2s",
          }}
        >
          {isChecked ? (checkedLabel ? checkedLabel : label) : label}
        </span>
      </label>
    </>
  );
}
