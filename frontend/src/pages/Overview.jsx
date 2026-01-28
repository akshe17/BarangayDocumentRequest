import React from "react";
import { Users, FileCheck, Clock, TrendingUp } from "lucide-react";
import {
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
  Legend,
} from "recharts";

const Overview = () => {
  const stats = [
    {
      label: "Total Residents",
      value: "1,284",
      icon: <Users />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      trend: "+5.2%",
    },
    {
      label: "Pending Requests",
      value: "24",
      icon: <Clock />,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
      lightBg: "bg-amber-50",
      trend: "-12%",
    },
    {
      label: "Completed Today",
      value: "15",
      icon: <FileCheck />,
      color: "bg-gradient-to-br from-emerald-500 to-green-600",
      lightBg: "bg-emerald-50",
      trend: "+8.1%",
    },
    {
      label: "Growth Rate",
      value: "+12%",
      icon: <TrendingUp />,
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      lightBg: "bg-indigo-50",
      trend: "+2.4%",
    },
  ];

  const chartData = [
    { name: "Brgy Clearance", value: 400 },
    { name: "Indigency", value: 300 },
    { name: "Residency", value: 200 },
    { name: "Permits", value: 100 },
  ];

  const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-800">
            {payload[0].payload.name}
          </p>
          <p className="text-lg font-bold text-emerald-600">
            {payload[0].value} requests
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-500">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`${stat.color} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {React.cloneElement(stat.icon, { size: 22, strokeWidth: 2.5 })}
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.trend.startsWith("+")
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-black text-gray-900">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Document Request Trends
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Last 30 days performance
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                Week
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                Month
              </button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 13, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 13 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f0fdf4" }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[12, 12, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Request Distribution
          </h3>
          <p className="text-sm text-gray-500 mb-6">Document type breakdown</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient
                      key={index}
                      id={`pieGradient${index}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient${index})`}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {chartData.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: COLORS[i] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {item.value}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({Math.round((item.value / 1000) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
