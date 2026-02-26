import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../axious/api";

const CACHE_TTL_MS = 5 * 60 * 1000;

const ResidentNotificationsContext = createContext(null);

export const ResidentNotificationsProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchedAt = useRef(null);

  const fetchLogs = useCallback(async ({ force = false } = {}) => {
    const isStale =
      !lastFetchedAt.current ||
      Date.now() - lastFetchedAt.current > CACHE_TTL_MS;

    if (!force && !isStale) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/resident-logs");
      setLogs(Array.isArray(data) ? data : []);
      lastFetchedAt.current = Date.now();
    } catch {
      setError("Failed to load your activity history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const refresh = useCallback(() => fetchLogs({ force: true }), [fetchLogs]);
  const invalidate = useCallback(() => {
    lastFetchedAt.current = null;
  }, []);

  return (
    <ResidentNotificationsContext.Provider
      value={{ logs, isLoading, error, refresh, invalidate }}
    >
      {children}
    </ResidentNotificationsContext.Provider>
  );
};

export const useResidentNotifications = () => {
  const ctx = useContext(ResidentNotificationsContext);
  if (!ctx)
    throw new Error(
      "useResidentNotifications must be used inside <ResidentNotificationsProvider>",
    );
  return ctx;
};
