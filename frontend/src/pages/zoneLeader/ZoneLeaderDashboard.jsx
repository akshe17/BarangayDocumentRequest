import React, { useState, useEffect } from "react";
import {
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
  ClipboardList,
  PackageCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  MapPin,
  Home,
  TrendingUp,
  Users,
  Banknote,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import api from "../../axious/api";
/* ─────────────────────────────────────────────────────────────
   STAT CARDS — mapped to actual API fields
───────────────────────────────────────────────────────────── */
const STAT_CARDS = [
  {
    id: "verified",
    label: "Verified Residents",
    sublabel: "Confirmed in zone",
    icon: UserCheck,
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.1)",
    accentText: "#059669",
  },
  {
    id: "pending_verifications",
    label: "Pending Verification",
    sublabel: "Awaiting your review",
    icon: ShieldCheck,
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.1)",
    accentText: "#d97706",
  },
  {
    id: "rejected",
    label: "Rejected",
    sublabel: "Need resubmission",
    icon: XCircle,
    accent: "#ef4444",
    accentBg: "rgba(239,68,68,0.1)",
    accentText: "#dc2626",
  },
  {
    id: "pending_clearances",
    label: "Pending Requests",
    sublabel: "Document clearances",
    icon: ClipboardList,
    accent: "#8b5cf6",
    accentBg: "rgba(139,92,246,0.1)",
    accentText: "#7c3aed",
  },
];

/* ─────────────────────────────────────────────────────────────
   REQUEST STATUS CONFIG
───────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  approved: {
    label: "Approved",
    color: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  completed: {
    label: "Completed",
    color: "#10b981",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-200",
  },
  "ready for pickup": {
    label: "Ready for Pickup",
    color: "#8b5cf6",
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200",
  },
};

const getStatusCfg = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status ?? "Unknown",
    color: "#94a3b8",
    bg: "bg-slate-50",
    text: "text-slate-600",
    ring: "ring-slate-200",
  };

/* ─────────────────────────────────────────────────────────────
   LOG ICON MAP
───────────────────────────────────────────────────────────── */
const LOG_TYPE = {
  verification: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-100",
  },
  rejection: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-100",
  },
  resubmission: {
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-100",
  },
  completion: {
    icon: PackageCheck,
    color: "text-violet-500",
    bg: "bg-violet-50 border-violet-100",
  },
  update: {
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-100",
  },
};
const DEFAULT_LOG = {
  icon: Activity,
  color: "text-slate-400",
  bg: "bg-slate-50 border-slate-100",
};

