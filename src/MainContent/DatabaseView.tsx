import Button from "../Utilities/Button";

export default function DatabaseView(){
    return (
        <div>
            <div className={`flex-1 mx-4 mb-4 mt-1 text-lg`}>
                <div className={`font-mono font-bold`}>users</div>
                <div className={`text-sm mt-1`}>Browse and search the <span className={`font-mono font-bold`}>users</span> collection in your MongoDB instance</div>
            </div>
            <div className="flex">
                <input type="text" className="flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]" placeholder="Search" />
                <Button text="Search" />
            </div>
            <div className="flex">
                <table className='table-auto flex-grow my-4 ml-4'>
                    <thead className="bg-[#85869833]">
                        <tr>
                            <th className='text-left p-1'>id</th>
                            <th className='text-left p-1'>name</th>
                            <th className='text-left p-1'>created_at</th>
                            <th className='text-left p-1'>is_anonymous</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-[#85869833]'>
                        <tr className="hover:bg-[#85869822] cursor-pointer">
                            <td className='font-mono p-1'>000001</td>
                            <td className='font-mono p-1'>John Doe</td>
                            <td className='font-mono p-1'>July 21 2023</td>
                            <td className='font-mono p-1'>false</td>
                        </tr>
                        <tr className="hover:bg-[#85869822] cursor-pointer">
                            <td className='font-mono p-1'>000002</td>
                            <td className='font-mono p-1'>Jane Smith</td>
                            <td className='font-mono p-1'>July 21 2023</td>
                            <td className='font-mono p-1'>false</td>
                        </tr>
                        <tr className="hover:bg-[#85869822] cursor-pointer">
                            <td className='font-mono p-1'>000003</td>
                            <td className='font-mono p-1'>Steve Tom</td>
                            <td className='font-mono p-1'>July 21 2023</td>
                            <td className='font-mono p-1'>false</td>
                        </tr>
                    </tbody>
                </table>                                        
            </div>
        </div>
    )
}