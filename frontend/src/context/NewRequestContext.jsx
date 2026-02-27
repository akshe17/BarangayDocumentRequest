import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../axious/api";
import { useResidentDashboard } from "./ResidentDashboardContext";
import { useResidentHistory } from "./ResidentHistoryContext";
import { useResidentNotifications } from "./ResidentNotificationsContext";

/* ─────────────────────────────────────────────────────────────
   CACHE SETTINGS
   ───────────────────────────────────────────────────────────── */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const DEFAULT_STATE = {
  documentList: [],
  existingRequests: [],
};

/* ─────────────────────────────────────────────────────────────
   CONTEXT
   ───────────────────────────────────────────────────────────── */
const NewRequestContext = createContext(null);

export const NewRequestProvider = ({ children }) => {
  const { invalidate: invalidateDashboard } = useResidentDashboard();
  const { refresh: refreshHistory } = useResidentHistory();
  const { refresh: refreshNotifications } = useResidentNotifications();

  const [documentList, setDocumentList] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lastFetchedAt = useRef(null);

  /* ── Fetch both endpoints in parallel ── */
  const fetchAll = useCallback(async ({ force = false } = {}) => {
    const isStale =
      !lastFetchedAt.current ||
      Date.now() - lastFetchedAt.current > CACHE_TTL_MS;

    if (!force && !isStale) return;

    setIsLoading(true);
    setError(null);

    try {
      const [docsRes, reqsRes] = await Promise.all([
        api.get("/documents"),
        api.get("/current-request"),
      ]);

      setDocumentList(
        Array.isArray(docsRes.data) ? docsRes.data : (docsRes.data?.data ?? []),
      );
      setExistingRequests(
        Array.isArray(reqsRes.data) ? reqsRes.data : (reqsRes.data?.data ?? []),
      );
      lastFetchedAt.current = Date.now();
    } catch {
      setError("Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── Retry (force refresh) ── */
  const retry = useCallback(() => fetchAll({ force: true }), [fetchAll]);

  /* ── Invalidate cache (e.g. after a new request is submitted) ── */
  const invalidate = useCallback(() => {
    lastFetchedAt.current = null;
  }, []);

  /* ── Submit a new request ── */
  const submitRequest = useCallback(
    async ({ documentId, formValues, purpose }) => {
      setIsSubmitting(true);
      try {
        const payload = {
          document_id: documentId,
          purpose,
          form_data: Object.entries(formValues)
            .filter(([, value]) => value !== "")
            .map(([field_id, field_value]) => ({
              field_id: parseInt(field_id),
              field_value,
            })),
        };

        await api.post("/submit-document", payload, {
          headers: { "Content-Type": "application/json" },
        });

        // Refresh existing requests so blocked states are up-to-date
        const reqsRes = await api.get("/current-request");
        setExistingRequests(
          Array.isArray(reqsRes.data)
            ? reqsRes.data
            : (reqsRes.data?.data ?? []),
        );
        lastFetchedAt.current = Date.now();

        // Force-refresh history and notifications so new data shows immediately,
        // and mark the dashboard cache stale for its next render.
        invalidateDashboard();
        refreshHistory();
        refreshNotifications();

        return { success: true };
      } catch (err) {
        const message = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat()[0]
          : err.response?.data?.message ||
            "Failed to submit. Please try again.";
        return { success: false, message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [invalidateDashboard, refreshHistory, refreshNotifications],
  );

  return (
    <NewRequestContext.Provider
      value={{
        documentList,
        existingRequests,
        isLoading,
        error,
        isSubmitting,
        retry,
        invalidate,
        submitRequest,
      }}
    >
      {children}
    </NewRequestContext.Provider>
  );
};

/* ─────────────────────────────────────────────────────────────
   HOOK
   ───────────────────────────────────────────────────────────── */
export const useNewRequest = () => {
  const ctx = useContext(NewRequestContext);
  if (!ctx)
    throw new Error("useNewRequest must be used inside <NewRequestProvider>");
  return ctx;
};
