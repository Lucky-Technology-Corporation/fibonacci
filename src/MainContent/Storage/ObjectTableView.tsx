import { useContext, useEffect, useState } from "react";
import Button from "../../Utilities/Button";
import DatabaseRow from "../Database/DatabaseRow";
import useApi from "../../API/DatabaseAPI";
import RowDetail from "../Database/RowDetail";
import Dropdown from "../../Utilities/Dropdown";
import { SwizzleContext } from "../../Utilities/GlobalContext";


export default function ObjectTableView(){

    const { getDocuments } = useApi(); 

    const { activeProject, activeProjectName } = useContext(SwizzleContext);
    const [searchQuery, setSearchQuery] = useState<string>("")

    const [rowDetailData, setRowDetailData] = useState<any>({})
    const [clickPosition, setClickPosition] = useState<{x: number, y: number}>({x: 0, y: 0})

    //TODO: replace with actual keys
    const [keys, setKeys] = useState<string[]>([]); //["name", "email", "age", "address", "city", "state", "zip"]
    const [data, setData] = useState<any>();
    const [error, setError] = useState<any>(null);
    
    const [hiddenRows, setHiddenRows] = useState<string[]>([]);

    //This refreshes the data when the active collection changes. In the future, we should use a context provider
    useEffect(() => {
        getDocuments("_swizzle_storage")
            .then((data) => {
                console.log("refreshed")
                setData(data.documents || [])
                setKeys(data.keys.sort() || [])
            })
            .catch((e) => {
                console.log(e)
                setError(e)
            })
    }, [activeProject])

  
    const runSearch = () => {
        // run search
    }

    const uploadFileHandler = (e: any) => {
        const file = e.target.files[0];
        console.log(file)
    }

    const showDetailView = (rowData: any, x: number, y: number) => {
        setRowDetailData(rowData);
        setClickPosition({x: x, y: y});
    }

    const addHiddenRow = (row: string) => {
        setHiddenRows([...hiddenRows, row])
    }

    if (error) return getNiceInfo("Failed to load data", "Check your connection and try again")
    if (!data) return getNiceInfo("Loading data", "Please wait while we load your data")

    console.log(data)
    return (
        <div>
            <div className={`flex-1 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
                <div>
                    <div className={`font-bold text-base`}>Storage</div>
                    <div className={`text-sm mt-0.5`}>Store images and other files under 16 MB</div>
                </div> 
                <div className={`flex h-10 mt-1 mr-[-16px] text-sm`}>
                    <Dropdown 
                        className="ml-2" 
                        onSelect={uploadFileHandler} 
                        children={[{id: "json", name: "File"}]}
                        direction="right"
                        title="Upload" />
                </div>
            </div>
            <div className={`flex h-8 ${data.length == 0 ? "hidden" : ""}`}>
                <input 
                    type="text" 
                    className="text-s, flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]" 
                    placeholder={"Filter users"}
                    value={searchQuery} 
                    onChange={(e) => {setSearchQuery(e.target.value)}}
                    onKeyDown={(event) => {
                        if(event.key == "Enter"){
                            runSearch()
                        }
                    }}
                />
                <Button text={"Search"} onClick={runSearch}  />
            </div>
            <div className="flex">
                <table className='table-auto flex-grow my-4 ml-4'>
                    <thead className="bg-[#85869822]">
                        <tr className={`font-mono text-xs ${keys.length == 0 ? "hidden" : ""}`}>
                            <th className='text-left py-1.5 rounded-tl-md w-6' key={0}></th>
                            {keys.filter(k => k != "data").map((key, index) => (
                                <th className={`text-left py-1.5 ${index == (keys.length - 2) ? "rounded-tr-md" : ""}`} key={index+1}>{key == "_id" ? <>File URL</> : key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-[#85869833]'>
                        {data.map((row: any, _: number) => (
                            <DatabaseRow
                                // style={{display: hiddenRows.includes(row._id) ? "none" : "table-row"}}
                                collection={"_swizzle_storage"}
                                key={row._id}
                                rowKey={row._id}
                                keys={keys}
                                data={Object.entries(row).reduce((result, [key, value]) => {
                                    return {...result, [key]: key == "_id" ? ("/swizzle/db/storage/"+value+".jpeg") : value}
                                }, {})}                            
                                setShouldShowSaveHint={() => {}}
                                showDetailView={(e: React.MouseEvent<SVGSVGElement>) => {showDetailView(row, e.clientX, e.clientY)}}
                                shouldBlockEdits={true}
                                shouldHideField={"data"}
                            />
                        ))}
                    </tbody>
                </table>
                <RowDetail data={rowDetailData} clickPosition={clickPosition} collection={"_swizzle_storage"} addHiddenRow={addHiddenRow} shouldHideCopy={true} /> 
            </div>
            {data.length == 0 && (
                <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="text-base font-bold mt-4 mb-4">😟 No files found</div>
                </div>
            )}
        </div>
    )
}

const getNiceInfo = (title: string, subtitle: string) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center">
            <div className="text-lg font-bold mt-4">{title}</div>
            <div className="text-sm text-center mt-2">{subtitle}</div>
        </div>
    )
}