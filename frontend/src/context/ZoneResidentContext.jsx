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

const BASE_URL = "http://localhost:8000";

/* ─────────────────────────────────────────────────────────────
   PARSER — captures every field the API returns so the detail
   view can display all resident information without a 2nd fetch
───────────────────────────────────────────────────────────── */
export const parseResidents = (data) =>
  data.map((r) => ({
    // ── Identity (flat on root — from users table) ────────────
    id: r.resident_id,
    userId: r.user_id,
    firstName: r.first_name ?? "",
    lastName: r.last_name ?? "",
    name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
    email: r.email || "No Email",
    avatar:
      `${r.first_name?.[0] ?? "?"}${r.last_name?.[0] ?? "?"}`.toUpperCase(),

    // ── Verification ──────────────────────────────────────────
    status:
      r.is_verified === null || r.is_verified === undefined
        ? "Pending"
        : r.is_verified
          ? "Verified"
          : "Rejected",
    rejectionReason: r.rejection_reason ?? null,

    // ── Resident personal details (nested under resident{}) ───
    birthdate: r.resident?.birthdate ?? null,
    gender: r.resident?.gender?.gender_name ?? null,
    civilStatus: r.resident?.civil_status?.status_name ?? null,
    houseNo: r.resident?.house_no ?? null,

    // ── Zone (nested under zone{}) ────────────────────────────
    zone: r.zone?.zone_name ?? null,

    // ── ID document ───────────────────────────────────────────
    idUrl: r.id_image_path ? `${BASE_URL}/storage/${r.id_image_path}` : null,

    // ── Timestamps ────────────────────────────────────────────
    date: new Date(r.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    createdAt: r.created_at ?? null,
  }));

/* ─────────────────────────────────────────────────────────────
   CONTEXT
───────────────────────────────────────────────────────────── */
const ZoneResidentContext = createContext(null);

export const ZoneResidentProvider = ({ children }) => {
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const lastFetchedAt = useRef(null);

  /* ── Fetch — skips network if cache is still fresh ── */
  const fetchResidents = useCallback(async ({ force = false } = {}) => {
    const isStale =
      !lastFetchedAt.current ||
      Date.now() - lastFetchedAt.current > CACHE_TTL_MS;

    if (!force && !isStale) return; // still fresh, do nothing

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/zone-leader/residents");
      if (!Array.isArray(data)) {
        setResidents([]);
        return;
      }
      setResidents(parseResidents(data));
      lastFetchedAt.current = Date.now();
      setLastFetched(new Date());
    } catch {
      setError("Failed to fetch zone residents.");
      setResidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  /* ── Force refresh (refresh button) ── */
  const refresh = useCallback(
    () => fetchResidents({ force: true }),
    [fetchResidents],
  );

  /* ── Optimistic patch — updates the cached list instantly after
     a verify/reject without waiting for a full re-fetch ── */
  const updateResident = useCallback((id, patch) => {
    setResidents((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }, []);

  return (
    <ZoneResidentContext.Provider
      value={{
        residents,
        isLoading,
        error,
        lastFetched,
        refresh,
        updateResident,
      }}
    >
      {children}
    </ZoneResidentContext.Provider>
  );
};

/* ─────────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────────── */
export const useZoneResidents = () => {
  const ctx = useContext(ZoneResidentContext);
  if (!ctx)
    throw new Error(
      "useZoneResidents must be used inside <ZoneResidentProvider>",
    );
  return ctx;
};
