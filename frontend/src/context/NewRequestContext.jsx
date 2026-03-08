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
import { useResidentSync } from "./ResidentSyncContext";

/* ─────────────────────────────────────────────────────────────
   CACHE SETTINGS
   ───────────────────────────────────────────────────────────── */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/* ─────────────────────────────────────────────────────────────
   Terminal statuses — a request in one of these states does NOT
   block the resident from submitting a new request for the same
   document. Only active/in-flight requests should block.
   ───────────────────────────────────────────────────────────── */
const TERMINAL_STATUSES = ["completed", "rejected"];

const isTerminal = (statusName = "") =>
  TERMINAL_STATUSES.includes(statusName.toLowerCase());

/* ─────────────────────────────────────────────────────────────
   CONTEXT
   ───────────────────────────────────────────────────────────── */
const NewRequestContext = createContext(null);

export const NewRequestProvider = ({ children }) => {
  const { invalidate: invalidateDashboard } = useResidentDashboard();
  const { refresh: refreshHistory } = useResidentHistory();
  const { refresh: refreshNotifications } = useResidentNotifications();
  const { refreshAll } = useResidentSync();

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

      const allRequests = Array.isArray(reqsRes.data)
        ? reqsRes.data
        : (reqsRes.data?.data ?? []);

      // KEY FIX: only keep active (non-terminal) requests in existingRequests.
      // Completed and rejected requests must NOT block the resident from
      // submitting a new request for the same document type.
      setExistingRequests(
        allRequests.filter((r) => !isTerminal(r.status?.status_name ?? "")),
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

  // Register with global sync orchestrator
  const { registerRefresh } = useResidentSync();
  useEffect(() => {
    const unregister = registerRefresh("newRequest", retry);
    return unregister;
  }, [registerRefresh, retry]);

  /* ── Invalidate cache ── */
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

        // Re-fetch current requests and filter terminal statuses again
        const reqsRes = await api.get("/current-request");
        const allRequests = Array.isArray(reqsRes.data)
          ? reqsRes.data
          : (reqsRes.data?.data ?? []);

        setExistingRequests(
          allRequests.filter((r) => !isTerminal(r.status?.status_name ?? "")),
        );
        lastFetchedAt.current = Date.now();

        // Refresh all resident data contexts at once via the sync orchestrator
        refreshAll();

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
    [invalidateDashboard, refreshHistory, refreshNotifications, refreshAll],
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
