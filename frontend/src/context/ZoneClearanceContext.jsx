import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../axious/api";
const ZoneClearanceContext = createContext(null);

/**
 * Fetches ONLY from /zone-leader/clearance — which the backend already scopes
 * to: (1) document types with handler_role_id = 4, and (2) residents whose
 * zone_id matches the authenticated zone leader's zone.
 *
 * This is completely separate from the clerk's DocumentRequestContext.
 */
export const ZoneClearanceProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/zone-leader/clearance");
      setRequests(res.data);
      setLastFetched(new Date());
    } catch (err) {
      setError("Failed to load clearance requests. Please try again.");
      console.error("ZoneClearanceContext fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Return requests filtered by status_id
  const byStatus = (statusId) =>
    requests.filter((r) => Number(r.status_id) === Number(statusId));

  // Look up a single cached request by request_id
  const getById = (requestId) =>
    requests.find((r) => r.request_id === requestId) ?? null;

  // Merge an updated request back into state (called after approve/reject/etc.)
  const updateRequest = (updated) => {
    setRequests((prev) =>
      prev.map((r) => (r.request_id === updated.request_id ? updated : r)),
    );
  };

  return (
    <ZoneClearanceContext.Provider
      value={{
        requests,
        loading,
        error,
        lastFetched,
        refresh: fetchRequests,
        byStatus,
        getById,
        updateRequest,
      }}
    >
      {children}
    </ZoneClearanceContext.Provider>
  );
};

/** Hook — throws if used outside ZoneClearanceProvider */
export const useZoneClearance = () => {
  const ctx = useContext(ZoneClearanceContext);
  if (!ctx) {
    throw new Error(
      "useZoneClearance must be used inside <ZoneClearanceProvider>",
    );
  }
  return ctx;
};
