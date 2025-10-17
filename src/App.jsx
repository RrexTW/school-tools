import React, { useState, useEffect } from 'react'
import SeatsPage from './pages/seats'

function App() {
  const [currentPage, setCurrentPage] = useState('default');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      default:
        return <SeatsPage />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  )
}

export default App
