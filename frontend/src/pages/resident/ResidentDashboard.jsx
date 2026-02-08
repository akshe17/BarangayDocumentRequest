import React, { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bonbonVideo from "../../assets/bonbonVideo.mp4";

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoError, setVideoError] = useState(false);

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HERO SECTION WITH VIDEO BACKGROUND */}
      <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-10 text-white overflow-hidden">
        {/* Video Background */}
        {!videoError && (
          <>
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

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-700/85 to-emerald-800/90"></div>
          </>
        )}

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={<Clock size={22} className="text-amber-600" />}
          label="In Progress"
          value="02"
          bgColor="bg-amber-50"
          borderColor="border-amber-100"
        />
        <StatCard
          icon={<CheckCircle2 size={22} className="text-emerald-600" />}
          label="Completed"
          value="12"
          bgColor="bg-emerald-50"
          borderColor="border-emerald-100"
        />
        <StatCard
          icon={<TrendingUp size={22} className="text-blue-600" />}
          label="Total Requests"
          value="15"
          bgColor="bg-blue-50"
          borderColor="border-blue-100"
        />
      </div>

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
          {recentRequests.map((req) => {
            const statusInfo = statusConfig[req.status] || statusConfig.Pending;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={req.id}
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
                      {req.type}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {req.id} • {req.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border}`}
                  >
                    <StatusIcon size={14} />
                    {req.status}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-gray-400 transition-colors"
                  />
                </div>
              </div>
            );
          })}
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
