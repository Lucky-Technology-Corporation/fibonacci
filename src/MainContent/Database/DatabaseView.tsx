import { useEffect, useState } from "react";
import Button from "../../Utilities/Button";
import DatabaseEditorHint from "./DatabaseEditorHint";
import DatabaseRow from "./DatabaseRow";
import useSWRInfinite from 'swr'
import useApi from "../../API/DatabaseAPI";
import useTypingEffect from "./TypingEffect";


const PAGE_SIZE = 10;
const searchExamples = [
    {
      "pages": [
        {
          "_id": "60f0b8b8a6b7a3a0a4f1b0a1",
          "name": "Mccarthy",
          "email": "jmacarthy@gmail.com",
          "age": 30,
          "address": "1234 Main St",
          "city": "San Francisco",
          "state": "CA",
          "zip": "94123"
        },
        {
          "_id": "60f0b8b8a6b7a3a0a4f1b0a2",
          "name": "Smith",
          "email": "jsmith@gmail.com",
          "age": 35,
          "address": "4567 Park Ave",
          "city": "Los Angeles",
          "state": "CA",
          "zip": "90001"
        }
      ],
      "nextPage": 2
    },
    {
      "pages": [
        {
          "_id": "60f0b8b8a6b7a3a0a4f1b0a3",
          "name": "Johnson",
          "email": "jjohnson@gmail.com",
          "age": 40,
          "address": "8910 Elm St",
          "city": "San Diego",
          "state": "CA",
          "zip": "92101"
        },
        {
          "_id": "60f0b8b8a6b7a3a0a4f1b0a4",
          "name": "Williams",
          "email": "rwilliams@gmail.com",
          "age": 45,
          "address": "1213 Pine St",
          "city": "Sacramento",
          "state": "CA",
          "zip": "94203"
        }
      ],
      "nextPage": 3
    },
    {
      "pages": [
        {
          "_id": "60f0b8b8a6b7a3a0a4f1b0a5",
          "name": "Brown",
          "email": "dbrown@gmail.com",
          "age": 50,
          "address": "1415 Oak St",
          "city": "San Jose",
          "state": "CA",
          "zip": "95110"
        }
      ],
      "nextPage": null
    }
  ]

export default function DatabaseView(){

    const { getDocuments, updateDocument } = useApi(); 
    const [sortByKey, setSortByKey] = useState<string>(""); //unused right now

    const [searchPlaceholder, setSearchPlaceholder] = useState<string>("")
    useTypingEffect(setSearchPlaceholder);

    const [isValidMongoQuery, setIsValidMongoQuery] = useState<boolean>(true);

    const [parentIsEditing, setParentIsEditing] = useState(false);
    const [keys, setKeys] = useState<string[]>(["name", "email", "age", "address", "city", "state", "zip"]);
    
    const { data, error } = useSWRInfinite((index: number) =>
        getDocuments(index + 1, sortByKey)
    );

    useEffect(() => {
        if(data){
            setKeys(data.keys);
        }
    }, [data])

    if (error) return <div className="w-full text-center mt-4">Error loading data</div>
    // if (!data) return <div className="w-full text-center mt-4">Loading...</div>


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
                <input type="text" className="flex-grow p-2 bg-transparent mx-4 border-[#525363] border rounded outline-0 focus:border-[#68697a]" placeholder={searchPlaceholder} />
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
                        {(data || searchExamples).map((pageData: any[], pageIndex: number) =>
                            pageData.pages.map((row: any, rowIndex: number) => (
                                <DatabaseRow
                                key={`page-${pageIndex}-row-${rowIndex}`}
                                keys={keys}
                                data={row}
                                index={pageIndex * PAGE_SIZE + rowIndex}
                                setParentIsEditing={setParentIsEditing}
                                />
                            ))
                        )}
                    </tbody>
                </table>                                        
            </div>
        </div>
    )
}