import React, { useState, useEffect } from "react";
import {
  MapPin,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  UserPlus,
  ShieldCheck,
  Activity,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../axious/api";
import Skeleton from "../../components/Skeleton";

/* ─────────────────────────────────────────────────────────────
   STAT CARDS — resident management only, no document requests
   ───────────────────────────────────────────────────────────── */
const STAT_CARDS = [
  {
    id: "verified",
    label: "Verified Residents",
    icon: UserCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    id: "pending_verifications",
    label: "Pending Verification",
    icon: ShieldCheck,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    id: "rejected",
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
];

/* ─────────────────────────────────────────────────────────────
   LOG TYPE CONFIG
   ───────────────────────────────────────────────────────────── */
const LOG_TYPE = {
  verification: { icon: CheckCircle2, color: "text-emerald-500" },
  rejection: { icon: XCircle, color: "text-red-500" },
  resubmission: { icon: AlertCircle, color: "text-amber-500" },
  update: { icon: Activity, color: "text-blue-500" },
};
const DEFAULT_LOG = { icon: Activity, color: "text-slate-400" };

/* ─────────────────────────────────────────────────────────────
   AVATAR — deterministic color from initials
   ───────────────────────────────────────────────────────────── */
const Avatar = ({ first, last }) => {
  const initials = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[(initials.charCodeAt(0) || 0) % colors.length];
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */
const ZoneLeaderDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/zone-leader/dashboard-stats");
      setData(response.data);
    } catch (err) {
      setError("Failed to load zone data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-7">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              Zone <span className="text-emerald-500">Overview</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-500 text-xs font-medium">
                Managing:{" "}
                <span className="text-slate-900 font-bold">
                  {loading ? "—" : (data?.zone_name ?? "Your Zone")}
                </span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
          <button
            onClick={fetchDashboardData}
            className="ml-auto text-xs underline hover:no-underline font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      {loading ? (
        <Skeleton.StatGrid count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STAT_CARDS.map((stat) => (
            <div
              key={stat.id}
              className={`p-5 rounded-2xl bg-white border ${stat.border} shadow-sm hover:shadow-md transition-all group`}
            >
              <div
                className={`p-2 rounded-lg ${stat.bg} w-fit group-hover:scale-105 transition-transform`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {stat.label}
                </p>
                <h2 className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
                  {data?.[stat.id] ?? 0}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Two-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Verification queue ── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <UserPlus size={15} className="text-slate-600" />
              </div>
              <h3 className="font-black text-slate-900 text-sm tracking-tight">
                Pending Verification
              </h3>
              {!loading && data?.recent_residents?.length > 0 && (
                <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {data.pending_verifications} awaiting
                </span>
              )}
            </div>
            <button
              onClick={() => navigate("/zone-leader/residents")}
              className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
            >
              Manage All <ChevronRight size={11} />
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-50">
            {loading ? (
              <div className="p-6">
                <Skeleton.Rows count={3} showBadge={false} />
              </div>
            ) : data?.recent_residents?.length > 0 ? (
              <>
                {data.recent_residents.map((resident) => (
                  <div
                    key={resident.user_id}
                    onClick={() => navigate("/zone-leader/residents")}
                    className="px-6 py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        first={resident.first_name}
                        last={resident.last_name}
                      />
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          {resident.first_name} {resident.last_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {resident.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Unverified
                      </span>
                      <ChevronRight
                        size={13}
                        className="text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                ))}
                {/* If there are more than 5 pending, hint at it */}
                {data.pending_verifications > data.recent_residents.length && (
                  <div
                    onClick={() => navigate("/zone-leader/residents")}
                    className="px-6 py-3 text-center text-[10px] font-bold text-emerald-600 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    +{" "}
                    {data.pending_verifications - data.recent_residents.length}{" "}
                    more awaiting verification
                  </div>
                )}
              </>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-600">
                  All residents verified
                </p>
                <p className="text-[10px] text-slate-400">
                  Every resident in your zone has been verified.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Recent Activity ── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <Activity size={15} className="text-slate-600" />
              </div>
              <h3 className="font-black text-slate-900 text-sm tracking-tight">
                Recent Activity
              </h3>
            </div>
            <button
              onClick={() => navigate("/zone-leader/logs")}
              className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
            >
              View All <ChevronRight size={11} />
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-50">
            {loading ? (
              <div className="p-6">
                <Skeleton.Rows count={3} showBadge={false} />
              </div>
            ) : data?.recent_logs?.length > 0 ? (
              data.recent_logs.map((log) => {
                const cfg = LOG_TYPE[log.type] ?? DEFAULT_LOG;
                const Icon = cfg.icon;
                return (
                  <div
                    key={log.id}
                    className="px-6 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-50">
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-snug truncate">
                        {log.action}
                      </p>
                      {log.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                          {log.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 space-y-0.5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wide">
                        {log.time}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {log.date}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <FileText size={18} className="text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-500">
                  No activity yet
                </p>
                <p className="text-[10px] text-slate-400">
                  Actions like verifying or rejecting residents will appear
                  here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ZoneLeaderDashboard;
