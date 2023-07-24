import { useEffect, useState } from "react";
import Button from "../../Utilities/Button";
import DatabaseEditorHint from "./DatabaseEditorHint";
import DatabaseRow from "./DatabaseRow";
import useSWRInfinite from 'swr'
import useApi from "../../API/DatabaseAPI";


const PAGE_SIZE = 10;

export default function DatabaseView(){
    const { getDocuments, updateDocument } = useApi(); 

    const [parentIsEditing, setParentIsEditing] = useState(false);
    const [keys, setKeys] = useState<string[]>([]);
    const [sortByKey, setSortByKey] = useState<string>("");
    
    const { data, error } = useSWRInfinite((index: number) =>
        getDocuments(index + 1, sortByKey)
    );

    useEffect(() => {
        if(data){
            setKeys(data.keys);
        }
    }, [data])

    if (error) return <div className="w-full text-center mt-4">Error loading data</div>
    if (!data) return <div className="w-full text-center mt-4">Loading...</div>


    return (
        <div>
            <div className={`flex-1 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
                <div>
                    <div className={`font-mono font-bold`}>users</div>
                    <div className={`text-sm mt-1`}>Browse and search the <span className={`font-mono font-bold`}>users</span> collection in your MongoDB instance</div>
                </div>
                <div className="text-sm w-20">
                    <DatabaseEditorHint isOpen={parentIsEditing} />
                </div>
            </div>
            <div className="flex">
                <input type="text" className="flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]" placeholder="Search" />
                <Button text="Search" />
            </div>
            <div className="flex">
                <table className='table-auto flex-grow my-4 ml-4'>
                    <thead className="bg-[#85869833]">
                        <tr>
                            {keys.map((key) => (
                                <th className='text-left p-1'>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-[#85869833]'>
                        {data.docs.map((pageData: any[], pageIndex: number) =>
                            pageData.map((row: any, rowIndex: number) => (
                                <DatabaseRow
                                key={`page-${pageIndex}-row-${rowIndex}`}
                                keys={keys}
                                data={row}
                                index={pageIndex * PAGE_SIZE + rowIndex}
                                setParentIsEditing={setParentIsEditing}
                                />
                            ))
                        )}
                        {/* <DatabaseRow keys={keys} data={exampleDocument} index={0} setParentIsEditing={setParentIsEditing} />
                        <DatabaseRow keys={keys} data={exampleDocument} index={1} setParentIsEditing={setParentIsEditing} />

                        <DatabaseRow keys={keys} data={exampleDocument} index={2} setParentIsEditing={setParentIsEditing} />
                        <DatabaseRow keys={keys} data={exampleDocument} index={3} setParentIsEditing={setParentIsEditing} /> */}
                    </tbody>
                </table>                                        
            </div>
        </div>
    )
}