import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../axious/api";
import {
  Terminal,
  Search,
  User,
  Edit,
  Trash2,
  Shield,
  Clock,
  Calendar,
  XCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Database,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   ACTION STYLE MAP
   ───────────────────────────────────────────────────────────── */
const getActionStyle = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("delete"))
    return {
      type: "delete",
      label: "DELETE",
      badge: "bg-red-50 text-red-600 ring-1 ring-red-100",
      bar: "bg-red-400",
      icon: <Trash2 size={13} />,
    };
  if (a.includes("update") || a.includes("edit"))
    return {
      type: "update",
      label: "UPDATE",
      badge: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
      bar: "bg-sky-400",
      icon: <Edit size={13} />,
    };
  if (a.includes("password"))
    return {
      type: "security",
      label: "SECURITY",
      badge: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
      bar: "bg-violet-400",
      icon: <Shield size={13} />,
    };
  if (a.includes("enabled") || a.includes("active"))
    return {
      type: "active",
      label: "ENABLED",
      badge: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
      bar: "bg-emerald-400",
      icon: <UserCheck size={13} />,
    };
  if (a.includes("disabled"))
    return {
      type: "inactive",
      label: "DISABLED",
      badge: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
      bar: "bg-amber-400",
      icon: <XCircle size={13} />,
    };
  return {
    type: "general",
    label: "EVENT",
    badge: "bg-slate-50 text-slate-500 ring-1 ring-slate-100",
    bar: "bg-slate-300",
    icon: <Terminal size={13} />,
  };
};

/* ─────────────────────────────────────────────────────────────
   SKELETON ROW
   ───────────────────────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="flex items-start gap-4 px-5 py-4 border-b border-slate-100 animate-pulse">
    <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0 mt-0.5" />
    <div className="flex-1 space-y-2.5 min-w-0">
      <div className="flex items-center gap-2">
        <div className="w-16 h-4 rounded bg-slate-100" />
        <div className="w-32 h-4 rounded bg-slate-100" />
      </div>
      <div className="w-3/4 h-3 rounded bg-slate-100" />
      <div className="w-24 h-3 rounded bg-slate-100" />
    </div>
    <div className="space-y-1.5 text-right shrink-0">
      <div className="w-14 h-3 rounded bg-slate-100 ml-auto" />
      <div className="w-20 h-3 rounded bg-slate-100 ml-auto" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   PAGINATION BUTTON
   ───────────────────────────────────────────────────────────── */
const PageBtn = ({ onClick, disabled, active, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all
      ${
        active
          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
          : disabled
            ? "text-slate-200 cursor-not-allowed"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      }`}
  >
    {children}
  </button>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */
const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilter] = useState("all");
  const [dateFilter, setDate] = useState("all");
  const [page, setPage] = useState(1);

  const searchDebounce = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  /* ── Fetch ── */
  const fetchLogs = useCallback(
    async (resetPage = false) => {
      const currentPage = resetPage ? 1 : page;
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/admin/audit-logs", {
          params: {
            search: debouncedSearch,
            type: filterType,
            date: dateFilter,
            page: currentPage,
            per_page: 15,
          },
        });
        setLogs(data.data);
        setMeta(data.meta);
      } catch (err) {
        console.error("Audit Fetch Error:", err);
        setError(err?.response?.data?.message ?? "Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterType, dateFilter, page],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const applyFilter = (setter, val) => {
    setter(val);
    setPage(1);
  };

  /* ── Format helpers ── */
  const fmt = (iso) => {
    const d = new Date(iso);
    return {
      time: d.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  /* ── Pagination page numbers ── */
  const pageNumbers = () => {
    if (!meta) return [];
    const total = meta.last_page;
    const cur = meta.current_page;
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3) pages.push("…");
      for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++)
        pages.push(i);
      if (cur < total - 2) pages.push("…");
      pages.push(total);
    }
    return pages;
  };

  const TYPE_FILTERS = [
    "all",
    "update",
    "delete",
    "security",
    "active",
    "inactive",
  ];
  const DATE_FILTERS = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                <Terminal size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  System Audit
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-600 tracking-widest uppercase">
                    Live Stream Active
                  </span>
                </div>
              </div>
            </div>
            {meta && !loading && (
              <p className="text-[11px] text-slate-400 font-medium">
                <span className="text-slate-600 font-bold">
                  {meta.total.toLocaleString()}
                </span>{" "}
                total events
                {meta.from && meta.to && (
                  <>
                    {" "}
                    · showing{" "}
                    <span className="text-slate-600 font-bold">
                      {meta.from}–{meta.to}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>

          <button
            onClick={() => fetchLogs(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold hover:border-slate-300 hover:text-slate-700 hover:shadow-sm transition-all disabled:opacity-40 shrink-0"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-3 shadow-sm">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              placeholder="Search action, details, or admin name…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter size={12} className="text-slate-300 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => applyFilter(setFilter, t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                    filterType === t
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex gap-1.5">
              {DATE_FILTERS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => applyFilter(setDate, d.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    dateFilter === d.value
                      ? "bg-slate-100 text-slate-800 ring-1 ring-slate-200"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Log Table ── */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-8" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Event / Details
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
              Timestamp
            </span>
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 ring-1 ring-red-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <p className="text-slate-800 font-bold text-sm">
                Connection Error
              </p>
              <p className="text-slate-400 text-xs">{error}</p>
              <button
                onClick={() => fetchLogs()}
                className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center">
                <Database size={18} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold text-sm">
                No matching events
              </p>
              <p className="text-slate-400 text-xs">
                Adjust your filters to find what you're looking for
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => {
                const style = getActionStyle(log.action);
                const { time, date } = fmt(log.created_at);
                const userName = log.user
                  ? `${log.user.first_name} ${log.user.last_name}`
                  : "System";
                const userRole = log.user?.role?.role_name ?? "System Process";

                return (
                  <div
                    key={log.log_id}
                    className="group flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* Type icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style.badge}`}
                    >
                      {style.icon}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${style.badge}`}
                        >
                          {style.label}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 truncate">
                          {log.action}
                        </h3>
                        <span className="text-[10px] text-slate-300 ml-auto hidden sm:block font-mono">
                          #{log.log_id}
                        </span>
                      </div>

                      {log.details && (
                        <p className="text-xs text-slate-400 leading-relaxed truncate max-w-lg">
                          {log.details}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center">
                            <User size={9} className="text-slate-400" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">
                            {userName}
                          </span>
                        </div>
                        <span className="text-slate-200">·</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                          {userRole}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-xs font-black text-slate-700">
                        {time}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {date}
                      </p>
                      <div
                        className={`w-full h-0.5 rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${style.bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Page {meta.current_page} of {meta.last_page}
            </span>

            <div className="flex items-center gap-1">
              <PageBtn
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1 || loading}
              >
                <ChevronLeft size={14} />
              </PageBtn>

              {pageNumbers().map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="text-slate-300 px-1 text-xs"
                  >
                    …
                  </span>
                ) : (
                  <PageBtn
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={loading}
                    active={p === meta.current_page}
                  >
                    {p}
                  </PageBtn>
                ),
              )}

              <PageBtn
                onClick={() => setPage((p) => p + 1)}
                disabled={page === meta.last_page || loading}
              >
                <ChevronRight size={14} />
              </PageBtn>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        {!loading && logs.length > 0 && (
          <div className="text-center">
            <span className="text-[10px] text-slate-300 uppercase tracking-[0.25em] font-medium">
              ◆ end of stream ◆
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
