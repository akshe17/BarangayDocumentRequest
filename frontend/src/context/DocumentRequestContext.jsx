import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../axious/api";

/* ─────────────────────────────────────────────────────────────
   CONTEXT
───────────────────────────────────────────────────────────── */
export const DocumentRequestContext = createContext(null);

/* ─────────────────────────────────────────────────────────────
   PROVIDER
   Wrap your clerk layout (or App.jsx) with this so all clerk
   pages share one data fetch.

   Example:
     <DocumentRequestProvider>
       <ClerkLayout />
     </DocumentRequestProvider>
───────────────────────────────────────────────────────────── */
export function DocumentRequestProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  const [error, setError] = useState(null);

  // ── Full fetch (call once on mount, or after destructive actions) ──
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/clerk/requests/all");
      setRequests(res.data);
      setLastFetched(new Date());
    } catch (err) {
      console.error("[DocumentRequestContext] fetch failed:", err);
      setError("Failed to load requests. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Optimistic single-request update (no full reload needed) ──
  // Call this after approve/reject/collect — pass the updated request
  // object returned by the API so the list reflects the change instantly.
  const updateRequest = useCallback((updated) => {
    setRequests((prev) =>
      prev.map((r) => (r.request_id === updated.request_id ? updated : r)),
    );
  }, []);

  // ── Filter helpers ──
  const byStatus = useCallback(
    (statusId) =>
      requests.filter((r) =>
        Array.isArray(statusId)
          ? statusId.includes(r.status_id)
          : r.status_id === statusId,
      ),
    [requests],
  );

  const getById = useCallback(
    (id) => requests.find((r) => r.request_id === id) ?? null,
    [requests],
  );

  return (
    <DocumentRequestContext.Provider
      value={{
        requests,
        loading,
        lastFetched,
        error,
        refresh,
        updateRequest,
        byStatus,
        getById,
      }}
    >
      {children}
    </DocumentRequestContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────────── */
export function useDocumentRequests() {
  const ctx = useContext(DocumentRequestContext);
  if (!ctx) {
    throw new Error(
      "useDocumentRequests must be used inside <DocumentRequestProvider>.",
    );
  }
  return ctx;
}
