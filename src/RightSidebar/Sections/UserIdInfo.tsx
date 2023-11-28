const UserIdInfo = ({ className, placeholder, value, onChange, show }) => {
  return (
    <div className={`mt-2 flex border rounded ${className} ${show ? "" : "hidden"}`}>
      <input
        className={`flex-1 min-w-0 px-2 pl-0 bg-transparent outline-0 placeholder-opacity-25`}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default UserIdInfo;
