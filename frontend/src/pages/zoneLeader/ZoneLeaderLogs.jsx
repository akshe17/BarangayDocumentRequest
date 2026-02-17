import React, { useState, useEffect } from "react";
// Import your Axios instance here
import api from "../../axious/api";
import {
  Activity,
  Calendar,
  User,
  Edit,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  FileText,
} from "lucide-react";

const ZoneLeaderLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data using Axios
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // GET logs specifically for the Logged-in User
        const response = await api.get("/zone-leader/logs");

        // Assumes API returns data in format: { id, action, description, type, user, time, date }
        setLogs(response.data);
      } catch (err) {
        console.error("API Error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch your logs. Please check console.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Map log types to specific icons
  const getIcon = (type) => {
    const icons = {
      verification: <ShieldCheck size={18} className="text-emerald-600" />,
      rejection: <XCircle size={18} className="text-red-600" />,
      request: <FileText size={18} className="text-purple-600" />,
      resubmission: <AlertCircle size={18} className="text-amber-600" />,
      update: <Edit size={18} className="text-blue-600" />,
    };
    return icons[type] || <Activity size={18} className="text-gray-600" />;
  };

  const getColorClasses = (type) => {
    const colors = {
      verification: "bg-emerald-100 border-emerald-200",
      rejection: "bg-red-100 border-red-200",
      request: "bg-purple-100 border-purple-200",
      resubmission: "bg-amber-100 border-amber-200",
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
              My Activity Logs
            </h1>
            <p className="text-gray-500">Personal log of your actions</p>
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
        ) : logs.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
            <Activity size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-sm text-gray-500">
              No activity logs found for your account.
            </p>
          </div>
        ) : (
          logs.map((log) => (
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
