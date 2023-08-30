import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import SearchModal from '../Utilities/Toast/SearchModal';

const codeSnippets = {
    'api/users': 'const a = 1;',
    'api/people': 'const b = 2;',
    'api/users/id': 'const sum = (a, b) => a + b;',
    'api/const/v1': 'const subtract = (a, b) => a - b;'
  };
  

const SearchCodeButton = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [matchingCode, setMatchingCode] = useState<{ endpoint: string, snippet: string }[]>([]);

  const handleSearch = () => {
    const matches = Object.keys(codeSnippets).filter((endpoint) => 
      codeSnippets[endpoint].includes(searchTerm)
    ).map((matchingEndpoint) => ({
      endpoint: matchingEndpoint,
      snippet: codeSnippets[matchingEndpoint]
    }));
  
    setMatchingCode(matches);
  };
  

  const setTerm = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div>
      {/* Clickable Tab */}
      <div 
    className="border border-gray-400 text-gray-400 hover:text-white w-[184px] py-1.5 rounded relative cursor-pointer hover:bg-[#85869855]"
    onClick={() => setModalOpen(true)}
       >
        <FontAwesomeIcon icon={faSearch} className='ml-2 mx-1'/>
        <span >Search Code...</span>
      </div>
      <SearchModal 
        isModalOpen={isModalOpen} 
        setModalOpen={setModalOpen} 
        searchTerm={searchTerm} 
        handleSearch={handleSearch} 
        matchingCode={matchingCode}
        setTerm={setTerm}
      />
    </div>
  );
};

export default SearchCodeButton;