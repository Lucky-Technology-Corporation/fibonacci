export const getSearchTableHelper = (
  rows: { endpoint: string; snippet: string }[],
  onClickRow?: (row: { endpoint: string; snippet: string }) => void,
) => {
  return (
    <table className="min-w-full text-white table-auto">
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            onClick={() => onClickRow && onClickRow(row)}
            style={{
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            <td
              className="py-1.5"
              style={{
                border: "2px solid transparent", // Initially transparent
                borderRadius: "8px", // Add this for rounded corners
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#85869833")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            >
              <div className="font-mono pl-1">{row.endpoint}</div>
              <div className="py-1 pl-2">{row.snippet || ""}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
