import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [businessName, setBusinessNameState] = useState('My Shop');

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const setBusinessName = useCallback((name) => {
    setBusinessNameState(name);
  }, []);

  return (
    <AppContext.Provider value={{ refreshKey, triggerRefresh, businessName, setBusinessName }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};
