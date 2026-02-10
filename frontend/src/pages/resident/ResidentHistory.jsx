import React, { useState, useEffect } from "react";
import api from "../../axious/api";
import {
  Search,
  FileText,
  Calendar,
  ChevronRight,
  AlertCircle,
  Loader2,
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
      const response = await api.get("/request-document/history");
      console.log("API Response:", response.data);
      setHistoryData(response.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load request history.");
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
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            My History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track the status of your document requests.
          </p>
        </div>

        {/* REFINED TAB FILTER */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          {["All", "Pending", "Approved", "Completed", "Rejected"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.toLowerCase()
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="text-center py-20">
          <Loader2
            className="animate-spin mx-auto mb-4 text-emerald-600"
            size={40}
          />
          <p className="text-sm text-gray-500 font-medium">
            Loading your request history...
          </p>
        </div>
      ) : error ? (
        /* ERROR STATE */
        <div className="py-20 text-center bg-red-50 border border-red-200 rounded-3xl">
          <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button
            onClick={fetchRequestHistory}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        /* HISTORY CARDS */
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((req) => {
              const items = req.items || [];
              const itemCount = items.length;

              // Calculate total fee from items
              const totalFee = items.reduce(
                (acc, item) =>
                  acc +
                  parseFloat(item.document?.fee || 0) * (item.quantity || 1),
                0,
              );

              return (
                <div
                  key={req.request_id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-emerald-300 transition-all group shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* ICON & MAIN INFO */}
                    <div className="flex items-center gap-5 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getStatusStyles(req.status?.status_name).bg} ${getStatusStyles(req.status?.status_name).text}`}
                      >
                        <FileText size={24} />
                      </div>
                      <div className="flex-1">
                        {/* Request ID and Date */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Request #{req.request_id}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Calendar size={12} />
                            {new Date(req.request_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>

                        {/* Document List */}
                        <div className="space-y-1">
                          {itemCount === 0 ? (
                            <p className="text-sm text-gray-400 italic">
                              No documents
                            </p>
                          ) : (
                            items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="font-semibold text-gray-900">
                                  {item.document?.document_name ||
                                    "Unknown Document"}
                                </span>
                                {item.quantity > 1 && (
                                  <span className="text-xs text-gray-400 font-medium">
                                    (x{item.quantity})
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Document count badge */}
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                            <FileText size={10} />
                            {itemCount}{" "}
                            {itemCount === 1 ? "Document" : "Documents"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PURPOSE */}
                    <div className="hidden lg:block flex-1 border-l border-gray-100 pl-6">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Purpose
                      </p>
                      <p className="text-sm text-gray-600 font-medium line-clamp-2">
                        {req.purpose || "Not specified"}
                      </p>
                    </div>

                    {/* FEE & STATUS */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-gray-50 pt-4 lg:pt-0">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Total Fee
                        </p>
                        <p className="text-lg font-black text-gray-900">
                          ₱{totalFee.toFixed(2)}
                        </p>
                      </div>

                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusStyles(req.status?.status_name).border} ${getStatusStyles(req.status?.status_name).bg}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${getStatusStyles(req.status?.status_name).bullet}`}
                        />
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${getStatusStyles(req.status?.status_name).text}`}
                        >
                          {req.status?.status_name || "Unknown"}
                        </span>
                      </div>

                      <button className="text-gray-300 group-hover:text-emerald-500 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-3xl">
              <Search size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-sm font-medium text-gray-400">
                No requests found in this category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER NOTE */}
      <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-4">
        <AlertCircle className="text-gray-400 shrink-0" size={20} />
        <p className="text-xs text-gray-500 leading-relaxed font-medium">
          Payments are handled at the Barangay Hall. Please bring a valid ID
          when claiming your{" "}
          <span className="text-emerald-600 font-semibold italic">
            Approved
          </span>{" "}
          documents.
        </p>
      </div>
    </div>
  );
};

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
        bullet: "bg-emerald-500",
      };
    case "pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
        bullet: "bg-amber-500",
      };
    case "completed":
      return {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
        bullet: "bg-blue-500",
      };
    case "rejected":
      return {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-100",
        bullet: "bg-red-500",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-500",
        border: "border-gray-100",
        bullet: "bg-gray-400",
      };
  }
};

export default ResidentHistory;
