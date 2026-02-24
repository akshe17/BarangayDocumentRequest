import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import api from "../axious/api";
const AdminResidentContext = createContext();

export const AdminResidentProvider = ({ children }) => {
  const [residents, setResidents] = useState([]);
  const [meta, setMeta] = useState({
    zones: [],
    genders: [],
    civil_statuses: [],
  });
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);

  // Fetch all residents
  const fetchResidents = useCallback(
    async (force = false) => {
      // Only fetch if we have no data or if forced
      if (residents.length > 0 && !force) return;

      setLoading(true);
      try {
        const res = await api.get("/admin/residents");
        setResidents(res.data);
      } catch (err) {
        console.error("Failed to fetch residents:", err);
      } finally {
        setLoading(false);
      }
    },
    [residents.length],
  );

  // Fetch metadata (Zones, Genders, etc.)
  const fetchMeta = useCallback(async () => {
    if (meta.zones.length > 0) return; // Already loaded

    setMetaLoading(true);
    try {
      const res = await api.get("/admin/residents/meta");
      setMeta(res.data);
    } catch (err) {
      console.error("Failed to fetch meta:", err);
    } finally {
      setMetaLoading(false);
    }
  }, [meta.zones.length]);

  // Update a single resident in the local state after an API call
  const updateResidentInState = (userId, updatedData) => {
    setResidents((prev) =>
      prev.map((r) => (r.user_id === userId ? { ...r, ...updatedData } : r)),
    );
  };

  // Remove a resident from local state
  const deleteResidentFromState = (userId) => {
    setResidents((prev) => prev.filter((r) => r.user_id !== userId));
  };

  // Load meta on mount
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  return (
    <AdminResidentContext.Provider
      value={{
        residents,
        meta,
        loading,
        metaLoading,
        fetchResidents,
        updateResidentInState,
        deleteResidentFromState,
      }}
    >
      {children}
    </AdminResidentContext.Provider>
  );
};

export const useAdminResidents = () => useContext(AdminResidentContext);
