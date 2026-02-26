import React from "react";
import {
  Clock,
  AlertCircle,
  History,
  FileText,
  UserCheck,
  Settings,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { useResidentNotifications } from "../../context/ResidentNotificationsContext";
import Skeleton from "../../components/Skeleton";

/* ─────────────────────────────────────────────────────────────
   INJECT FADE-UP ANIMATION
   ───────────────────────────────────────────────────────────── */
const STYLE_ID = "rn-styles";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes rn-fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .rn-item { animation: rn-fade-up 0.3s ease both; }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────────────────
   LOG TYPE CONFIG
   ───────────────────────────────────────────────────────────── */
const getLogConfig = (action = "") => {
  const t = action.toLowerCase();
  if (t.includes("request"))
    return {
      Icon: FileText,
      dot: "#3b82f6",
      pill: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
    };
  if (t.includes("profile") || t.includes("account") || t.includes("verify"))
    return {
      Icon: UserCheck,
      dot: "#10b981",
      pill: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    };
  if (t.includes("update") || t.includes("edit") || t.includes("change"))
    return {
      Icon: Settings,
      dot: "#f59e0b",
      pill: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    };
  return {
    Icon: Clock,
    dot: "#94a3b8",
    pill: "bg-gray-50 text-gray-500 ring-1 ring-gray-100",
  };
};

/* ─────────────────────────────────────────────────────────────
   DATE GROUPING
   ───────────────────────────────────────────────────────────── */
const groupByDate = (logs) => {
  const groups = {};
  logs.forEach((log) => {
    const d = new Date(log.created_at);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    let label;
    if (d.toDateString() === now.toDateString()) label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else
      label = d.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    if (!groups[label]) groups[label] = [];
    groups[label].push(log);
  });
  return groups;
};

/* ─────────────────────────────────────────────────────────────
   SKELETON — mirrors log item layout, uses shared Skeleton.Block
   ───────────────────────────────────────────────────────────── */
const SkeletonLogItem = ({ delay = 0 }) => (
  <div
    className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Icon block */}
    <Skeleton.Block className="w-9 h-9 rounded-xl shrink-0 mt-0.5" />

    {/* Text */}
    <div className="flex-1 space-y-2 min-w-0">
      <Skeleton.Block className="h-3.5 w-40" />
      <Skeleton.Block className="h-3 w-64 max-w-full" />
    </div>

    {/* Timestamp */}
    <div className="shrink-0 space-y-1.5 text-right">
      <Skeleton.Block className="h-3 w-10 ml-auto" />
      <Skeleton.Block className="h-2.5 w-8 ml-auto" />
    </div>
  </div>
);

const SkeletonNotificationList = ({ count = 7 }) => (
  <div className="bg-white rounded-2xl border border-gray-100 px-5 divide-y divide-gray-50">
    {/* Fake group label */}
    <div className="py-4">
      <Skeleton.Block className="h-2.5 w-10" />
    </div>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonLogItem key={i} delay={i * 50} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   LOG ITEM
   ───────────────────────────────────────────────────────────── */
const LogItem = ({ log, index }) => {
  const cfg = getLogConfig(log.action);
  const { Icon } = cfg;
  const time = new Date(log.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="rn-item group flex items-start gap-4 py-4 border-b border-gray-50 last:border-0"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.pill}`}
      >
        <Icon size={15} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 capitalize leading-snug">
          {log.action?.replace(/_/g, " ")}
        </p>
        {log.details && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
            {log.details}
          </p>
        )}
      </div>

      {/* Time */}
      <div className="shrink-0 text-right pt-0.5">
        <p className="text-[10px] font-bold text-gray-500 tabular-nums">
          {time}
        </p>
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 ml-auto"
          style={{ background: cfg.dot }}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN
   ───────────────────────────────────────────────────────────── */
const ResidentNotifications = () => {
  const { logs, isLoading, error, refresh } = useResidentNotifications();
  const groups = groupByDate(logs);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 space-y-8">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
            Account
          </p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Activity History
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            A log of all actions on your account.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:text-gray-700 disabled:opacity-40 transition-all"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── CONTENT ── */}
      {isLoading ? (
        <SkeletonNotificationList count={7} />
      ) : error ? (
        <div className="flex items-center gap-4 p-5 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700 flex-1">{error}</p>
          <button
            onClick={refresh}
            className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Inbox size={22} className="text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-400">No activity yet</p>
          <p className="text-xs text-gray-300 text-center max-w-xs">
            Actions you take in the portal will appear here as a running log.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([label, items]) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 px-5"
            >
              {/* Group label */}
              <div className="py-3 border-b border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {label}
                </span>
              </div>

              {/* Log items */}
              {items.map((log, i) => (
                <LogItem key={log.log_id} log={log} index={i} />
              ))}
            </div>
          ))}

          {/* End marker */}
          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-2">
            End of history
          </p>
        </div>
      )}
    </div>
  );
};

export default ResidentNotifications;
