import React, { useState, useEffect, useMemo } from "react";
// Import your Axios instance here
import api from "../../axious/api";
import {
  Activity,
  Terminal,
  Search,
  Calendar,
  User,
  Edit,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";

const ZoneLeaderLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  // Fetch data using Axios - Updated Endpoint
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // GET logs specifically for the Zone Leader
        const response = await api.get("/zone-leader/logs");

        // Assuming API returns data in format: { id, action, description, type, user, time, date, color, userRole }
        setLogs(response.data);
      } catch (err) {
        console.error("API Error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch zone logs. Please check console.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on search, type, and date
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || log.type === filterType;

      // Note: Date logic should ideally be handled by backend,
      // but keeping frontend filtering for now based on string matching
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && log.date === "Feb 15, 2026") ||
        (dateFilter === "yesterday" && log.date === "Feb 14, 2026");

      return matchesSearch && matchesType && matchesDate;
    });
  }, [logs, searchTerm, filterType, dateFilter]);

  // Map log types to specific icons for Zone Leader actions
  const getIcon = (type) => {
    const icons = {
      verification: <ShieldCheck size={18} className="text-emerald-600" />,
      rejection: <XCircle size={18} className="text-red-600" />,
      update: <Edit size={18} className="text-blue-600" />,
    };
    return icons[type] || <Activity size={18} className="text-gray-600" />;
  };

  const getColorClasses = (type) => {
    const colors = {
      verification: "bg-emerald-100 border-emerald-200",
      rejection: "bg-red-100 border-red-200",
      update: "bg-blue-100 border-blue-200",
    };
    return colors[type] || "bg-gray-100 border-gray-200";
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Zone Leader Activity Logs
            </h1>
            <p className="text-gray-500">
              Tracking resident verifications and zone updates
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
              placeholder="Search actions or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filter by Type */}
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
              {["all", "verification", "rejection"].map((type) => (
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

            {/* Filter by Date */}
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
              No activity logs found for your zone.
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
                  {/* Icon & Color */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getColorClasses(log.type)}`}
                  >
                    {getIcon(log.type)}
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
                        <span className="font-semibold text-emerald-700">
                          {log.user}
                        </span>
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

export default ZoneLeaderLogs;
