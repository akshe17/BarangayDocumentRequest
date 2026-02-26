import React, { useState } from "react";
import {
  FileText,
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { useResidentHistory } from "../../context/ResidentHistoryContext";
import Skeleton from "../../components/Skeleton";

/* ─────────────────────────────────────────────────────────────
   INJECT CARD FADE-UP ANIMATION (shimmer comes from Skeleton.jsx)
 
/* ─────────────────────────────────────────────────────────────
   STATUS CONFIG
   ───────────────────────────────────────────────────────────── */
const STATUS = {
  pending: {
    label: "Pending",
    Icon: Clock,
    dot: "#f59e0b",
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    accent: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    Icon: CheckCircle2,
    dot: "#3b82f6",
    pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    accent: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    Icon: CheckCircle2,
    dot: "#10b981",
    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    accent: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    Icon: XCircle,
    dot: "#ef4444",
    pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
    accent: "bg-red-500",
  },
  "ready for pickup": {
    label: "Ready for Pickup",
    Icon: PackageCheck,
    dot: "#8b5cf6",
    pill: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    accent: "bg-violet-500",
  },
};

const getStatus = (name = "") =>
  STATUS[name.toLowerCase()] ?? {
    label: name || "Unknown",
    Icon: FileText,
    dot: "#94a3b8",
    pill: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
    accent: "bg-slate-400",
  };

/* ─────────────────────────────────────────────────────────────
   FILTER TABS
   ───────────────────────────────────────────────────────────── */
const TABS = [
  "All",
  "Pending",
  "Approved",
  "Ready for Pickup",
  "Completed",
  "Rejected",
];

const FilterTabs = ({ active, onChange, counts }) => (
  <div className="flex gap-1.5 flex-wrap">
    {TABS.map((tab) => {
      const key = tab.toLowerCase();
      const isActive = active === key;
      const count = counts[key] ?? 0;
      const cfg = key === "all" ? null : getStatus(key);

      return (
        <button
          key={tab}
          onClick={() => onChange(key)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            isActive
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-white text-gray-500 ring-1 ring-gray-200 hover:ring-gray-300 hover:text-gray-700"
          }`}
        >
          {cfg && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: isActive ? "white" : cfg.dot }}
            />
          )}
          {tab === "Ready for Pickup" ? "Pickup" : tab}
          {count > 0 && (
            <span
              className={`text-[10px] font-bold tabular-nums px-1 rounded ${
                isActive ? "text-white/70" : "text-gray-400"
              }`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SKELETON CARD — built with shared Skeleton primitives,
   mirrors HistoryCard layout exactly
   ───────────────────────────────────────────────────────────── */
const SkeletonHistoryCard = ({ delay = 0 }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100 p-5"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between gap-4">
      {/* Left: icon + text lines */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Skeleton.Block className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          {/* REQ-xxx · date */}
          <Skeleton.Block className="h-2.5 w-28" />
          {/* Document name */}
          <Skeleton.Block className="h-4 w-48" />
          {/* Purpose */}
          <Skeleton.Block className="h-3 w-36" />
        </div>
      </div>

      {/* Right: fee + status pill */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="space-y-1.5 hidden sm:block">
          <Skeleton.Block className="h-2.5 w-6 ml-auto" />
          <Skeleton.Block className="h-4 w-14" />
        </div>
        <Skeleton.Block className="h-7 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

const SkeletonHistoryList = ({ count = 6 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonHistoryCard key={i} delay={i * 60} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   HISTORY CARD
   ───────────────────────────────────────────────────────────── */
const HistoryCard = ({ req, index }) => {
  const statusName = req.status?.status_name || "Pending";
  const cfg = getStatus(statusName);
  const StatusIcon = cfg.Icon;
  const fee = parseFloat(req.document_type?.fee || 0);
  const reason = req.remarks || req.rejection_reason || req.reason;
  const isRejected = statusName.toLowerCase() === "rejected";

  const date = new Date(req.request_date || req.created_at).toLocaleDateString(
    "en-PH",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <div
      className=" bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top accent line using status color */}
      <div
        className={`h-0.5 ${cfg.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          {/* ── LEFT: Icon + metadata ── */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Status-tinted icon block */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.pill}`}
            >
              <StatusIcon size={18} strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              {/* Request ID + date */}
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                  REQ-{req.request_id}
                </span>
                <span className="text-gray-200 text-xs">·</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {date}
                </span>
              </div>

              {/* Document name */}
              <p className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                {req.document_type?.document_name ?? "—"}
              </p>

              {/* Purpose */}
              <p className="text-xs text-gray-400 truncate mt-0.5 italic">
                {req.purpose || "No purpose stated"}
              </p>
            </div>
          </div>

          {/* ── RIGHT: Fee + status pill ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Fee (hidden on xs) */}
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider mb-0.5">
                Fee
              </p>
              <p className="text-sm font-black text-gray-800 tabular-nums">
                {fee === 0 ? (
                  <span className="text-emerald-600 text-xs font-bold">
                    Free
                  </span>
                ) : (
                  `₱${fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                )}
              </p>
            </div>

            {/* Status pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cfg.pill}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: cfg.dot }}
              />
              {statusName === "Ready for Pickup" ? "Pickup" : statusName}
            </span>
          </div>
        </div>

        {/* ── Remarks / Rejection reason ── */}
        {reason && (
          <div
            className={`mt-4 flex items-start gap-3 p-3.5 rounded-xl text-xs leading-relaxed ${
              isRejected
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-sky-50 text-sky-700 border border-sky-100"
            }`}
          >
            {isRejected ? (
              <XCircle size={14} className="shrink-0 mt-0.5" />
            ) : (
              <Info size={14} className="shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block mb-0.5">
                {isRejected ? "Rejection Reason" : "Admin Remarks"}
              </span>
              <span className="font-medium">{reason}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
   ───────────────────────────────────────────────────────────── */
const EmptyState = ({ filtered }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
      <Inbox size={22} className="text-gray-300" />
    </div>
    <p className="text-sm font-bold text-gray-400">
      {filtered ? "No matching requests" : "No requests yet"}
    </p>
    <p className="text-xs text-gray-300 text-center max-w-xs">
      {filtered
        ? "Try a different filter to see your other requests."
        : "Your submitted document requests will appear here."}
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN
   ───────────────────────────────────────────────────────────── */
const ResidentHistory = () => {
  const { historyData, isLoading, error, refresh } = useResidentHistory();
  const [filter, setFilter] = useState("all");

  // Build tab counts
  const counts = React.useMemo(() => {
    const c = { all: historyData.length };
    historyData.forEach((r) => {
      const key = (r.status?.status_name ?? "").toLowerCase();
      c[key] = (c[key] ?? 0) + 1;
    });
    return c;
  }, [historyData]);

  const filtered =
    filter === "all"
      ? historyData
      : historyData.filter(
          (r) => (r.status?.status_name ?? "").toLowerCase() === filter,
        );

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 pb-24 space-y-8">
      {/* ── PAGE HEADER ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
            Barangay Portal
          </p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Request History
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track all your document applications.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:text-gray-700 disabled:opacity-40 transition-all"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── FILTER TABS ── */}
      <FilterTabs active={filter} onChange={setFilter} counts={counts} />

      {/* ── CONTENT ── */}
      {isLoading ? (
        <SkeletonHistoryList count={6} />
      ) : error ? (
        <div className="flex items-center gap-4 p-5 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filtered={filter !== "all"} />
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => (
            <HistoryCard key={req.request_id} req={req} index={i} />
          ))}
        </div>
      )}

      {/* ── FOOTER NOTICE ── */}
      {!isLoading && !error && (
        <div className="flex items-start gap-4 p-5 bg-gray-900 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <Info size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white mb-0.5">
              Official Notice
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Processing times vary by document type. Keep your contact details
              updated to receive SMS and email notifications.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentHistory;
