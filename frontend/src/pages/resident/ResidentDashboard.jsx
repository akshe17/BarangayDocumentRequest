import React from "react";
import {
  FileText,
  Clock,
  ChevronRight,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const recentRequests = [
    {
      id: "REQ-001",
      type: "Barangay Clearance",
      status: "Ready",
      date: "Feb 1",
    },
    {
      id: "REQ-002",
      type: "Certificate of Indigency",
      status: "Pending",
      date: "Jan 30",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HERO */}
      <div className="bg-emerald-600 rounded-[1.5rem] p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-100">
        <div className="relative z-10">
          <h1 className="text-xl font-black tracking-tight mb-2 uppercase">
            Welcome back, Maria!
          </h1>
          <p className="text-emerald-50 text-[10px] font-medium opacity-80 max-w-xs leading-relaxed">
            Your documents are being processed. Check your status below or start
            a new application.
          </p>
          <button
            onClick={() => navigate("/resident/new-request")}
            className="mt-6 bg-white text-emerald-600 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-2"
          >
            <PlusCircle size={14} /> New Request
          </button>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full -mr-16 -mt-16 opacity-40 blur-3xl"></div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Clock size={18} className="text-amber-500" />}
          label="In Progress"
          value="02"
        />
        <StatCard
          icon={<FileText size={18} className="text-blue-500" />}
          label="Approved"
          value="12"
        />
        <StatCard
          icon={<HelpCircle size={18} className="text-emerald-500" />}
          label="Rejected"
          value="1"
        />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="text-[9px] font-black text-gray-900 uppercase tracking-[0.2em]">
            Recent Activity
          </h3>
          <button
            onClick={() => navigate("/resident/history")}
            className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
          >
            View History
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {recentRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-800">
                    {req.type}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {req.id} • {req.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                    req.status === "Ready"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {req.status}
                </span>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-lg font-black text-gray-900 leading-none">{value}</p>
    </div>
  </div>
);

export default ResidentDashboard;
