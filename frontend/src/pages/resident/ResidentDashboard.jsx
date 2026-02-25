import React, { useState } from "react";
import {
  FileText,
  Clock,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  TrendingUp,
  CalendarDays,
  XCircle,
  PackageCheck,
  LayoutDashboard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useResidentDashboard } from "../../context/ResidentDashboardContext";
import Skeleton from "../../components/Skeleton";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

/* ─────────────────────────────────────────────────────────────
   STATUS CONFIG
   ───────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Pending: {
    icon: Clock,
    label: "Pending",
    iconColor: "text-amber-600",
    textColor: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
  Approved: {
    icon: CheckCircle2,
    label: "Approved",
    iconColor: "text-blue-600",
    textColor: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    pill: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
    bar: "bg-blue-400",
  },
  Completed: {
    icon: CheckCircle2,
    label: "Completed",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-400",
  },
  Rejected: {
    icon: XCircle,
    label: "Rejected",
    iconColor: "text-red-600",
    textColor: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    pill: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
    bar: "bg-red-400",
  },
  "Ready for Pickup": {
    icon: PackageCheck,
    label: "Ready for Pickup",
    iconColor: "text-violet-600",
    textColor: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    pill: "bg-violet-50 text-violet-700 border border-violet-200",
    dot: "bg-violet-500",
    bar: "bg-violet-400",
  },
};

const normalizeStatus = (name = "") => {
  if (!name) return "Pending";
  const lower = name.toLowerCase().trim();
  const match = Object.keys(STATUS_CONFIG).find(
    (k) => k.toLowerCase() === lower,
  );
  return match ?? "Pending";
};
const getStatus = (name) => STATUS_CONFIG[normalizeStatus(name)];

/* ─────────────────────────────────────────────────────────────
   ANIMATED COUNTER
   ───────────────────────────────────────────────────────────── */
const useCountUp = (target, duration = 700) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (!target) {
      setCount(0);
      return;
    }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

/* ─────────────────────────────────────────────────────────────
   STAT CARD
   ───────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent, bar }) => {
  const n = useCountUp(value);
  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${bar} opacity-60 group-hover:opacity-100 transition-opacity`}
      />
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent}`}
      >
        <Icon size={17} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-3xl font-black text-slate-900 tabular-nums leading-none">
        {n.toString().padStart(2, "0")}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
   ───────────────────────────────────────────────────────────── */
const EmptyRequests = ({ onNew }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      <FileText size={22} className="text-slate-300" />
    </div>
    <p className="text-sm font-bold text-slate-500">No requests yet</p>
    <p className="text-xs text-slate-400">
      Submit your first document request to get started.
    </p>
    <button
      onClick={onNew}
      className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm"
    >
      <PlusCircle size={14} />
      New Request
    </button>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   REQUEST ROW
   ───────────────────────────────────────────────────────────── */
const RequestRow = ({ req }) => {
  const statusName = req.status?.status_name ?? "Pending";
  const cfg = getStatus(statusName);
  const StatusIcon = cfg.icon;

  return (
    <div className="group flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border} border`}
        >
          <StatusIcon size={18} className={cfg.iconColor} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate leading-snug">
            {req.document_type?.document_name ?? "Unknown Document"}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            REQ-{req.request_id} &nbsp;·&nbsp;{" "}
            {new Date(req.created_at).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {statusName}
        </span>
        <ChevronRight
          size={15}
          className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN
   ───────────────────────────────────────────────────────────── */
const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dashboardData, isLoading, error, refresh } = useResidentDashboard();
  const [videoError, setVideoError] = useState(false);

  const { stats, recent_requests } = dashboardData;

  const statCards = [
    {
      icon: TrendingUp,
      label: "Total",
      value: stats.total,
      accent: "bg-slate-100 text-slate-600",
      bar: "bg-slate-400",
    },
    {
      icon: Clock,
      label: "Pending",
      value: stats.pending,
      accent: "bg-amber-50 text-amber-600",
      bar: "bg-amber-400",
    },
    {
      icon: PackageCheck,
      label: "Pick-up",
      value: stats.ready,
      accent: "bg-violet-50 text-violet-600",
      bar: "bg-violet-400",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: stats.completed,
      accent: "bg-emerald-50 text-emerald-600",
      bar: "bg-emerald-400",
    },
    {
      icon: XCircle,
      label: "Rejected",
      value: stats.rejected,
      accent: "bg-red-50 text-red-600",
      bar: "bg-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* ── HERO ── */}
        {isLoading ? (
          <Skeleton.Hero />
        ) : (
          <div className="relative overflow-hidden rounded-3xl shadow-lg min-h-[200px]">
            {!videoError ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setVideoError(true)}
              >
                <source src={bonbonVideo} type="video/mp4" />
              </video>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/75 to-emerald-800/20" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative z-10 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                <CalendarDays size={12} className="text-emerald-300" />
                <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                Mabuhay,{" "}
                <span className="text-emerald-300">{user?.first_name}</span>!
              </h1>
              <p className="text-emerald-100/60 text-sm max-w-md mb-7 leading-relaxed">
                Manage your document requests and track barangay clearances in
                real-time.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/resident/new-request")}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-emerald-900 rounded-xl font-black text-sm hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle size={16} />
                  New Request
                </button>
                <button
                  onClick={() => navigate("/resident/history")}
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/15 transition-all backdrop-blur-sm"
                >
                  <LayoutDashboard size={16} />
                  View History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STAT CARDS ── */}
        {isLoading ? (
          <Skeleton.StatGrid count={5} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        )}

        {/* ── RECENT REQUESTS ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <FileText size={13} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Recent Applications
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Your latest document requests
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/resident/history")}
              className="flex items-center gap-1 text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition-colors"
            >
              View All
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div className="m-5 flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
              <button
                onClick={refresh}
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-red-600 underline"
              >
                <RefreshCw size={11} />
                Retry
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <Skeleton.Rows count={4} />
          ) : recent_requests.length === 0 ? (
            <EmptyRequests onNew={() => navigate("/resident/new-request")} />
          ) : (
            <div>
              {recent_requests.map((req) => (
                <RequestRow key={req.request_id} req={req} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
