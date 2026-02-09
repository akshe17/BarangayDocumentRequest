import React from "react";
import { Users, FileText, CheckCircle, Clock, MapPin } from "lucide-react";

const ZoneLeaderDashboard = () => {
  const stats = [
    {
      name: "Total Households",
      value: "142",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Pending Requests",
      value: "5",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      name: "Verified Today",
      value: "12",
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  const pendingRequests = [
    {
      id: "REQ-001",
      resident: "Juan Dela Cruz",
      type: "Barangay Clearance",
      address: "Zone 1, Block A",
      date: "2h ago",
    },
    {
      id: "REQ-002",
      resident: "Maria Santos",
      type: "Residency",
      address: "Zone 1, Block B",
      date: "5h ago",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-950 tracking-tight">
          Zone 1 Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Area summary for today.</p>
      </div>

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

      {/* Pending Requests Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-950 mb-6">
          Pending Approvals in Zone
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">Request Type</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-semibold text-gray-950">
                    {req.resident}
                  </td>
                  <td className="px-4 py-4 text-gray-600">{req.type}</td>
                  <td className="px-4 py-4 text-gray-600 flex items-center gap-1.5">
                    <MapPin size={16} className="text-gray-400" />
                    {req.address}
                  </td>
                  <td className="px-4 py-4 text-gray-500">{req.date}</td>
                  <td className="px-4 py-4 text-center">
                    <button className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-emerald-100">
                      Verify
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

export default ZoneLeaderDashboard;
