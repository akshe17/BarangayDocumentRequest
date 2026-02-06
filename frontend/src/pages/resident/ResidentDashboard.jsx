import React from "react";
import {
  FileText,
  Clock,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Define status mapping for icons and colors
  const statusConfig = {
    Ready: {
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    Pending: {
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    Rejected: {
      icon: AlertTriangle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-100",
    },
  };

  const recentRequests = [
    {
      id: "REQ-001",
      type: "Barangay Clearance",
      status: "Ready",
      date: "Feb 1, 2026",
    },
    {
      id: "REQ-002",
      type: "Certificate of Indigency",
      status: "Pending",
      date: "Jan 30, 2026",
    },
    {
      id: "REQ-003",
      type: "Barangay ID",
      status: "Rejected",
      date: "Jan 28, 2026",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HERO SECTION */}
      <div className="bg-emerald-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20">
        <div className="relative z-10">
          <p className="text-emerald-100 font-medium text-sm mb-1">
            Welcome back
          </p>
          <h1 className="text-4xl font-extrabold tracking-tighter mb-3">
            {user.resident.first_name} {user.resident.last_name}
          </h1>
          <p className="text-emerald-50 text-sm font-medium opacity-90 max-w-md leading-relaxed">
            Your documents are currently being processed. Track your
            applications below or submit a new request.
          </p>
          <button
            onClick={() => navigate("/resident/new-request")}
            className="mt-8 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all flex items-center gap-2.5 shadow-sm"
          >
            <PlusCircle size={18} />
            Request New Document
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400 rounded-full opacity-30 blur-2xl"></div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={<Clock size={22} className="text-amber-600" />}
          label="In Progress"
          value="02"
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle2 size={22} className="text-emerald-600" />}
          label="Approved"
          value="12"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={<AlertTriangle size={22} className="text-red-600" />}
          label="Rejected"
          value="1"
          bgColor="bg-red-50"
        />
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
            Recent Applications
          </h3>
          <button
            onClick={() => navigate("/resident/history")}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
          >
            View Full History
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {recentRequests.map((req) => {
            const statusInfo = statusConfig[req.status] || statusConfig.Pending;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={req.id}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${statusInfo.bg} flex items-center justify-center ${statusInfo.color} border ${statusInfo.border}`}
                  >
                    <FileText size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {req.type}
                    </p>
                    <p className="text-xs text-gray-500 font-medium tracking-tight mt-0.5">
                      {req.id} • {req.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    <StatusIcon size={14} />
                    {req.status}
                  </span>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-gray-200 transition-all hover:shadow-md">
    <div
      className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-4xl font-extrabold text-gray-950 tracking-tight leading-none">
        {value}
      </p>
    </div>
  </div>
);

export default ResidentDashboard;
