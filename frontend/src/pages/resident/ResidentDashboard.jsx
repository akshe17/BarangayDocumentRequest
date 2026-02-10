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
  XCircle, // ADDED ICON
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
    },
    recent_requests: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/resident/dashboard");
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Define status mapping for icons and colors
  const statusConfig = {
    Completed: {
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    Approved: {
      icon: CheckCircle2,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    Pending: {
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    Rejected: {
      icon: XCircle, // Updated Icon
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-100",
    },
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 bg-white animate-in fade-in duration-500">
      {/* HERO SECTION WITH VIDEO BACKGROUND */}
      <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-10 text-white overflow-hidden">
        {/* Video Background */}
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            onError={() => {
              console.error("Video failed to load");
              setVideoError(true);
            }}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={bonbonVideo} type="video/mp4" />
          </video>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-700/85 to-emerald-800/90"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-emerald-200" />
            <p className="text-emerald-100 font-semibold text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back, {user.resident.first_name}!
          </h1>
          <p className="text-emerald-50 text-base font-medium max-w-2xl leading-relaxed">
            Track your document requests, check application status, and submit
            new requests all in one place.
          </p>
          <button
            onClick={() => navigate("/resident/new-request")}
            className="mt-6 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <PlusCircle size={18} />
            Request New Document
          </button>
        </div>
      </div>

      {/* STATS SECTION */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard
            icon={<TrendingUp size={22} className="text-gray-600" />}
            label="Total"
            value={dashboardData.stats.total.toString().padStart(2, "0")}
            bgColor="bg-gray-50"
            borderColor="border-gray-100"
          />
          <StatCard
            icon={<Clock size={22} className="text-amber-600" />}
            label="Pending"
            value={dashboardData.stats.pending.toString().padStart(2, "0")}
            bgColor="bg-amber-50"
            borderColor="border-amber-100"
          />
          <StatCard
            icon={<CheckCircle2 size={22} className="text-blue-600" />}
            label="Approved"
            value={dashboardData.stats.approved.toString().padStart(2, "0")}
            bgColor="bg-blue-50"
            borderColor="border-blue-100"
          />
          <StatCard
            icon={<CheckCircle2 size={22} className="text-emerald-600" />}
            label="Completed"
            value={dashboardData.stats.completed.toString().padStart(2, "0")}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
          />
          <StatCard
            icon={<XCircle size={22} className="text-red-600" />}
            label="Rejected"
            value={dashboardData.stats.rejected.toString().padStart(2, "0")}
            bgColor="bg-red-50"
            borderColor="border-red-100"
          />
        </div>
      )}

      {/* RECENT ACTIVITY SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Recent Applications
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Track your latest document requests
            </p>
          </div>
          <button
            onClick={() => navigate("/resident/history")}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Loading recent requests...
              </p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          ) : dashboardData.recent_requests.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">No requests yet</p>
              <p className="text-xs mt-1">
                Start by requesting your first document
              </p>
            </div>
          ) : (
            dashboardData.recent_requests.map((req) => {
              const statusName = req.status?.status_name || "Pending";
              const statusInfo =
                statusConfig[statusName] || statusConfig.Pending;
              const StatusIcon = statusInfo.icon;

              const items = req.items || [];
              const documentName =
                items.length === 1
                  ? items[0].document?.document_name
                  : `${items.length} Documents`;

              return (
                <div
                  key={req.request_id}
                  onClick={() => navigate("/resident/history")}
                  className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${statusInfo.bg} flex items-center justify-center ${statusInfo.color} border ${statusInfo.border} transition-transform group-hover:scale-105`}
                    >
                      <FileText size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {documentName}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        REQ-{req.request_id} • {formatDate(req.request_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border}`}
                    >
                      <StatusIcon size={14} />
                      {statusName}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-gray-400 transition-colors"
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

const StatCard = ({ icon, label, value, bgColor, borderColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 hover:border-gray-200 transition-all">
    <div
      className={`w-12 h-12 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-950">{value}</p>
    </div>
  </div>
);

export default ResidentDashboard;
