import { copyText } from "./Copyable"

export const getTableHelper = (rows: {name: string, description: string}[]) => {
    return (
        <table className='table-auto min-w-full my-2'>
        <tbody className='divide-y divide-[#85869833]'>
            {rows.map((row, i) => {
                return (
                <tr>
                    <td className='font-mono py-1 cursor-pointer' onClick={() => {copyText(row.name)}}>{row.name}</td><td>{row.description}</td>
                </tr>
                )
            })}
        </tbody>
    </table>
    )
}
