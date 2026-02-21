import React, { useState, useEffect } from "react";
import api from "../../axious/api";
import {
  FileText,
  Clock,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  TrendingUp,
  CalendarDays,
  XCircle,
  PackageCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoError, setVideoError] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      ready: 0,
    },
    recent_requests: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/resident/dashboard");
      setDashboardData(data);
    } catch (err) {
      setError("Unable to sync dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    Pending: {
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    Approved: {
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    Completed: {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    Rejected: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    "Ready for Pickup": {
      icon: PackageCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-[2rem] shadow-xl">
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoError(true)}
          >
            <source src={bonbonVideo} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900/80 to-transparent"></div>

        <div className="relative z-10 p-8 md:p-14">
          <div className="flex items-center gap-2 mb-4 text-emerald-200/80 text-xs font-bold uppercase tracking-widest">
            <CalendarDays size={14} />
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            Mabuhay, {user?.first_name}!
          </h1>
          <p className="text-emerald-50/70 text-sm md:text-base max-w-lg mb-8">
            Manage your document requests and track barangay clearances in
            real-time.
          </p>
          <button
            onClick={() => navigate("/resident/new-request")}
            className="bg-white text-emerald-900 px-6 py-3.5 rounded-xl font-bold text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
          >
            <PlusCircle size={18} />
            New Request
          </button>
        </div>
      </div>

      {/* STATS GRID - COMPACT 5-COL */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<TrendingUp />}
          label="Total"
          value={dashboardData.stats.total}
          color="gray"
        />
        <StatCard
          icon={<Clock />}
          label="Pending"
          value={dashboardData.stats.pending}
          color="amber"
        />
        <StatCard
          icon={<PackageCheck />}
          label="Pick-up"
          value={dashboardData.stats.ready}
          color="indigo"
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Completed"
          value={dashboardData.stats.completed}
          color="emerald"
        />
        <StatCard
          icon={<XCircle />}
          label="Rejected"
          value={dashboardData.stats.rejected}
          color="red"
        />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-black text-gray-900 tracking-tight">
            Recent Applications
          </h3>
          <button
            onClick={() => navigate("/resident/history")}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            VIEW ALL
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {isLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-emerald-500" />
            </div>
          ) : (
            dashboardData.recent_requests.map((req) => {
              const status = req.status?.status_name || "Pending";
              const config = statusConfig[status] || statusConfig.Pending;
              return (
                <div
                  key={req.request_id}
                  className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${config.bg} ${config.color} flex items-center justify-center border ${config.border}`}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {req.document_type?.document_name}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        REQ-{req.request_id} •{" "}
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${config.bg} ${config.color} border ${config.border}`}
                    >
                      {status}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    red: "bg-red-50 text-red-600 border-red-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all group">
      <div
        className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${themes[color]}`}
      >
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-gray-950">
        {value.toString().padStart(2, "0")}
      </p>
    </div>
  );
};

export default ResidentDashboard;
