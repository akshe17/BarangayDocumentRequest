import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../axious/api";
/* ─────────────────────────────────────────────────────────────
   CACHE SETTINGS
   ───────────────────────────────────────────────────────────── */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/* ─────────────────────────────────────────────────────────────
   CONTEXT
   ───────────────────────────────────────────────────────────── */
const ResidentHistoryContext = createContext(null);

export const ResidentHistoryProvider = ({ children }) => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const lastFetchedAt = useRef(null);

  const fetchHistory = useCallback(async ({ force = false } = {}) => {
    const isStale =
      !lastFetchedAt.current ||
      Date.now() - lastFetchedAt.current > CACHE_TTL_MS;

    if (!force && !isStale) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/request-history");
      setHistoryData(Array.isArray(data) ? data : []);
      lastFetchedAt.current = Date.now();
    } catch {
      setError("Failed to sync your history. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const refresh = useCallback(
    () => fetchHistory({ force: true }),
    [fetchHistory],
  );
  const invalidate = useCallback(() => {
    lastFetchedAt.current = null;
  }, []);

  return (
    <ResidentHistoryContext.Provider
      value={{ historyData, isLoading, error, refresh, invalidate }}
    >
      {children}
    </ResidentHistoryContext.Provider>
  );
};

/* ─────────────────────────────────────────────────────────────
   HOOK
   ───────────────────────────────────────────────────────────── */
export const useResidentHistory = () => {
  const ctx = useContext(ResidentHistoryContext);
  if (!ctx)
    throw new Error(
      "useResidentHistory must be used inside <ResidentHistoryProvider>",
    );
  return ctx;
};
