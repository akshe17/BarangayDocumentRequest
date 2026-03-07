import React, { createContext, useContext, useRef, useCallback } from "react";

/**
 * ResidentSyncContext
 *
 * Thin orchestrator — holds refs to each resident context's force-refresh
 * function. Any context (or component) can call refreshAll() to re-fetch
 * all four data sources at once.
 *
 * Usage:
 *   1. Wrap your resident layout in <ResidentSyncProvider>
 *   2. Each context registers itself via registerRefresh(key, fn) on mount
 *   3. Call useResidentSync().refreshAll() from anywhere to sync everything
 */

const ResidentSyncContext = createContext(null);

export const ResidentSyncProvider = ({ children }) => {
  // Registry: key → force-refresh function for each context
  const registry = useRef({});

  const registerRefresh = useCallback((key, fn) => {
    registry.current[key] = fn;
    // Return an unregister function for cleanup
    return () => {
      delete registry.current[key];
    };
  }, []);

  const refreshAll = useCallback(() => {
    Object.values(registry.current).forEach((fn) => fn());
  }, []);

  return (
    <ResidentSyncContext.Provider value={{ registerRefresh, refreshAll }}>
      {children}
    </ResidentSyncContext.Provider>
  );
};

export const useResidentSync = () => {
  const ctx = useContext(ResidentSyncContext);
  if (!ctx)
    throw new Error(
      "useResidentSync must be used inside <ResidentSyncProvider>",
    );
  return ctx;
};
