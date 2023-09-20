const UserIdInfo = ({ className, placeholder, value, onChange, onKeyDown, show }) => {
  return (
    <div className={`mt-2 flex border rounded ${className} ${show ? "opacity-100" : "opacity-0 h-0"}`}>
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

export default UserIdInfo;
