import { createContext, useContext, useState } from "react";
const RefreshContext = createContext(void 0);
export function RefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };
  const setAuthentication = (authStatus, data) => {
    setIsAuthenticated(authStatus);
    setUserData(data || null);
    triggerRefresh();
  };
  return <RefreshContext.Provider value={{
    refreshKey,
    isAuthenticated,
    userData,
    triggerRefresh,
    setAuthentication
  }}>
      {children}
    </RefreshContext.Provider>;
}
export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === void 0) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }
  return context;
}
