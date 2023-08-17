import React, { useContext } from 'react';
import axios from 'axios';
import { SwizzleContext } from '../Utilities/GlobalContext';
import { useAuthHeader } from 'react-auth-kit';

const BASE_URL = 'https://euler-i733tg4iuq-uc.a.run.app/api/v1';
// const BASE_URL = 'http://localhost:4000/api/v1';

const InsertTestDataButton: React.FC = () => {
  const authHeader = useAuthHeader();
  const { activeProject } = useContext(SwizzleContext);

  const handleInsertTestData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/projects/${activeProject}/insertTestData`, {
        headers: {
          Authorization: authHeader(),
        },
        params: { project_id: activeProject },
      });

      if (response.status !== 200) {
        throw new Error('Failed to insert test data');
      }

      console.log('Test data inserted successfully');
    } catch (error) {
      console.error('Error inserting test data:', error);
    }
  };

  return (
    <button onClick={handleInsertTestData}>Insert Test Data</button>
  );
};

export default InsertTestDataButton;
