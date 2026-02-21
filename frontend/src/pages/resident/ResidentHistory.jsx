import React, { useState, useEffect } from "react";
import api from "../../axious/api";
import {
  FileText,
  Calendar,
  ChevronRight,
  AlertCircle,
  Loader2,
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Info,
} from "lucide-react";

const ResidentHistory = () => {
  const [filter, setFilter] = useState("all");
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequestHistory();
  }, []);

  const fetchRequestHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Endpoint matches the DocumentController@getHistory
      const { data } = await api.get("/request-history");
      setHistoryData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to sync your history. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData =
    filter === "all"
      ? historyData
      : historyData.filter(
          (item) =>
            item.status?.status_name?.toLowerCase() === filter.toLowerCase(),
        );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* HEADER & FILTER SECTION */}
      <div className="space-y-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Request History
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic">
            Track and manage your barangay document applications.
          </p>
        </div>

        {/* COMPACT FILTER - NO SCROLL, WRAPS ON MOBILE */}
        <div className="flex flex-wrap bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200">
          {[
            "All",
            "Pending",
            "Approved",
            "Ready for Pickup",
            "Completed",
            "Rejected",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab.toLowerCase())}
              className={`flex-1 min-w-[85px] px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all text-center border ${
                filter === tab.toLowerCase()
                  ? "bg-white text-emerald-700 shadow-sm border-gray-200"
                  : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-200/50"
              }`}
            >
              {tab === "Ready for Pickup" ? "Pickup" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      {isLoading ? (
        <div className="py-32 flex flex-col items-center">
          <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Accessing Database...
          </p>
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-red-50 rounded-[2rem] border border-red-100">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={40} />
          <p className="text-red-700 font-bold mb-4">{error}</p>
          <button
            onClick={fetchRequestHistory}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((req) => (
              <HistoryCard key={req.request_id} req={req} />
            ))
          ) : (
            <div className="py-32 text-center bg-white border-2 border-dashed border-gray-100 rounded-[2rem]">
              <Search size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                No matching records found
              </p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER ADVISORY */}
      <div className="mt-12 p-6 bg-gray-900 rounded-[2rem] text-white flex items-start gap-5 relative overflow-hidden shadow-xl">
        <div className="bg-emerald-500 p-2.5 rounded-xl shrink-0">
          <Info size={20} className="text-gray-900" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Official Notice</h4>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Processing times may vary depending on document type. Please ensure
            your contact details are updated to receive real-time notifications
            via SMS or Email.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * SUB-COMPONENT: HISTORY CARD
 */
const HistoryCard = ({ req }) => {
  const status = req.status?.status_name || "Pending";
  const styles = getStatusStyles(status);
  const StatusIcon = styles.icon;

  // Checks both potential naming conventions for rejection reasons
  const reason = req.remarks || req.rejection_reason || req.reason;

  return (
    <div className="bg-white border border-gray-100 rounded-[1.5rem] p-5 hover:border-emerald-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* LEFT: DOCUMENT INFO */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${styles.bg} ${styles.text} ${styles.border}`}
          >
            <FileText size={24} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                REQ-{req.request_id}
              </span>
              <span className="text-gray-200">•</span>
              <span className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                <Calendar size={10} />
                {new Date(
                  req.request_date || req.created_at,
                ).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-black text-gray-900 text-base truncate group-hover:text-emerald-700 transition-colors">
              {req.document_type?.document_name}
            </h3>
            <p className="text-xs text-gray-500 font-medium truncate italic opacity-70">
              Purpose: {req.purpose || "Not stated"}
            </p>
          </div>
        </div>

        {/* RIGHT: STATUS & FEE */}
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
          <div className="text-left md:text-right">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
              Amount Due
            </p>
            <p className="text-lg font-black text-gray-900 leading-none mt-1">
              ₱
              {parseFloat(req.document_type?.fee || 0).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 },
              )}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border animate-in fade-in duration-500 ${styles.bg} ${styles.text} ${styles.border}`}
          >
            <StatusIcon
              size={14}
              strokeWidth={3}
              className={
                status.toLowerCase() === "ready for pickup"
                  ? "animate-pulse"
                  : ""
              }
            />
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              {status === "Ready for Pickup" ? "Pickup" : status}
            </span>
          </div>
        </div>
      </div>

      {/* REJECTION REASON / REMARKS BOX */}
      {reason && (
        <div
          className={`mt-5 p-4 rounded-2xl border-l-4 flex items-start gap-4 animate-in slide-in-from-top-3 duration-500 ${
            status.toLowerCase() === "rejected"
              ? "bg-red-50 border-red-500 text-red-800"
              : "bg-indigo-50 border-indigo-500 text-indigo-800"
          }`}
        >
          <div className="mt-0.5">
            {status.toLowerCase() === "rejected" ? (
              <XCircle size={18} />
            ) : (
              <Info size={18} />
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1 opacity-60">
              {status.toLowerCase() === "rejected"
                ? "Official Reason"
                : "Admin Remarks"}
            </p>
            <p className="text-sm font-bold leading-relaxed tracking-tight">
              {reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * HELPER: STATUS STYLING ENGINE
 */
const getStatusStyles = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "approved":
      return {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
        icon: CheckCircle2,
      };
    case "pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
        icon: Clock,
      };
    case "completed":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
        icon: CheckCircle2,
      };
    case "rejected":
      return {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-100",
        icon: XCircle,
      };
    case "ready for pickup":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-100",
        icon: PackageCheck,
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-500",
        border: "border-gray-100",
        icon: FileText,
      };
  }
};

export default ResidentHistory;
