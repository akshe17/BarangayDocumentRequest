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

  const statsConfig = [
    {
      label: "Total Residents",
      value: dashboardData.stats.total_residents.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: dashboardData.trends.residents,
    },
    {
      label: "Total Requests",
      value: dashboardData.stats.total_requests.toLocaleString(),
      icon: FileText,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
    {
      label: "Pending",
      value: dashboardData.stats.pending_requests.toLocaleString(),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
      trend: dashboardData.trends.pending,
    },
    {
      label: "Approved",
      value: dashboardData.stats.approved_requests.toLocaleString(),
      icon: CheckCircle2,
      color: "text-sky-600",
      bg: "bg-sky-100",
    },
    {
      label: "Completed",
      value: dashboardData.stats.completed_requests.toLocaleString(),
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Rejected",
      value: dashboardData.stats.rejected_requests.toLocaleString(),
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100">
          <p className="text-sm font-bold text-gray-900">
            {label || payload[0].payload.name}
          </p>
          <p className="text-lg font-black text-emerald-600">
            {payload[0].value}{" "}
            <span className="text-sm font-medium text-gray-500">requests</span>
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
    return (
      <div className="text-center text-red-600 pt-20 flex flex-col items-center">
        <AlertTriangle size={40} /> {error}
      </div>
    );

  return (
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-950 tracking-tight">
          Dashboard Overview
        </h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 shadow-sm"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid - Improved Design */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {statsConfig.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              {stat.trend !== undefined && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                >
                  {stat.trend >= 0 ? "+" : ""}
                  {stat.trend}%
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-4xl font-extrabold text-gray-950 tracking-tight">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Larger and labeled */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart - Requests Over Time */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-950">
              Request Volume Trends
            </h3>
            <span className="text-sm font-medium text-gray-500">
              Last 7 Days
            </span>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardData.trend_data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
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
                  strokeWidth={4}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-950 mb-6">
            Document Type Breakdown
          </h3>
          {dashboardData.document_distribution.length > 0 ? (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.document_distribution}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {dashboardData.document_distribution.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              No distribution data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
