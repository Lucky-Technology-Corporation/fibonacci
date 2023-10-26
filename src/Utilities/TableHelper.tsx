export const getTableHelper = (
  rows: { name: string; description?: string }[],
  onClickRow?: (row: { name: string; description?: string }) => void,
) => {
  return (
    <table className="table-auto min-w-full my-2">
      <tbody className="divide-y divide-[#85869833]">
        {rows.map((row, i) => {
          return (
            <tr
              key={i}
              onClick={() => onClickRow && onClickRow(row)}
              style={{
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              <td className="font-mono py-1 text-xs">{row.name}</td>
              <td>{row.description || ""}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
