import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../axious/api";
import {
  Terminal,
  Search,
  User,
  Edit,
  Trash2,
  Settings,
  Shield,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Filter,
  ChevronRight,
  UserCheck,
} from "lucide-react";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // --- Fetch Data ---
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/audit-logs");

      // Transform Laravel data for UI
      const mapped = response.data.map((log) => {
        const dateObj = new Date(log.created_at);
        const styles = determineLogStyles(log.action);

        return {
          id: log.log_id,
          action: log.action,
          details: log.details,
          userName: log.user
            ? `${log.user.first_name} ${log.user.last_name}`
            : "System",
          userRole: log.user?.role?.role_name || "System Process",
          date: dateObj.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: dateObj.toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          rawDate: dateObj, // for filtering
          ...styles,
        };
      });

      setLogs(mapped);
    } catch (err) {
      console.error("Audit Fetch Error:", err);
      setError("Failed to synchronize audit logs with the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // --- Helper: Dynamic UI mapping ---
  const determineLogStyles = (action) => {
    const act = action.toLowerCase();
    if (act.includes("delete"))
      return { type: "delete", color: "red", icon: <Trash2 size={16} /> };
    if (act.includes("update") || act.includes("edit"))
      return { type: "update", color: "blue", icon: <Edit size={16} /> };
    if (act.includes("password"))
      return { type: "security", color: "purple", icon: <Shield size={16} /> };
    if (act.includes("enabled") || act.includes("active"))
      return {
        type: "active",
        color: "emerald",
        icon: <UserCheck size={16} />,
      };
    if (act.includes("disabled"))
      return { type: "inactive", color: "amber", icon: <XCircle size={16} /> };
    return { type: "general", color: "gray", icon: <Terminal size={16} /> };
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      red: "bg-red-50 text-red-600 border-red-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      gray: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return colors[color] || colors.gray;
  };

  // --- Filter Logic ---
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || log.type === filterType;

      const today = new Date().toDateString();
      const logDateString = log.rawDate.toDateString();
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && logDateString === today);

      return matchesSearch && matchesType && matchesDate;
    });
  }, [logs, searchTerm, filterType, dateFilter]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
              <Terminal size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              System Audit
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Monitoring administrative actions and security events
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh Stream
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-12 pr-4 py-3 bg-transparent text-slate-900 font-medium placeholder:text-slate-400 outline-none"
            placeholder="Search by admin name or specific action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
          {["all", "update", "delete", "security"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filterType === t
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
          <select
            className="bg-transparent text-xs font-black uppercase text-slate-600 outline-none pr-4 cursor-pointer"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today Only</option>
          </select>
        </div>
      </div>

      {/* LOG FEED */}
      <div className="relative">
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 size={40} className="text-slate-300 animate-spin" />
            <p className="text-slate-400 font-bold animate-pulse text-sm">
              Intercepting log packets...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-3xl border-2 border-dashed border-red-100">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-red-800 font-black mb-1">Connection Error</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Filter size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-slate-900 font-black">No matching events</h3>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="group bg-white p-5 rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Action Icon */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-14 w-1 bg-slate-100 rounded-full group-hover:h-16 transition-all duration-300 ${
                        log.color === "red"
                          ? "bg-red-400"
                          : log.color === "emerald"
                            ? "bg-emerald-400"
                            : "bg-blue-400"
                      }`}
                    />
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover:rotate-6 ${getColorClasses(log.color)}`}
                    >
                      {log.icon}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {log.action}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                        ID: #{log.id}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                        <User size={12} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          {log.userName}
                        </span>
                      </div>
                      <span className="text-slate-300">/</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {log.userRole}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-xs font-black">{log.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {log.date}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-200 ml-2 hidden md:block group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      {!loading && filteredLogs.length > 0 && (
        <div className="flex justify-center">
          <div className="px-4 py-2 bg-slate-900 rounded-full shadow-lg">
            <p className="text-[10px] text-white font-black uppercase tracking-[0.2em]">
              End of Stream — {filteredLogs.length} Events Logged
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
