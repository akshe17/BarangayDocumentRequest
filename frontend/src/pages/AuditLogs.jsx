import React, { useState, useMemo } from "react";
import {
  Activity,
  Terminal,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  FileCheck,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  LogIn,
  LogOut,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  const logs = [
    {
      id: 1,
      action: "Approved Business Permit",
      description: "Business Permit for REQ-004 approved",
      user: "Admin Mark",
      userRole: "Administrator",
      time: "10:24 AM",
      date: "Jan 29, 2026",
      type: "approval",
      icon: <CheckCircle2 size={18} />,
      color: "emerald",
    },
    {
      id: 2,
      action: "Updated Document Price",
      description: "Changed document price from ₱45 to ₱50",
      user: "Admin Sarah",
      userRole: "Super Admin",
      time: "09:15 AM",
      date: "Jan 29, 2026",
      type: "update",
      icon: <Edit size={18} />,
      color: "blue",
    },
    {
      id: 3,
      action: "Verified Resident ID",
      description: "Approved ID verification for Maria Clara",
      user: "Admin John",
      userRole: "Moderator",
      time: "08:45 AM",
      date: "Jan 29, 2026",
      type: "verification",
      icon: <Shield size={18} />,
      color: "purple",
    },
    {
      id: 4,
      action: "Rejected Document Request",
      description: "Rejected Certificate of Indigency - REQ-005",
      user: "Admin Sarah",
      userRole: "Super Admin",
      time: "08:12 AM",
      date: "Jan 29, 2026",
      type: "rejection",
      icon: <XCircle size={18} />,
      color: "red",
    },
    {
      id: 5,
      action: "Created New Resident",
      description: "Added new resident: Juan Luna",
      user: "Admin Mark",
      userRole: "Administrator",
      time: "07:30 AM",
      date: "Jan 29, 2026",
      type: "create",
      icon: <UserPlus size={18} />,
      color: "indigo",
    },
    {
      id: 6,
      action: "Deleted Resident Account",
      description: "Removed resident account: Test User",
      user: "Admin Sarah",
      userRole: "Super Admin",
      time: "05:22 PM",
      date: "Jan 28, 2026",
      type: "delete",
      icon: <Trash2 size={18} />,
      color: "red",
    },
    {
      id: 7,
      action: "User Login",
      description: "Admin Mark logged into the system",
      user: "Admin Mark",
      userRole: "Administrator",
      time: "07:00 AM",
      date: "Jan 29, 2026",
      type: "login",
      icon: <LogIn size={18} />,
      color: "gray",
    },
    {
      id: 8,
      action: "System Settings Changed",
      description: "Updated notification preferences",
      user: "Admin Sarah",
      userRole: "Super Admin",
      time: "04:45 PM",
      date: "Jan 28, 2026",
      type: "settings",
      icon: <Settings size={18} />,
      color: "amber",
    },
  ];

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || log.type === filterType;

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && log.date === "Jan 29, 2026") ||
        (dateFilter === "yesterday" && log.date === "Jan 28, 2026");

      return matchesSearch && matchesType && matchesDate;
    });
  }, [logs, searchTerm, filterType, dateFilter]);

  // Stats
  const stats = {
    total: logs.length,
    today: logs.filter((l) => l.date === "Jan 29, 2026").length,
    approvals: logs.filter((l) => l.type === "approval").length,
    updates: logs.filter((l) => l.type === "update").length,
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

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Activities
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.total}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Activity size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Today's Activity
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {stats.today}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Clock size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Approvals
              </p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                {stats.approvals}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Updates
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {stats.updates}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Edit size={24} strokeWidth={2.5} />
            </div>
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
            {/* Activity Type Filter */}
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterType === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("approval")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterType === "approval"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Approvals
              </button>
              <button
                onClick={() => setFilterType("update")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterType === "update"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Updates
              </button>
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>

            <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <Download size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* LOGS LIST */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
            <Search size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-sm text-gray-500">
              No activities found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search or filters
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
                      className={`w-1.5 h-14 rounded-full ${getBarColor(
                        log.color,
                      )} group-hover:scale-110 transition-transform`}
                    ></div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getColorClasses(
                        log.color,
                      )}`}
                    >
                      {log.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
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
                            <span className="text-gray-500">
                              {log.userRole}
                            </span>
                          </span>
                        </div>
                      </div>
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
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded text-[9px] font-bold uppercase ${getColorClasses(
                      log.color,
                    )}`}
                  >
                    {log.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredLogs.length > 0 && (
        <div className="text-center pt-4">
          <button className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-emerald-500 hover:text-emerald-600 transition-all">
            Load More Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