/* ─────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────── */
const GRAD_PAIRS = [
  ["#34d399", "#059669"],
  ["#60a5fa", "#2563eb"],
  ["#a78bfa", "#7c3aed"],
  ["#fbbf24", "#d97706"],
  ["#f87171", "#dc2626"],
];
const Avatar = ({ first, last, size = "md" }) => {
  const initials = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
  const [a, b] = GRAD_PAIRS[(initials.charCodeAt(0) || 0) % GRAD_PAIRS.length];
  const sizeClass =
    size === "lg"
      ? "w-12 h-12 text-sm"
      : size === "sm"
        ? "w-8 h-8 text-[10px]"
        : "w-10 h-10 text-xs";
  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center text-white font-black flex-shrink-0 select-none shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      {initials}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   RECHARTS CUSTOM TOOLTIP
───────────────────────────────────────────────────────────── */
const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2 text-xs">
      <p className="font-black text-slate-800">
        {payload[0].name ?? payload[0].dataKey}
      </p>
      <p className="text-slate-500 font-bold mt-0.5">{payload[0].value}</p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CARD PRIMITIVES
───────────────────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({
  icon: Icon,
  iconColor = "text-slate-500",
  iconBg = "bg-slate-100",
  title,
  badge,
  action,
  onAction,
}) => (
  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2.5">
      <div
        className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon size={14} className={iconColor} />
      </div>
      <h3 className="font-black text-slate-900 text-sm">{title}</h3>
      {badge != null && (
        <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
    {action && (
      <button
        onClick={onAction}
        className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors cursor-pointer flex-shrink-0"
      >
        {action} <ChevronRight size={11} />
      </button>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SKELETONS
───────────────────────────────────────────────────────────── */
const SkeletonRows = ({ count = 3 }) => (
  <div className="p-5 space-y-3">
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
            <div className="h-2 bg-slate-100 rounded-full w-3/4" />
          </div>
        </div>
      ))}
  </div>
);

const SkeletonStatCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 animate-pulse overflow-hidden">
    <div className="h-[3px] bg-slate-100" />
    <div className="p-5 space-y-3">
      <div className="w-8 h-8 rounded-xl bg-slate-100" />
      <div className="space-y-1.5">
        <div className="h-2 bg-slate-100 rounded-full w-2/3" />
        <div className="h-2 bg-slate-100 rounded-full w-1/2" />
      </div>
      <div className="h-8 bg-slate-100 rounded-lg w-1/3" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   FORMAT HELPERS
───────────────────────────────────────────────────────────── */
const fmt = {
  date: (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  },
  currency: (val) => `₱${parseFloat(val ?? 0).toFixed(2)}`,
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const ZoneLeaderDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/zone-leader/dashboard-stats");
      setData(res.data);
    } catch {
      setError("Failed to load zone data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ── Derived: resident pie from verified / pending_verifications / rejected ── */
  const pieData = data
    ? [
        { name: "Verified", value: data.verified ?? 0, color: "#10b981" },
        {
          name: "Pending",
          value: data.pending_verifications ?? 0,
          color: "#f59e0b",
        },
        { name: "Rejected", value: data.rejected ?? 0, color: "#ef4444" },
      ].filter((d) => d.value > 0)
    : [];
  const totalResidents = pieData.reduce((s, d) => s + d.value, 0);
  const verificationRate =
    totalResidents > 0
      ? Math.round(((data?.verified ?? 0) / totalResidents) * 100)
      : 0;

  /* ── Derived: clearance bar data from real clearance_stats object ── */
  const clearanceBarData = data?.clearance_stats
    ? [
        {
          label: "Pending",
          value: data.clearance_stats.pending,
          color: "#f59e0b",
        },
        {
          label: "Approved",
          value: data.clearance_stats.approved,
          color: "#3b82f6",
        },
        {
          label: "Ready for Pickup",
          value: data.clearance_stats.ready_for_pickup,
          color: "#8b5cf6",
        },
        {
          label: "Completed",
          value: data.clearance_stats.completed,
          color: "#10b981",
        },
        {
          label: "Rejected",
          value: data.clearance_stats.rejected,
          color: "#ef4444",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-4 md:p-8 space-y-5">
      {/* ════════ HEADER ════════ */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[0.16em] uppercase text-emerald-500 mb-1">
            Zone Leader Portal
          </p>
          <h1 className="text-[1.65rem] font-black text-slate-900 tracking-tight leading-none">
            Zone{" "}
            <span className="text-emerald-500">
              {loading ? "—" : (data?.zone_name ?? "Overview")}
            </span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
            <span className="text-slate-400 text-[11px] font-semibold">
              Live overview · updates on refresh
            </span>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="self-start flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-xs font-bold">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
          <button onClick={load} className="ml-auto underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* ════════ STAT CARDS ════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => <SkeletonStatCard key={i} />)
          : STAT_CARDS.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="h-[3px]" style={{ background: s.accent }} />
                <div className="p-5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ background: s.accentBg }}
                  >
                    <s.icon size={16} style={{ color: s.accentText }} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
                    {s.label}
                  </p>
                  <p className="text-[10px] font-medium text-slate-300 mt-0.5 leading-none">
                    {s.sublabel}
                  </p>
                  <h2
                    className="text-3xl font-black tracking-tight mt-2 tabular-nums leading-none"
                    style={{ color: s.accent }}
                  >
                    {data?.[s.id] ?? 0}
                  </h2>
                </div>
              </div>
            ))}
      </div>

      {/* ════════ CHARTS ROW ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ── Resident Donut ── */}
        <Card className="lg:col-span-2">
          <CardHeader
            icon={UserCheck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title="Resident Breakdown"
          />
          <div className="p-5">
            {loading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-[110px] h-[110px] rounded-full bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between">
                        <div className="h-2 bg-slate-100 rounded-full w-1/3" />
                        <div className="h-2 bg-slate-100 rounded-full w-8" />
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : totalResidents === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
                <FileText size={28} />
                <p className="text-xs font-bold">No residents yet</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative w-[110px] h-[110px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={33}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                        <ReTooltip content={<ChartTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xl font-black text-slate-900 leading-none">
                        {totalResidents}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Total
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {pieData.map((d) => (
                      <div key={d.name}>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: d.color }}
                            />
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {d.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-black text-slate-700 tabular-nums">
                            {d.value}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${totalResidents ? (d.value / totalResidents) * 100 : 0}%`,
                              background: d.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {verificationRate > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <TrendingUp size={10} /> Verification rate
                    </span>
                    <span
                      className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
                      style={{
                        background:
                          verificationRate >= 80
                            ? "rgba(16,185,129,0.1)"
                            : verificationRate >= 50
                              ? "rgba(245,158,11,0.1)"
                              : "rgba(239,68,68,0.1)",
                        color:
                          verificationRate >= 80
                            ? "#059669"
                            : verificationRate >= 50
                              ? "#d97706"
                              : "#dc2626",
                      }}
                    >
                      {verificationRate}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* ── Clearance Stats Bar Chart — driven by real clearance_stats ── */}
        <Card className="lg:col-span-3">
          <CardHeader
            icon={ClipboardList}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title="Document Requests"
            badge={
              !loading && (data?.pending_clearances ?? 0) > 0
                ? `${data.pending_clearances} pending`
                : null
            }
            action="Manage"
            onAction={() => navigate("/zone-leader/clearance")}
          />
          <div className="p-5">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5 flex-1"
                    >
                      <div className="h-16 w-full bg-slate-100 rounded-lg" />
                      <div className="h-2 w-10 bg-slate-100 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Summary pills from clearance_stats */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {clearanceBarData.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
                      style={{ background: `${s.color}18`, color: s.color }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      {s.label}: {s.value}
                    </div>
                  ))}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 ml-auto">
                    Total: {data?.clearance_stats?.total ?? 0}
                  </div>
                </div>

                {/* Bar chart */}
                <div className="h-[110px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clearanceBarData}
                      margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                      barSize={28}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide allowDecimals={false} />
                      <ReTooltip
                        content={<ChartTip />}
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                      />
                      <Bar
                        dataKey="value"
                        name="Requests"
                        radius={[6, 6, 0, 0]}
                      >
                        {clearanceBarData.map((s, i) => (
                          <Cell key={i} fill={s.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <button
                  onClick={() => navigate("/zone-leader/clearance")}
                  className="mt-4 w-full bg-emerald-500 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                >
                  <ClipboardList size={12} />
                  Review All Requests
                  <ArrowUpRight size={11} />
                </button>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* ════════ RECENT DOCUMENT REQUESTS ════════ */}
      <Card>
        <CardHeader
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          title="Recent Document Requests"
          action="View All"
          onAction={() => navigate("/zone-leader/clearance")}
        />
        <div className="divide-y divide-slate-50">
          {loading ? (
            <SkeletonRows count={3} />
          ) : data?.recent_requests?.length > 0 ? (
            data.recent_requests.map((req) => {
              const st = getStatusCfg(req.status);
              const res = req.resident;
              const user = res?.user;
              return (
                <div
                  key={req.request_id}
                  className="px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Avatar first={user?.first_name} last={user?.last_name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-black text-slate-900">
                            {user?.first_name}
                            {user?.middle_name
                              ? ` ${user.middle_name}`
                              : ""}{" "}
                            {user?.last_name}
                          </p>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ring-1 ${st.bg} ${st.text} ${st.ring}`}
                          >
                            {st.label}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {req.document_type?.document_name}
                          {req.purpose ? ` — ${req.purpose}` : ""}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock size={9} />
                            {fmt.date(req.request_date)}
                          </span>
                          {res?.house_no && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Home size={9} />
                              House {res.house_no}
                            </span>
                          )}
                          <span
                            className="flex items-center gap-1 text-[10px] font-semibold"
                            style={{
                              color: req.payment_status ? "#10b981" : "#f59e0b",
                            }}
                          >
                            <Banknote size={9} />
                            {req.payment_status ? "Paid" : "Unpaid"} ·{" "}
                            {fmt.currency(req.document_type?.fee)}
                          </span>
                          {req.pickup_date && (
                            <span className="flex items-center gap-1 text-[10px] text-violet-500 font-semibold">
                              <Package size={9} />
                              Pickup: {fmt.date(req.pickup_date)}
                            </span>
                          )}
                        </div>

                        {/* Rejection reason inline */}
                        {req.rejection_reason && (
                          <div className="mt-1.5 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                            <XCircle
                              size={10}
                              className="text-red-400 mt-0.5 flex-shrink-0"
                            />
                            <p className="text-[10px] text-red-600 font-medium leading-snug">
                              {req.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        #{req.request_id}
                      </p>
                      {res?.zone?.zone_name && (
                        <p className="text-[9px] text-slate-300 mt-0.5">
                          {res.zone.zone_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 flex flex-col items-center gap-2 text-slate-300">
              <FileText size={28} />
              <p className="text-xs font-bold">No recent requests</p>
            </div>
          )}
        </div>
      </Card>

      {/* ════════ BOTTOM ROW: Pending Verification + Recent Activity ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending verification queue */}
        <Card className="flex flex-col">
          <CardHeader
            icon={UserPlus}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            title="Pending Verification"
            badge={
              !loading && (data?.pending_verifications ?? 0) > 0
                ? `${data.pending_verifications} awaiting`
                : null
            }
            action="Manage All"
            onAction={() => navigate("/zone-leader/residents")}
          />
          <div className="flex-1 divide-y divide-slate-50">
            {loading ? (
              <SkeletonRows count={3} />
            ) : data?.recent_residents?.length > 0 ? (
              <>
                {data.recent_residents.map((r) => (
                  <div
                    key={r.user_id}
                    onClick={() => navigate("/zone-leader/residents")}
                    className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar first={r.first_name} last={r.last_name} />
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-snug">
                          {r.first_name} {r.last_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {r.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                        Unverified
                      </span>
                      <ChevronRight
                        size={13}
                        className="text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500 transition-all"
                      />
                    </div>
                  </div>
                ))}
                {(data.pending_verifications ?? 0) -
                  data.recent_residents.length >
                  0 && (
                  <div
                    onClick={() => navigate("/zone-leader/residents")}
                    className="px-5 py-3 text-center text-[10px] font-black text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
                  >
                    +{data.pending_verifications - data.recent_residents.length}{" "}
                    more waiting
                  </div>
                )}
              </>
            ) : (
              <div className="p-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-600">All clear!</p>
                <p className="text-[10px] text-slate-400 text-center">
                  Every resident in your zone has been verified.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity — now includes log.user field */}
        <Card className="flex flex-col">
          <CardHeader
            icon={Activity}
            title="Recent Activity"
            action="View All"
            onAction={() => navigate("/zone-leader/logs")}
          />
          <div className="flex-1 divide-y divide-slate-50">
            {loading ? (
              <div className="p-5 space-y-3">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 animate-pulse"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 bg-slate-100 rounded-full w-2/3" />
                        <div className="h-2 bg-slate-100 rounded-full w-full" />
                      </div>
                      <div className="w-10 h-2 bg-slate-100 rounded-full mt-1" />
                    </div>
                  ))}
              </div>
            ) : data?.recent_logs?.length > 0 ? (
              data.recent_logs.map((log) => {
                const cfg = LOG_TYPE[log.type] ?? DEFAULT_LOG;
                const Icon = cfg.icon;
                return (
                  <div
                    key={log.id}
                    className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
                    >
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {log.action}
                      </p>
                      {log.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {log.description}
                        </p>
                      )}
                      {/* log.user — actor who performed the action */}
                      {log.user && (
                        <p className="text-[9px] text-slate-300 font-semibold mt-0.5">
                          by {log.user}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[9px] font-black text-slate-500 flex items-center gap-1 justify-end">
                        <Clock size={8} /> {log.time}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {log.date}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <Sparkles size={18} className="text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-500">
                  No activity yet
                </p>
                <p className="text-[10px] text-slate-400 text-center">
                  Verifications, rejections, and approvals will appear here.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ZoneLeaderDashboard;
