import React from "react";
import {
  FileText,
  DollarSign,
  Clock,
  ArrowRight,
  MoreVertical,
} from "lucide-react";

const ClerkDashboard = () => {
  // Mock data for dashboard cards
  const stats = [
    {
      name: "Pending Payments",
      value: "12",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100",
      border: "border-amber-200",
    },
    {
      name: "In Processing",
      value: "5",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200",
    },
    {
      name: "Completed Today",
      value: "24",
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      border: "border-emerald-200",
    },
  ];

  // Mock data for recent requests table
  const recentRequests = [
    {
      id: "REQ-001",
      resident: "Juan Dela Cruz",
      type: "Barangay Clearance",
      status: "Pending",
      date: "10 mins ago",
    },
    {
      id: "REQ-002",
      resident: "Maria Santos",
      type: "Certificate of Indigency",
      status: "Processing",
      date: "30 mins ago",
    },
    {
      id: "REQ-003",
      resident: "Pedro Penduko",
      type: "Barangay Clearance",
      status: "Completed",
      date: "1 hr ago",
    },
  ];

  const statusColors = {
    Pending: "bg-amber-100 text-amber-700",
    Processing: "bg-blue-100 text-blue-700",
    Completed: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            Clerk Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here is a summary of your workload for today.
          </p>
        </div>
        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition flex items-center gap-2 shadow-sm">
          View All Requests <ArrowRight size={16} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.border} border`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                {stat.name}
              </p>
              <p className="text-4xl font-extrabold text-gray-950 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-950">Recent Requests</h3>
          <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Updates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {req.id}
                  </td>
                  <td className="px-4 py-4 text-gray-600">{req.resident}</td>
                  <td className="px-4 py-4 text-gray-600">{req.type}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[req.status]}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{req.date}</td>
                  <td className="px-4 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClerkDashboard;
