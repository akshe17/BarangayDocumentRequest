import React, { useState, useEffect, useMemo } from "react";
// Import your Axios instance here
import api from "../axious/api";
import {
  Activity,
  Terminal,
  Search,
  Download,
  Calendar,
  User,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  LogIn,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  // Fetch data using Axios
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // Using api.get instead of fetch
        const response = await api.get("/audit-logs");

        // Axios automatically parses JSON, data is in response.data
        setLogs(response.data);
      } catch (err) {
        console.error("API Error:", err);
        // Axios stores error details in err.response
        setError(
          err.response?.data?.message ||
            "Failed to fetch logs. Please check console.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || log.type === filterType;

      // Note: Ensure API date format matches required filtering logic
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && log.date === "Feb 11, 2026") || // Assuming current date
        (dateFilter === "yesterday" && log.date === "Feb 10, 2026");

      return matchesSearch && matchesType && matchesDate;
    });
  }, [logs, searchTerm, filterType, dateFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: logs.length,
      today: logs.filter((l) => l.date === "Feb 11, 2026").length,
      approvals: logs.filter((l) => l.type === "approval").length,
      updates: logs.filter((l) => l.type === "update").length,
    };
  }, [logs]);

  // Map log types to icons
  const getIcon = (type) => {
    const icons = {
      approval: <CheckCircle2 size={18} />,
      update: <Edit size={18} />,
      verification: <Shield size={18} />,
      rejection: <XCircle size={18} />,
      create: <UserPlus size={18} />,
      delete: <Trash2 size={18} />,
      login: <LogIn size={18} />,
      settings: <Settings size={18} />,
    };
    return icons[type] || <AlertCircle size={18} />;
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      red: "bg-red-100 text-red-700 border-red-200",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
      amber: "bg-amber-100 text-amber-700 border-amber-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[color] || colors.gray;
  };

  const getBarColor = (color) => {
    const colors = {
      emerald: "bg-emerald-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      indigo: "bg-indigo-500",
      amber: "bg-amber-500",
      gray: "bg-gray-500",
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Terminal size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Audit Logs & Activity
            </h1>
            <p className="text-gray-500">
              Real-time tracking of all system activities
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
              {["all", "approval", "update"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterType === type
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>
          </div>
        </div>
      </div>

      {/* LOGS LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin" /> Loading logs...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle className="mx-auto mb-2" /> {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
            <Search size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-sm text-gray-500">
              No activities found
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon & Color Bar */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-14 rounded-full ${getBarColor(log.color)} group-hover:scale-110 transition-transform`}
                    ></div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getColorClasses(log.color)}`}
                    >
                      {getIcon(log.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {log.action}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <User size={12} />
                        <span className="font-semibold text-emerald-600">
                          {log.user}
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{log.userRole}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time & Date */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-1">
                    <Clock size={12} className="text-gray-400" />
                    {log.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    <Calendar size={10} className="text-gray-400" />
                    {log.date}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
