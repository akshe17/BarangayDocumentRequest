import React, { useState, useEffect } from "react";
import api from "../../axious/api";
import {
  Clock,
  Loader2,
  AlertCircle,
  History,
  FileText,
  UserCheck,
  Settings,
  ArrowRight,
} from "lucide-react";

const ResidentNotifications = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/resident-logs");
      setLogs(response.data);
    } catch (err) {
      setError("Failed to load your activity history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLogStyles = (action) => {
    const type = action?.toLowerCase() || "";
    if (type.includes("request")) {
      return {
        icon: <FileText size={20} />,
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
      };
    }
    if (
      type.includes("profile") ||
      type.includes("account") ||
      type.includes("verify")
    ) {
      return {
        icon: <UserCheck size={20} />,
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
      };
    }
    if (
      type.includes("update") ||
      type.includes("edit") ||
      type.includes("change")
    ) {
      return {
        icon: <Settings size={20} />,
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
      };
    }
    return {
      icon: <Clock size={20} />,
      bg: "bg-gray-50",
      text: "text-gray-500",
      border: "border-gray-100",
    };
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="mb-10 pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 tracking-tighter">
            Activity History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            A chronological record of your account actions.
          </p>
        </div>
        <div className="p-3 bg-white shadow-sm rounded-2xl border border-gray-100">
          <History className="text-emerald-600" size={24} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="animate-spin mb-4 text-emerald-600" size={40} />
          <p className="text-sm font-medium">Retrieving logs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-3xl border border-red-100 px-6">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-red-900">Connection Error</h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchLogs}
            className="mt-6 px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.length > 0 ? (
            logs.map((log) => {
              const style = getLogStyles(log.action);
              return (
                <div
                  key={log.log_id}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                >
                  <div
                    className={`p-3.5 rounded-2xl border shrink-0 ${style.bg} ${style.text} ${style.border} transition-transform group-hover:scale-110 shadow-sm`}
                  >
                    {style.icon}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900 capitalize tracking-tight">
                        {log.action?.replace(/_/g, " ")}
                      </h3>
                      <ArrowRight
                        size={14}
                        className="text-gray-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      {log.details}
                    </p>
                  </div>

                  <div className="text-right shrink-0 border-l border-gray-50 pl-5 pt-1">
                    <p className="text-[10px] font-black text-gray-900 block uppercase tracking-tighter">
                      {new Date(log.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                      {new Date(log.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <History size={40} className="text-gray-200" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                No History Found
              </h3>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Once you perform actions in the system, they will be logged here
                for your reference.
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            End of History
          </p>
        </div>
      )}
    </div>
  );
};

export default ResidentNotifications;
