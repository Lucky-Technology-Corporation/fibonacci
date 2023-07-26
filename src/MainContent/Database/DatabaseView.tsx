import { useEffect, useState } from "react";
import Button from "../../Utilities/Button";
import DatabaseEditorHint from "./DatabaseEditorHint";
import DatabaseRow from "./DatabaseRow";
import useSWRInfinite from 'swr'
import useApi from "../../API/DatabaseAPI";
import useTypingEffect from "./TypingEffect";
import RowDetail from "./RowDetail";


export default function DatabaseView({activeCollection}: {activeCollection: string}){

    const { getDocuments, updateDocument } = useApi(); 

    const [searchPlaceholder, setSearchPlaceholder] = useState<string>("remove the phone_number everyone whose age is greater than 30")
    // useTypingEffect(setSearchPlaceholder);

    const [isValidMongoQuery, setIsValidMongoQuery] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("")

    const [parentIsEditing, setParentIsEditing] = useState(false);

    const [rowDetailData, setRowDetailData] = useState<any>({})
    const [clickPosition, setClickPosition] = useState<{x: number, y: number}>({x: 0, y: 0})

    //TODO: replace with actual keys
    const [keys, setKeys] = useState<string[]>([]); //["name", "email", "age", "address", "city", "state", "zip"]
    const [data, setData] = useState<any>();
    const [error, setError] = useState<any>(null);
    
    // const { data, error } = useSWRInfinite(
    //     (index: number) => getDocuments(activeCollection),
    //     (data: any) => {
    //         if (data.error) {
    //             console.log("error"")
    //             return null; // stop retrying on error
    //         }
    //         return data;
    //     }
    // );

    useEffect(() => {
        if(!activeCollection || activeCollection == "") return;
        getDocuments(activeCollection)
            .then((data) => {
                console.log(data)
                setData(data.documents || [])
                setKeys(data.keys || [])
            })
            .catch((e) => {
                console.log(e)
                setError(e)
            })
    }, [activeCollection])

    useEffect(() => {
        const regex = /^(\w+)\(\{.*\}\)$/;
        const isValid = regex.test(searchQuery);
        setIsValidMongoQuery(isValid);
    }, [searchQuery])

    const runSearch = () => {
        if(isValidMongoQuery){
            return () => {
                // run search
            }
        }else{
            return () => {
                // run query
            }
        }
    }

    const showDetailView = (rowData: any, x: number, y: number) => {
        setRowDetailData(rowData);
        setClickPosition({x: x, y: y});
    }

    
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
                <div className={`flex h-10 mt-1 mr-[-16px] text-sm ${parentIsEditing ? "hidden" : ""}`}>
                    <Button text="+ New Document" onClick={() => {}} />
                </div>
            </div>
            <div className="flex">
                <input 
                    type="text" 
                    className="font-mono flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]" 
                    placeholder={searchPlaceholder}
                    value={searchQuery} 
                    onChange={(e) => {setSearchQuery(e.target.value)}}
                    onKeyDown={(event) => {
                        if(event.key == "Enter"){
                            runSearch()
                        }
                    }}
                />
                <Button text={isValidMongoQuery ? "Run" : "Search"} onClick={runSearch}  />
            </div>
            <div className="flex">
                <table className='table-auto flex-grow my-4 ml-4'>
                    <thead className="bg-[#85869833]">
                        <tr>
                        <th className='text-left p-1' key={0}></th>
                            {keys.filter(k => k != "_id").map((key, index) => (
                                <th className='text-left p-1' key={index+1}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-[#85869833]'>
                        {data.map((row: any, rowIndex: number) => (
                            <DatabaseRow
                                collection={activeCollection}
                                key={`row-${rowIndex}`}
                                rowKey={row._id}
                                keys={keys}
                                data={row}
                                setParentIsEditing={setParentIsEditing}
                                showDetailView={(e: React.MouseEvent<HTMLButtonElement>) => {showDetailView(row, e.clientX, e.clientY)}}
                            />
                        ))}
                    </tbody>
                </table>
                <RowDetail data={rowDetailData} clickPosition={clickPosition} />                                        
            </div>
        </div>
    )
}