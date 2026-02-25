import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../axious/api";
import { useAuth } from "./AuthContext";

/* ─────────────────────────────────────────────────────────────
   CACHE SETTINGS
   ───────────────────────────────────────────────────────────── */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — tweak as needed

const DEFAULT_DATA = {
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    ready: 0,
  },
  recent_requests: [],
};

/* ─────────────────────────────────────────────────────────────
   CONTEXT
   ───────────────────────────────────────────────────────────── */
const ResidentDashboardContext = createContext(null);

export const ResidentDashboardProvider = ({ children }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store the timestamp of the last successful fetch
  const lastFetchedAt = useRef(null);

  const fetchDashboardData = useCallback(
    async ({ force = false } = {}) => {
      if (!user) return;

      // Skip the network call if cached data is still fresh
      const isStale =
        !lastFetchedAt.current ||
        Date.now() - lastFetchedAt.current > CACHE_TTL_MS;

      if (!force && !isStale) return;

      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get("/resident/dashboard");
        setDashboardData(data);
        lastFetchedAt.current = Date.now();
      } catch {
        setError("Unable to sync dashboard data.");
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  // Load on mount / when user changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Expose a manual refresh that always bypasses the cache
  const refresh = useCallback(
    () => fetchDashboardData({ force: true }),
    [fetchDashboardData],
  );

  // Call this after a new request is submitted so the dashboard reflects it
  const invalidate = useCallback(() => {
    lastFetchedAt.current = null;
  }, []);

  return (
    <ResidentDashboardContext.Provider
      value={{ dashboardData, isLoading, error, refresh, invalidate }}
    >
      {children}
    </ResidentDashboardContext.Provider>
  );
};

/* ─────────────────────────────────────────────────────────────
   HOOK
   ───────────────────────────────────────────────────────────── */
export const useResidentDashboard = () => {
  const ctx = useContext(ResidentDashboardContext);
  if (!ctx)
    throw new Error(
      "useResidentDashboard must be used inside <ResidentDashboardProvider>",
    );
  return ctx;
};
