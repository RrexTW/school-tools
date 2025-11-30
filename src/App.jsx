import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import SeatsPage from './pages/Seats'
import Sidebar from './components/Sidebar'

function App() {
  const [currentPage, setCurrentPage] = useState('seat');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      default:
        return <SeatsPage />;
    }
  };

  // 注意：Sidebar 預設寬度為 64 或 192（px），此處不強制 margin-left，
  // 因為 Sidebar 本身非固定定位，主內容會自動排列於右側。
  const appStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#f3f4f6', // light gray
    color: '#111827',
    boxSizing: 'border-box',
  };

  const contentStyle = {
    flex: 1,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={appStyle}>
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <div style={contentStyle}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              alignItems: 'flex-start',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
