import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  PackageCheck,
  Calendar,
  ChevronDown,
  Zap,
} from "lucide-react";
import api from "../../axious/api";
/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

/* ─────────────────────────────────────────────────────────────
   ACTION CONFIG — color + icon per action string
───────────────────────────────────────────────────────────── */
const ACTION_CONFIG = {
  "APPROVE REQUEST": { color: "emerald", Icon: CheckCircle, label: "Approved" },
  "MARKED READY FOR PICKUP": {
    color: "emerald",
    Icon: PackageCheck,
    label: "Ready for Pickup",
  },
  "REJECT REQUEST": { color: "red", Icon: XCircle, label: "Rejected" },
  "CONFIRM COLLECTION": {
    color: "blue",
    Icon: PackageCheck,
    label: "Collected",
  },
  "RESCHEDULE PICKUP": { color: "amber", Icon: Calendar, label: "Rescheduled" },
  AUTO_READY_FOR_PICKUP: { color: "violet", Icon: Zap, label: "Auto Ready" },
};

const COLOR_CLASSES = {
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    icon: "text-emerald-500",
    dot: "bg-emerald-500",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-700",
    icon: "text-red-500",
    dot: "bg-red-500",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-700",
    icon: "text-blue-500",
    dot: "bg-blue-500",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    icon: "text-amber-500",
    dot: "bg-amber-400",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-100",
    text: "text-violet-700",
    icon: "text-violet-500",
    dot: "bg-violet-500",
  },
  gray: {
    bg: "bg-gray-50",
    border: "border-gray-100",
    text: "text-gray-600",
    icon: "text-gray-400",
    dot: "bg-gray-400",
  },
};

const getActionCfg = (action) =>
  ACTION_CONFIG[action] ?? {
    color: "gray",
    Icon: ClipboardList,
    label: action,
  };

/* ─────────────────────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[9px] font-black tracking-[0.12em] uppercase text-gray-400 mb-1">
    {children}
  </p>
);

const ActionBadge = ({ action }) => {
  const cfg = getActionCfg(action);
  const colors = COLOR_CLASSES[cfg.color];
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider
      uppercase px-2.5 py-1 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}
    >
      <Icon size={9} />
      {cfg.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   TABLE ROW
───────────────────────────────────────────────────────────── */
const LogTableRow = ({ log, isLast }) => {
  const cfg = getActionCfg(log.action);
  const colors = COLOR_CLASSES[cfg.color];
  const u = log.user;

  return (
    <tr
      className="transition-colors bg-gray-50 hover:bg-gray-100"
      style={{ borderBottom: isLast ? "none" : "1px solid #e5e7eb" }}
    >
      {/* Action */}
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0
            ${colors.bg} ${colors.border}`}
          >
            <cfg.Icon size={13} className={colors.icon} />
          </div>
          <div>
            <ActionBadge action={log.action} />
          </div>
        </div>
      </td>

      {/* Clerk */}
      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
        {u ? (
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {u.first_name} {u.last_name}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
          </div>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-violet-600
                           bg-violet-50 border border-violet-100 px-2 py-1 rounded-lg font-semibold"
          >
            <Zap size={10} /> System
          </span>
        )}
      </td>

      {/* Request ID */}
      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
        {log.request_id ? (
          <span
            className="text-xs font-mono font-bold text-gray-600 bg-gray-100
                           px-2.5 py-1 rounded-lg"
          >
            REQ-{String(log.request_id).padStart(4, "0")}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Details */}
      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell max-w-[260px]">
        <p className="text-xs text-gray-500 truncate">{log.details ?? "—"}</p>
      </td>

      {/* Timestamp */}
      <td className="px-4 sm:px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Clock size={10} className="text-gray-300 shrink-0" />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {fmtDateTime(log.created_at)}
          </span>
        </div>
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN — ACTIVITY LOGS
───────────────────────────────────────────────────────────── */
const ClerkLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/clerk/logs");
      setLogs(res.data);
      setLastFetched(new Date());
    } catch (err) {
      setError("Failed to load activity logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Unique action types for the filter dropdown ───────────────
  const actionTypes = [...new Set(logs.map((l) => l.action))].sort();

  const filtered = logs.filter((log) => {
    const u = log.user;
    const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.toLowerCase();
    const reqId = String(log.request_id ?? "");
    const details = (log.details ?? "").toLowerCase();
    const matchSearch =
      name.includes(searchTerm.toLowerCase()) ||
      reqId.includes(searchTerm) ||
      details.includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[0.14em] uppercase text-emerald-500 mb-1">
                Clerk Management
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Activity Logs
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {loading
                  ? "Loading…"
                  : `${filtered.length} log${filtered.length !== 1 ? "s" : ""}`}
                {lastFetched && (
                  <span className="text-gray-300 ml-2 text-[10px]">
                    · synced {lastFetched.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl border border-gray-200 text-gray-400
                         hover:text-emerald-600 hover:border-emerald-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Search + Action filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2
                                           text-gray-300 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by clerk name, Request ID, or details…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                           text-sm text-gray-800 placeholder:text-gray-300 font-medium
                           focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
              />
            </div>

            {/* Action type dropdown */}
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 bg-gray-50 border border-gray-200
                           rounded-xl text-sm text-gray-700 font-semibold cursor-pointer
                           focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
              >
                <option value="all">All Actions</option>
                {actionTypes.map((a) => (
                  <option key={a} value={a}>
                    {getActionCfg(a).label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2
                                                text-gray-300 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-4">
          <div
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 text-sm text-red-600"
          >
            <AlertCircle size={14} /> {error}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                {[
                  { label: "Action", cls: "" },
                  { label: "Clerk", cls: "hidden sm:table-cell" },
                  { label: "Request", cls: "hidden md:table-cell" },
                  { label: "Details", cls: "hidden lg:table-cell" },
                  { label: "Timestamp", cls: "text-right" },
                ].map(({ label, cls }) => (
                  <th
                    key={label}
                    className={`px-4 sm:px-6 py-3.5 text-left text-[9px] font-black
                                tracking-[0.12em] uppercase text-gray-400 ${cls}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-emerald-500 mx-auto mb-3"
                    />
                    <p className="text-xs text-gray-300">
                      Loading activity logs…
                    </p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <ClipboardList
                      size={28}
                      className="text-gray-200 mx-auto mb-3"
                    />
                    <p className="text-sm font-bold text-gray-400">
                      {searchTerm || actionFilter !== "all"
                        ? "No logs match your search"
                        : "No activity logs yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((log, i) => (
                  <LogTableRow
                    key={log.log_id}
                    log={log}
                    isLast={i === filtered.length - 1}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-gray-300 mt-4 px-1 text-right">
            Showing {filtered.length} of {logs.length} entries · Most recent
            first
          </p>
        )}
      </div>
    </div>
  );
};

export default ClerkLogs;
