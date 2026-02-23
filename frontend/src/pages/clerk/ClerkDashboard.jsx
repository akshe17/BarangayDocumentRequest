import React, { useState, useEffect, useCallback } from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Inbox,
  PackageCheck,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  AlertCircle,
  Zap,
  CreditCard,
} from "lucide-react";
import api from "../../axious/api";
import { useDocumentRequests } from "../../context/DocumentRequestContext";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      })
    : "—";

const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* ─────────────────────────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
      <p className="font-bold mb-1 text-gray-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-black">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, Icon, color, loading }) => {
  const colors = {
    emerald: {
      bg: "bg-emerald-500",
      ring: "ring-emerald-100",
      text: "text-emerald-600",
      light: "bg-emerald-50",
    },
    amber: {
      bg: "bg-amber-400",
      ring: "ring-amber-100",
      text: "text-amber-600",
      light: "bg-amber-50",
    },
    red: {
      bg: "bg-red-500",
      ring: "ring-red-100",
      text: "text-red-600",
      light: "bg-red-50",
    },
    blue: {
      bg: "bg-blue-500",
      ring: "ring-blue-100",
      text: "text-blue-600",
      light: "bg-blue-50",
    },
    violet: {
      bg: "bg-violet-500",
      ring: "ring-violet-100",
      text: "text-violet-600",
      light: "bg-violet-50",
    },
  };
  const c = colors[color] ?? colors.emerald;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-300 px-5 py-5
                    hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${c.light} flex items-center justify-center`}
        >
          <Icon size={18} className={c.text} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-3xl font-black text-gray-900 tracking-tight">
          {value}
        </p>
      )}
      <p className="text-xs font-bold text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   RECENT REQUEST ROW
───────────────────────────────────────────────────────────── */
const STATUS_META = {
  1: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  2: { label: "Approved", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  3: { label: "Done", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  4: { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200" },
  5: {
    label: "Ready for Pickup",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  6: {
    label: "Collected",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

const RecentRow = ({ req, isLast }) => {
  const u = req.resident?.user;
  const s = STATUS_META[Number(req.status_id)] ?? {
    label: "Unknown",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <tr
      className="hover:bg-gray-50/60 transition-colors"
      style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-black select-none">
              {u?.first_name?.[0]}
              {u?.last_name?.[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {u?.first_name} {u?.last_name}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">
              REQ-{String(req.request_id).padStart(4, "0")}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <p className="text-xs font-semibold text-gray-700">
          {req.document_type?.document_name}
        </p>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`inline-flex items-center text-[10px] font-bold tracking-widest
          uppercase px-2 py-1 rounded-full border ${s.cls}`}
        >
          {s.label}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right hidden md:table-cell">
        <p className="text-xs text-gray-400">{fmt(req.request_date)}</p>
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────── */
const ClerkDashboard = () => {
  const {
    requests,
    loading: ctxLoading,
    refresh,
    lastFetched,
  } = useDocumentRequests();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/clerk/dashboard/stats");
      setStats(res.data);
    } catch {
      setError("Failed to load dashboard stats.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    refresh();
    fetchStats();
  };

  // ── Derive recent 10 from context ────────────────────────────
  const recent = [...(requests ?? [])]
    .sort((a, b) => new Date(b.request_date) - new Date(a.request_date))
    .slice(0, 8);

  // ── Donut data from context counts ───────────────────────────
  const counts = {
    pending: (requests ?? []).filter((r) => Number(r.status_id) === 1).length,
    approved: (requests ?? []).filter((r) => Number(r.status_id) === 2).length,
    ready: (requests ?? []).filter((r) => Number(r.status_id) === 5).length,
    rejected: (requests ?? []).filter((r) => Number(r.status_id) === 4).length,
    done: (requests ?? []).filter((r) => Number(r.status_id) === 6).length,
  };

  const donutData = [
    { name: "Pending", value: counts.pending, color: "#f59e0b" },
    { name: "Approved", value: counts.approved, color: "#3b82f6" },
    { name: "Ready", value: counts.ready, color: "#10b981" },
    { name: "Rejected", value: counts.rejected, color: "#ef4444" },
    { name: "Done", value: counts.done, color: "#059669" },
  ].filter((d) => d.value > 0);

  const totalRequests = Object.values(counts).reduce((a, b) => a + b, 0);

  const loading = ctxLoading || statsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-6xl mx-auto flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.14em] uppercase text-emerald-500 mb-1">
              Clerk Management
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Overview of all document requests and activity.
              {lastFetched && (
                <span className="text-gray-300 ml-2 text-[10px]">
                  · synced {lastFetched.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-gray-200 text-gray-400
                       hover:text-emerald-600 hover:border-emerald-200 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {error && (
          <div
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 text-sm text-red-600"
          >
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Pending"
            value={counts.pending}
            Icon={Inbox}
            color="amber"
            loading={loading}
            sub="Awaiting review"
          />
          <StatCard
            label="Approved"
            value={counts.approved}
            Icon={Clock}
            color="blue"
            loading={loading}
            sub="Scheduled pickup"
          />
          <StatCard
            label="Ready for Pickup"
            value={counts.ready}
            Icon={PackageCheck}
            color="emerald"
            loading={loading}
            sub="Awaiting collection"
          />
          <StatCard
            label="Completed"
            value={counts.done}
            Icon={CheckCircle}
            color="violet"
            loading={loading}
            sub="Collected & done"
          />
          <StatCard
            label="Rejected"
            value={counts.rejected}
            Icon={XCircle}
            color="red"
            loading={loading}
            sub="Declined requests"
          />
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area chart — requests over last 7 days */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-300 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-black text-gray-900">
                  Requests Over Time
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Last 7 days by status
                </p>
              </div>
              <TrendingUp size={15} className="text-emerald-500" />
            </div>
            {statsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-gray-300" />
              </div>
            ) : stats?.daily?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={stats.daily}
                  margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#gPending)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#gDone)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-300 text-xs">
                No data available
              </div>
            )}
          </div>

          {/* Donut — status breakdown */}
          <div className="bg-white rounded-2xl border border-gray-300 p-5">
            <div className="mb-4">
              <p className="text-sm font-black text-gray-900">
                Status Breakdown
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                All time · {totalRequests} total
              </p>
            </div>
            {ctxLoading ? (
              <div className="h-44 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-gray-300" />
              </div>
            ) : donutData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {donutData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: d.color }}
                        />
                        <span className="text-[11px] text-gray-500 font-medium">
                          {d.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-black text-gray-700">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-44 flex items-center justify-center text-gray-300 text-xs">
                No requests yet
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent requests table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-300 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-black text-gray-900">
                Recent Requests
              </p>
              <span className="text-[10px] text-gray-300 font-mono">
                Latest 8
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px]">
                <thead>
                  <tr className="bg-gray-50/70">
                    {["Resident", "Document", "Status", "Filed"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-left text-[9px] font-black tracking-[0.12em]
                                   uppercase text-gray-400
                                   ${i === 1 ? "hidden sm:table-cell" : ""}
                                   ${i === 3 ? "hidden md:table-cell text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ctxLoading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center">
                        <Loader2
                          size={18}
                          className="animate-spin text-emerald-500 mx-auto"
                        />
                      </td>
                    </tr>
                  ) : recent.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-xs text-gray-300"
                      >
                        No requests yet
                      </td>
                    </tr>
                  ) : (
                    recent.map((req, i) => (
                      <RecentRow
                        key={req.request_id}
                        req={req}
                        isLast={i === recent.length - 1}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column — bar chart + revenue */}
          <div className="space-y-4">
            {/* Bar chart — document types */}
            <div className="bg-white rounded-2xl border border-gray-300 p-5">
              <p className="text-sm font-black text-gray-900 mb-1">
                Top Documents
              </p>
              <p className="text-[10px] text-gray-400 mb-4">
                By request volume
              </p>
              {statsLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-gray-300" />
                </div>
              ) : stats?.topDocuments?.length > 0 ? (
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart
                    data={stats.topDocuments}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="count"
                      name="Requests"
                      radius={[0, 6, 6, 0]}
                      fill="#10b981"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-300 text-xs">
                  No data
                </div>
              )}
            </div>

            {/* Revenue summary */}
            <div className="bg-white rounded-2xl p-5 border border-gray-300 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={14} className="text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Total Fee Collected
                </p>
              </div>

              {statsLoading ? (
                <div className="space-y-2">
                  <div className="h-8 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                </div>
              ) : (
                <>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    ₱
                    {Number(stats?.totalRevenue ?? 0).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Aggregated lifetime collections
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                        Today
                      </p>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">
                        ₱
                        {Number(stats?.todayRevenue ?? 0).toLocaleString(
                          "en-PH",
                          { minimumFractionDigits: 2 },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                        This Month
                      </p>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">
                        ₱
                        {Number(stats?.monthRevenue ?? 0).toLocaleString(
                          "en-PH",
                          { minimumFractionDigits: 2 },
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClerkDashboard;
