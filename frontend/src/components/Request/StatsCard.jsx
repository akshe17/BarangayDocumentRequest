import React from "react";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const StatsCards = ({ stats, setFilterStatus }) => {
  const statCards = [
    {
      label: "Total Requests",
      value: stats.total,
      icon: FileText,
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-gray-900",
      filter: "all",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      textColor: "text-amber-600",
      filter: "pending",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: AlertCircle,
      gradient: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
      filter: "approved",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-600",
      textColor: "text-emerald-600",
      filter: "completed",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      gradient: "from-red-500 to-red-600",
      textColor: "text-red-600",
      filter: "rejected",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.filter}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterStatus(card.filter)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {card.label}
                </p>
                <h3 className={`text-2xl font-black ${card.textColor} mt-1`}>
                  {card.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center text-white shadow-md`}
              >
                <Icon size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
