import { createContext, useContext, useState, useEffect } from 'react';
import { inspectionService } from '../services/inspectionService';

const InspectionContext = createContext();

export const useInspection = () => useContext(InspectionContext);

export const InspectionProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await inspectionService.getInspections();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load inspection history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const runNewInspection = async (file, templateId) => {
    try {
      const result = await inspectionService.runInspection(file, templateId);

      const newRecord = {
        ...result,
        id: `INS-${Math.floor(Math.random() * 9000) + 1000}`,
        timestamp: new Date().toISOString()
      };

      setHistory(prev => [newRecord, ...prev]);
      setCurrentResult(newRecord);
      return newRecord;
    } catch (err) {
      console.error('Inspection failed:', err);
      throw err;
    }
  };

  const addInspection = (record) => {
    const newRecord = {
      ...record,
      id: record.id || `INS-${Math.floor(Math.random() * 9000) + 1000}`,
      timestamp: record.timestamp || new Date().toISOString()
    };
    setHistory(prev => [newRecord, ...prev]);
    setCurrentResult(newRecord);
  };

  const updateInspection = (updatedRecord) => {
    setHistory(prev => prev.map(item => item.id === updatedRecord.id ? updatedRecord : item));
    if (currentResult?.id === updatedRecord.id) {
      setCurrentResult(updatedRecord);
    }
  };

  return (
    <InspectionContext.Provider value={{
      history,
      currentResult,
      setCurrentResult,
      runNewInspection,
      addInspection,
      updateInspection,
      loading
    }}>
      {children}
    </InspectionContext.Provider>
  );
};
