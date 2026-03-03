import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import api from "../axious/api";

const OverviewContext = createContext(null);

// ── Module-level cache — survives unmount/remount so navigating
//    away and back never triggers a refetch. ───────────────────
let _cache = null; // the last successful response data
let _fetchPromise = null; // deduplicate concurrent fetches

export const OverviewProvider = ({ children }) => {
  const [data, setData] = useState(_cache);
  const [loading, setLoading] = useState(_cache === null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (force = false) => {
    // Serve cache instantly unless forced (manual refresh)
    if (_cache !== null && !force) {
      setData(_cache);
      setLoading(false);
      return;
    }

    // Deduplicate: if a fetch is already in flight, wait for it
    if (_fetchPromise) {
      await _fetchPromise;
      if (_cache) {
        setData(_cache);
        setLoading(false);
      }
      return;
    }

    force ? setRefreshing(true) : setLoading(true);
    setError(null);

    _fetchPromise = api
      .get("/admin/dashboard/overview")
      .then((res) => {
        _cache = res.data;
        setData(_cache);
      })
      .catch((e) => {
        console.error(e);
        setError(
          e?.response?.data?.message ?? "Failed to load dashboard data.",
        );
      })
      .finally(() => {
        _fetchPromise = null;
        setLoading(false);
        setRefreshing(false);
      });

    await _fetchPromise;
  }, []);

  // Only hits the network on the very first mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manual refresh exposed to consumers — busts cache
  const refresh = useCallback(() => {
    _cache = null;
    return fetchData(true);
  }, [fetchData]);

  return (
    <OverviewContext.Provider
      value={{ data, loading, refreshing, error, refresh }}
    >
      {children}
    </OverviewContext.Provider>
  );
};

export const useOverview = () => {
  const ctx = useContext(OverviewContext);
  if (!ctx)
    throw new Error("useOverview must be used inside <OverviewProvider>");
  return ctx;
};
