const InputWithPrefix = ({
  prefix,
  className,
  placeholder,
  value,
  onChange,
  onKeyDown,
}) => {
  return (
    <div className={`flex border rounded ${className}`}>
      <span className="flex items-center px-1 pr-0">{prefix}</span>
      <input
        className={`flex-1 min-w-0 px-2 pl-0 bg-transparent outline-0 placeholder-opacity-25`}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default InputWithPrefix;
