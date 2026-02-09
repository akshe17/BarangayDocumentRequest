import React from "react";
import { Users, AlertTriangle, FileText, CalendarDays } from "lucide-react";

const ZoneLeaderDashboard = () => {
  const stats = [
    {
      name: "Total Households",
      value: "85",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Pending Reports",
      value: "3",
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      name: "Active Alerts",
      value: "1",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-950 tracking-tight">
        Zone 1 Dashboard
      </h1>
      <p className="text-gray-600 mt-1 mb-8">
        Welcome, Zone Leader. Here is your area summary.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-950">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Events Placeholder */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-950 mb-4 flex items-center gap-2">
          <CalendarDays size={20} className="text-emerald-500" />
          Upcoming Community Events
        </h3>
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm">
            No scheduled events in your zone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZoneLeaderDashboard;
