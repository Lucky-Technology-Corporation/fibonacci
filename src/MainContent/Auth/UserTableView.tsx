import { useEffect, useState } from "react";
import Button from "../../Utilities/Button";
import DatabaseRow from "../Database/DatabaseRow";
import useApi from "../../API/DatabaseAPI";
import RowDetail from "../Database/RowDetail";


export default function UserTableView({activeCollection}: {activeCollection: string}){

    const { getDocuments } = useApi(); 

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
        if(!activeCollection || activeCollection == "") return;
        getDocuments(activeCollection)
            .then((data) => {
                console.log("refreshed")
                setData(data.documents || [])
                setKeys(data.keys.sort() || [])
            })
            .catch((e) => {
                console.log(e)
                setError(e)
            })
    }, [activeCollection])

  
    const runSearch = () => {
        // run search
    }

    const showDetailView = (rowData: any, x: number, y: number) => {
        setRowDetailData(rowData);
        setClickPosition({x: x, y: y});
    }

    const addHiddenRow = (row: string) => {
        if(hiddenRows.includes(row)){
            const newHiddenRows = hiddenRows.filter((hiddenRow) => hiddenRow != row)
            setHiddenRows(newHiddenRows)

            var newData: any = []
            data.forEach((rowI: any) => {
                if(rowI && rowI["_id"] == row){
                    rowI["_deactivated"] = false
                }
                newData.push(rowI)
            })

            setData(newData)
            
        } else{
            setHiddenRows([...hiddenRows, row])
            var newData: any = []
            data.forEach((rowI: any) => {
                if(rowI && rowI["_id"] == row){
                    rowI["_deactivated"] = true
                }
                newData.push(rowI)
            })

            setData(newData)
        }
    }

    if(!activeCollection) return getNiceInfo("Select a collection", "Select (or create) a collection on the left to get started")
    if (error) return getNiceInfo("Failed to load data", "Check your connection and try again")
    if (!data) return getNiceInfo("Loading data", "Please wait while we load your data")


    return (
        <div>
            <div className={`flex-1 mx-4 mb-4 mt-1 text-lg flex justify-between`}>
                <div>
                    <div className={`font-bold text-base`}>{sessionStorage.getItem("projectName")} users</div>
                    <div className={`text-sm mt-0.5`}>Create users <a href="https://www.notion.so/Swizzle-e254b35ddef5441d920377fef3615eab?pvs=4" target="_blank" rel="nofollow" className="underline decoration-dotted text-[#d2d3e0] hover:text-white">from your app</a>. These records cannot be edited.</div>
                </div> 
                {/* <div className={`flex h-10 mt-1 mr-[-16px] text-sm`}>
                    <Dropdown 
                        className="ml-2" 
                        onSelect={createObjectHandler} 
                        children={[{id: "json", name: "Document"}]}
                        direction="right"
                        title="Create" />
                </div> */}
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
                            {keys.filter(k => k != "_deactivated").map((key, index) => (
                                <th className={`text-left py-1.5 ${index == (keys.length - 2) ? "rounded-tr-md" : ""}`} key={index+1}>{key == "_id" ? <>userId (<a href="https://www.notion.so/Swizzle-e254b35ddef5441d920377fef3615eab?pvs=4" target="_blank" rel="nofollow" className="underline decoration-dotted text-[#d2d3e0] hover:text-white">docs</a>)</> : key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-[#85869833]'>
                        {data.map((row: any, _: number) => (
                            <DatabaseRow
                                collection={activeCollection}
                                key={row._id}
                                rowKey={row._id}
                                keys={keys}
                                data={row}
                                setShouldShowSaveHint={() => {}}
                                showDetailView={(e: React.MouseEvent<SVGSVGElement>) => {showDetailView(row, e.clientX, e.clientY)}}
                                shouldHideField={"_deactivated"}
                                shouldBlockEdits={true}
                                shouldShowStrikethrough={hiddenRows.includes(row._id) || row._deactivated == true}
                            />
                        ))}
                    </tbody>
                </table>
                <RowDetail data={rowDetailData} clickPosition={clickPosition} collection={activeCollection} addHiddenRow={addHiddenRow} deleteAction="deactivate"/> 
            </div>
            {data.length == 0 && (
                <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="text-base font-bold mt-4 mb-4">😟 No users yet</div>
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