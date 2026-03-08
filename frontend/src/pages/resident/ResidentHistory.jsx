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
  Home,
  Building2,
  ChevronRight,
  ArrowLeft,
  CalendarDays,
  Hash,
  Tag,
  Coins,
  StickyNote,
  ListChecks,
} from "lucide-react";
import { useResidentHistory } from "../../context/ResidentHistoryContext";
import Skeleton from "../../components/Skeleton";

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
    glow: "shadow-amber-100",
  },
  approved: {
    label: "Approved",
    Icon: CheckCircle2,
    dot: "#3b82f6",
    pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    accent: "bg-blue-500",
    glow: "shadow-blue-100",
  },
  completed: {
    label: "Completed",
    Icon: CheckCircle2,
    dot: "#10b981",
    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    accent: "bg-emerald-500",
    glow: "shadow-emerald-100",
  },
  rejected: {
    label: "Rejected",
    Icon: XCircle,
    dot: "#ef4444",
    pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
    accent: "bg-red-500",
    glow: "shadow-red-100",
  },
  "ready for pickup": {
    label: "Ready for Pickup",
    Icon: PackageCheck,
    dot: "#8b5cf6",
    pill: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    accent: "bg-violet-500",
    glow: "shadow-violet-100",
  },
};

const getStatus = (name = "") =>
  STATUS[name.toLowerCase()] ?? {
    label: name || "Unknown",
    Icon: FileText,
    dot: "#94a3b8",
    pill: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
    accent: "bg-slate-400",
    glow: "shadow-slate-100",
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
              className={`text-[10px] font-bold tabular-nums px-1 rounded ${isActive ? "text-white/70" : "text-gray-400"}`}
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
   SKELETONS
   ───────────────────────────────────────────────────────────── */
const SkeletonHistoryCard = ({ delay = 0 }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100 p-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Skeleton.Block className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton.Block className="h-2.5 w-28" />
          <Skeleton.Block className="h-4 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton.Block className="h-6 w-20 rounded-lg" />
        <Skeleton.Block className="w-4 h-4 rounded" />
      </div>
    </div>
  </div>
);

const SkeletonHistoryList = ({ count = 6 }) => (
  <div className="space-y-2.5">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonHistoryCard key={i} delay={i * 60} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   DETAIL BANNERS
   ───────────────────────────────────────────────────────────── */
const ZoneLeaderPickupBanner = ({ zlInfo }) => {
  const address = [zlInfo?.house_no, zlInfo?.zone_name]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
      <div className="w-7 h-7 rounded-lg bg-white border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
        <Home size={13} className="text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">
          Pickup Location
        </p>
        {address ? (
          <>
            <p className="text-xs font-bold text-emerald-900 leading-snug">
              {address}
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-relaxed">
              Visit your Zone Leader's address to claim this document. Bring a
              valid ID and the exact fee.
            </p>
          </>
        ) : (
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            This document is handled by your Zone Leader. Please coordinate with
            them for pickup details.
          </p>
        )}
      </div>
    </div>
  );
};

const BarangayHallPickupBanner = () => (
  <div className="flex items-start gap-3 px-4 py-3.5 bg-violet-50 rounded-xl border border-violet-100">
    <div className="w-7 h-7 rounded-lg bg-white border border-violet-100 flex items-center justify-center shrink-0 mt-0.5">
      <Building2 size={13} className="text-violet-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-black text-violet-700 uppercase tracking-widest mb-0.5">
        Pickup Location
      </p>
      <p className="text-xs font-bold text-violet-900 leading-snug">
        Barangay Hall
      </p>
      <p className="text-[11px] text-violet-600 mt-0.5 leading-relaxed">
        Your document is ready at the Barangay Hall. Bring a valid ID and
        prepare the exact fee upon claiming.
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   DETAIL PAGE
   ───────────────────────────────────────────────────────────── */
const DetailRow = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm text-gray-800 font-semibold leading-snug ${mono ? "font-mono" : ""}`}
      >
        {value || <span className="text-gray-300 font-normal italic">—</span>}
      </p>
    </div>
  </div>
);

const RequestDetailPage = ({ req, onBack }) => {
  const statusName = req.status?.status_name || "Pending";
  const statusKey = statusName.toLowerCase();
  const cfg = getStatus(statusName);
  const StatusIcon = cfg.Icon;
  const fee = parseFloat(req.document_type?.fee || 0);
  const reason = req.remarks || req.rejection_reason || req.reason;
  const isRejected = statusKey === "rejected";
  const isReadyForPickup = statusKey === "ready for pickup";

  const handlerRoleId = req.document_type?.handler_role_id;
  const zlInfo = req.zone_leader_info;
  const isZoneLeaderDoc = !!zlInfo;
  const isBarangayHallDoc = handlerRoleId === 4 && !zlInfo;

  const date = new Date(req.request_date || req.created_at).toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Laravel serializes relations to snake_case: documentType() → document_type
  const requirements = req.document_type?.requirements ?? [];

  return (
    <div>
      {/* BACK HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:text-gray-700 transition-all"
        >
          <ArrowLeft size={13} />
          Back
        </button>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          REQ-{req.request_id}
        </p>
      </div>

      {/* STATUS HERO */}
      <div
        className={`rounded-2xl overflow-hidden border border-gray-100 shadow-md mb-4`}
      >
        <div className={`h-1.5 w-full ${cfg.accent}`} />
        <div className="p-5 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cfg.pill}`}
          >
            <StatusIcon size={22} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-black text-gray-900 leading-tight truncate">
              {req.document_type?.document_name ?? "—"}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cfg.pill}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: cfg.dot }}
              />
              {statusName}
            </span>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Fee
            </p>
            <p
              className={`text-base font-black tabular-nums ${fee === 0 ? "text-emerald-600" : "text-gray-800"}`}
            >
              {fee === 0 ? "Free" : `₱${fee.toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      {/* DETAILS CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          Request Details
        </p>
        <DetailRow
          icon={Hash}
          label="Request ID"
          value={`REQ-${req.request_id}`}
          mono
        />
        <DetailRow icon={CalendarDays} label="Date Filed" value={date} />
        <DetailRow icon={Tag} label="Purpose" value={req.purpose} />
        <DetailRow
          icon={Coins}
          label="Processing Fee"
          value={fee === 0 ? "Free" : `₱${fee.toFixed(2)}`}
        />
        {req.document_type?.description && (
          <DetailRow
            icon={StickyNote}
            label="About this Document"
            value={req.document_type.description}
          />
        )}
      </div>

      {/* REQUIREMENTS */}
      {requirements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
              <ListChecks size={13} className="text-gray-400" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Requirements
            </p>
          </div>
          <ul className="space-y-2">
            {requirements.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black text-gray-400">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <p className="text-xs text-gray-700 font-medium leading-snug">
                    {typeof item === "string"
                      ? item
                      : (item.requirement_name ?? "—")}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed italic">
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PICKUP BANNERS — only when ready for pickup */}
      {isReadyForPickup && (
        <div className="mb-4 space-y-3">
          {isZoneLeaderDoc && <ZoneLeaderPickupBanner zlInfo={zlInfo} />}
          {isBarangayHallDoc && <BarangayHallPickupBanner />}
        </div>
      )}

      {/* REJECTION REASON / REMARKS */}
      {reason && (
        <div
          className={`rounded-xl overflow-hidden border mb-4 ${isRejected ? "border-red-200" : "border-sky-200"}`}
        >
          <div
            className={`px-4 py-2 flex items-center gap-2 ${isRejected ? "bg-red-500" : "bg-sky-500"}`}
          >
            {isRejected ? (
              <XCircle size={12} className="text-white" />
            ) : (
              <Info size={12} className="text-white" />
            )}
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {isRejected ? "Rejection Reason" : "Admin Remarks"}
            </span>
          </div>
          <div
            className={`px-4 py-3 text-xs leading-relaxed font-medium ${isRejected ? "bg-red-50 text-red-800" : "bg-sky-50 text-sky-800"}`}
          >
            {reason}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   HISTORY CARD — minimal, click to open detail
   ───────────────────────────────────────────────────────────── */
const HistoryCard = ({ req, index, onClick }) => {
  const statusName = req.status?.status_name || "Pending";
  const cfg = getStatus(statusName);
  const StatusIcon = cfg.Icon;

  const date = new Date(req.request_date || req.created_at).toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  return (
    <button
      onClick={onClick}
      className="w-full text-left cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-200 active:scale-[0.995]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`h-0.5 w-full ${cfg.accent}`} />
      <div className="p-4 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.pill}`}
        >
          <StatusIcon size={16} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
              REQ-{req.request_id}
            </span>
            <span className="text-gray-200 text-[10px]">·</span>
            <span className="text-[10px] text-gray-400">{date}</span>
          </div>
          <p className="text-sm font-bold text-gray-900 leading-snug truncate">
            {req.document_type?.document_name ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cfg.pill}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: cfg.dot }}
            />
            {statusName === "Ready for Pickup" ? "Pickup" : statusName}
          </span>
          <ChevronRight size={14} className="text-gray-300" />
        </div>
      </div>
    </button>
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
  const [selected, setSelected] = useState(null);

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

  // ── Detail page ──
  if (selected) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 pb-24">
        <RequestDetailPage req={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  // ── List page ──
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 pb-24 space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
            Barangay Portal
          </p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Track Request
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track all your document applications.
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

      <FilterTabs active={filter} onChange={setFilter} counts={counts} />

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
        <div className="space-y-2.5">
          {filtered.map((req, i) => (
            <HistoryCard
              key={req.request_id}
              req={req}
              index={i}
              onClick={() => setSelected(req)}
            />
          ))}
        </div>
      )}

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
