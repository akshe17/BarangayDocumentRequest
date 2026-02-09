import React from "react";
import {
  FileText,
  DollarSign,
  Clock,
  ArrowRight,
  MoreVertical,
  LayoutDashboard,
} from "lucide-react";

const ClerkDashboard = () => {
  // Stats data
  const stats = [
    {
      name: "Pending Payments",
      value: "12",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      name: "In Processing",
      value: "5",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Completed Today",
      value: "24",
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  // Mock data for table
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
    {
      id: "REQ-004",
      resident: "Ana Reyes",
      type: "Certificate of Residency",
      status: "Processing",
      date: "2 hrs ago",
    },
  ];

  const statusColors = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Processing: "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of your pending tasks and recent requests.
          </p>
        </div>
        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition flex items-center gap-2 w-full sm:w-auto justify-center shadow-md">
          <FileText size={16} />
          Process New Request
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Today
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium tracking-wide">
              {stat.name}
            </p>
            <p className="text-4xl font-bold text-gray-950 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-emerald-500" />
            Recent Request Queue
          </h3>
          <button className="text-sm text-gray-600 font-semibold hover:text-emerald-600 flex items-center gap-1.5">
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-4 py-4">Resident</th>
                <th className="px-4 py-4">Request Type</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Time Elapsed</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-5 font-semibold text-gray-950">
                    {req.resident}
                    <p className="text-xs text-gray-400 font-normal">
                      {req.id}
                    </p>
                  </td>
                  <td className="px-4 py-5 text-gray-600">{req.type}</td>
                  <td className="px-4 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[req.status]}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-gray-600">{req.date}</td>
                  <td className="px-4 py-5 text-center">
                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
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
