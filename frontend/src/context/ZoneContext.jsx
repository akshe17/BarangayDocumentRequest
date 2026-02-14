import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../axious/api";
// 1. Create the Context
const ZoneContext = createContext();

// 2. Create the Provider Component
export const ZoneProvider = ({ children }) => {
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [error, setError] = useState(null);

  const fetchZones = async () => {
    setLoadingZones(true);
    setError(null);
    try {
      const response = await api.get("/zones");
      setZones(response.data);
    } catch (err) {
      console.error("Error fetching zones:", err);
      setError(err);
    } finally {
      setLoadingZones(false);
    }
  };

  // Fetch zones on app load
  useEffect(() => {
    fetchZones();
  }, []);

  return (
    <ZoneContext.Provider
      value={{ zones, loadingZones, error, refetchZones: fetchZones }}
    >
      {children}
    </ZoneContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useZones = () => {
  return useContext(ZoneContext);
};
