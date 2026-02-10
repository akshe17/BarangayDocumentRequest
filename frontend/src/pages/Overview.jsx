import React, { useState, useEffect } from "react";
import api from "../axious/api";
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Overview = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_residents: 0,
      total_requests: 0,
      pending_requests: 0,
      approved_requests: 0,
      completed_requests: 0,
      rejected_requests: 0,
    },
    trends: {
      residents: 0,
      pending: 0,
    },
    document_distribution: [],
    trend_data: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/dashboard/overview");
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Residents",
      value: dashboardData.stats.total_residents.toLocaleString(),
      icon: <Users />,
      color: "from-blue-500 to-blue-600",
      trend:
        dashboardData.trends.residents >= 0
          ? `+${dashboardData.trends.residents}%`
          : `${dashboardData.trends.residents}%`,
    },
    {
      label: "Total Requests",
      value: dashboardData.stats.total_requests.toLocaleString(),
      icon: <FileText />,
      color: "from-gray-500 to-gray-600",
    },
    {
      label: "Pending",
      value: dashboardData.stats.pending_requests.toLocaleString(),
      icon: <Clock />,
      color: "from-amber-500 to-orange-500",
      trend:
        dashboardData.trends.pending >= 0
          ? `+${dashboardData.trends.pending}%`
          : `${dashboardData.trends.pending}%`,
    },
    {
      label: "Approved",
      value: dashboardData.stats.approved_requests.toLocaleString(),
      icon: <CheckCircle2 />,
      color: "from-blue-400 to-blue-600",
    },
    {
      label: "Completed",
      value: dashboardData.stats.completed_requests.toLocaleString(),
      icon: <CheckCircle2 />,
      color: "from-emerald-500 to-green-600",
    },
    {
      label: "Rejected",
      value: dashboardData.stats.rejected_requests.toLocaleString(),
      icon: <XCircle />,
      color: "from-red-500 to-red-600",
    },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-800">
            {payload[0].payload.name || payload[0].payload.date}
          </p>
          <p className="text-lg font-bold text-emerald-600">
            {payload[0].value} {payload[0].payload.name ? "requests" : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  if (error)
    return <div className="text-center text-red-600 pt-20">{error}</div>;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Dashboard Overview
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`bg-gradient-to-br ${stat.color} p-2.5 rounded-xl text-white shadow-lg`}
              >
                {React.cloneElement(stat.icon, { size: 20 })}
              </div>
              {stat.trend && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.trend.startsWith("+") ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                >
                  {stat.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Request Trends (Last 7 Days)
          </h3>
          <div className="h-100 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.trend_data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Request Distribution
          </h3>
          {dashboardData.document_distribution.length > 0 ? (
            <div className="h-72 w-full">
              {" "}
              {/* Increased height slightly */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.document_distribution}
                    innerRadius={60} // <-- Reduced slightly to make room
                    outerRadius={90} // <-- Reduced slightly
                    paddingAngle={3}
                    dataKey="value"
                    // --- REMOVED LABEL PROPS FROM HERE ---
                    labelLine={false}
                    // -------------------------------------
                  >
                    {dashboardData.document_distribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  {/* --- ADDED LEGEND --- */}
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                  {/* ------------------- */}
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
