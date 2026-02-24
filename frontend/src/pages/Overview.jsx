import React, { useState, useEffect, useRef } from "react";
import api from "../axious/api";
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  MapPin,
  UserCheck,
  AlertCircle,
  Activity,
  BarChart2,
  ShieldCheck,
  PackageCheck,
  Minus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const useCountUp = (target, duration = 900) => {
  const [count, setCount] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!target) {
      setCount(0);
      return;
    }
    startRef.current = null;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else setCount(target);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return count;
};

const StatCard = ({ label, value = 0, icon: Icon, color, trendValue }) => {
  const n = useCountUp(value);
  const hasTrend = trendValue !== undefined && trendValue !== null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 hover:border-slate-200 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} shadow-sm`}
        >
          <Icon size={16} className="text-white" />
        </div>
        {hasTrend && (
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              trendValue > 0
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : trendValue < 0
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-slate-50 text-slate-500 border-slate-100"
            }`}
          >
            {trendValue > 0 ? (
              <TrendingUp size={9} />
            ) : trendValue < 0 ? (
              <TrendingDown size={9} />
            ) : (
              <Minus size={9} />
            )}
            {trendValue > 0 ? "+" : ""}
            {trendValue}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-3xl font-black text-slate-900 tabular-nums leading-none group-hover:text-emerald-600 transition-colors duration-200">
          {n.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl px-3.5 py-2.5 text-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        {label || payload[0]?.payload?.name || payload[0]?.payload?.zone}
      </p>
      {payload.map((p, i) => (
        <p
          key={i}
          className="font-black text-slate-800 flex items-center gap-1.5"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.color || p.fill }}
          />
          {p.value?.toLocaleString()}
          <span className="text-slate-400 font-medium">{p.name}</span>
        </p>
      ))}
    </div>
  );
};

const Card = ({ title, subtitle, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}
  >
    <div className="px-6 pt-5 pb-4 flex items-center gap-3 border-b border-slate-50">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
          <Icon size={13} className="text-white" />
        </div>
      )}
      <div>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const EmptyChart = ({ message = "No data available" }) => (
  <div className="h-56 flex flex-col items-center justify-center gap-2">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
      <BarChart2 size={16} className="text-slate-300" />
    </div>
    <p className="text-xs text-slate-300 font-medium">{message}</p>
  </div>
);

const STATUS = {
  pending: {
    pill: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
  },
  approved: {
    pill: "bg-blue-50 text-blue-700 border-blue-100",
    dot: "bg-blue-500",
  },
  completed: {
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  rejected: {
    pill: "bg-rose-50 text-rose-700 border-rose-100",
    dot: "bg-rose-500",
  },
  "ready for pickup": {
    pill: "bg-violet-50 text-violet-700 border-violet-100",
    dot: "bg-violet-500",
  },
};

const StatusPill = ({ status }) => {
  const key = status?.toLowerCase() ?? "pending";
  const style = STATUS[key] ?? {
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${style.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      {status}
    </span>
  );
};

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const Avatar = ({ name, index = 0 }) => {
  const initials = (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
};

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-6 space-y-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="w-28 h-4" />
          <Skeleton className="w-44 h-3" />
        </div>
      </div>
      <Skeleton className="w-24 h-9" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-24 rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
    </div>
  </div>
);

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/dashboard/overview");
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message ?? "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 max-w-sm text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-rose-500" />
          </div>
          <p className="text-sm font-black text-slate-800 mb-1">
            Something went wrong
          </p>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">{error}</p>
          <button
            onClick={() => load()}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const {
    stats = {},
    trends = {},
    trend_data = [],
    document_distribution = [],
    recent_requests = [],
    zone_distribution = [],
    staff_summary = [],
  } = data;

  const statCards = [
    {
      label: "Residents",
      value: stats.total_residents,
      icon: Users,
      color: "bg-emerald-500",
      trendValue: trends.residents,
    },
    {
      label: "Requests",
      value: stats.total_requests,
      icon: FileText,
      color: "bg-slate-700",
    },
    {
      label: "Pending",
      value: stats.pending_requests,
      icon: Clock,
      color: "bg-amber-500",
      trendValue: trends.pending,
    },
    {
      label: "Approved",
      value: stats.approved_requests,
      icon: UserCheck,
      color: "bg-blue-500",
    },
    {
      label: "Ready",
      value: stats.ready_requests,
      icon: PackageCheck,
      color: "bg-violet-500",
    },
    {
      label: "Completed",
      value: stats.completed_requests,
      icon: CheckCircle2,
      color: "bg-emerald-600",
    },
    {
      label: "Rejected",
      value: stats.rejected_requests,
      icon: XCircle,
      color: "bg-rose-500",
    },
  ];

  const PIE_COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
            <BarChart2 size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
              Dashboard
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Staff Strip */}
      {staff_summary.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <ShieldCheck size={13} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Staff Overview
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Active personnel by role
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {staff_summary.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck size={13} className="text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-black text-slate-900 leading-none tabular-nums">
                    {s.count}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate mt-0.5">
                    {s.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Area chart + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card
          className="lg:col-span-2"
          title="Request Trends"
          subtitle="Last 30 days · Daily submission volume"
          icon={Activity}
        >
          {trend_data.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trend_data}
                  margin={{ top: 4, right: 2, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    name="Requests"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#grad)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "#10b981",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="No requests in the last 30 days" />
          )}
        </Card>

        <Card
          title="Document Types"
          subtitle="By request volume"
          icon={FileText}
        >
          {document_distribution.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={document_distribution}
                    cx="50%"
                    cy="42%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                  >
                    {document_distribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={6}
                    formatter={(v) => (
                      <span className="text-[10px] font-bold text-slate-500">
                        {v}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </Card>
      </div>

      {/* Row 2: Zone Bar + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {zone_distribution.length > 0 && (
          <Card
            title="Residents by Zone"
            subtitle="Per zone headcount"
            icon={MapPin}
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={zone_distribution}
                  margin={{ top: 4, right: 2, left: -24, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="zone"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="residents"
                    name="Residents"
                    radius={[5, 5, 0, 0]}
                  >
                    {zone_distribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i % 2 === 0 ? "#10b981" : "#34d399"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {recent_requests.length > 0 && (
          <Card
            className={
              zone_distribution.length > 0 ? "lg:col-span-2" : "lg:col-span-3"
            }
            title="Recent Requests"
            subtitle="Latest submissions"
            icon={Clock}
          >
            <div className="space-y-0.5 -mx-1">
              {recent_requests.slice(0, 8).map((req, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Avatar name={req.resident_name} index={i} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate leading-none">
                      {req.resident_name || "Unknown Resident"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                      {req.document_type}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <StatusPill status={req.status} />
                    <p className="text-[10px] text-slate-300 font-medium">
                      {req.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Overview;
