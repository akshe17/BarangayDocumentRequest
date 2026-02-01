import React, { useState } from "react";
import {
  Search,
  FileText,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const ResidentHistory = () => {
  const [filter, setFilter] = useState("all");

  const historyData = [
    {
      id: "REQ-8821",
      type: "Barangay Clearance",
      date: "Feb 01, 2026",
      status: "Approved",
      fee: 50.0,
      purpose: "Job Requirement",
    },
    {
      id: "REQ-7742",
      type: "Certificate of Residency",
      date: "Jan 28, 2026",
      status: "Pending",
      fee: 75.0,
      purpose: "Bank Account Opening",
    },
    {
      id: "REQ-6610",
      type: "Certificate of Indigency",
      date: "Jan 15, 2026",
      status: "Completed",
      fee: 0.0,
      purpose: "Scholarship",
    },
    {
      id: "REQ-5501",
      type: "Business Permit",
      date: "Dec 12, 2025",
      status: "Rejected",
      fee: 150.0,
      purpose: "Incomplete Requirements",
    },
  ];

  const filteredData =
    filter === "all"
      ? historyData
      : historyData.filter(
          (item) => item.status.toLowerCase() === filter.toLowerCase(),
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

      {/* HISTORY CARDS */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-emerald-300 transition-all group shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* ICON & MAIN INFO */}
                <div className="flex items-center gap-5 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getStatusStyles(req.status).bg} ${getStatusStyles(req.status).text}`}
                  >
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {req.type}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} /> {req.date}
                      </span>
                      <span>ID: {req.id}</span>
                    </div>
                  </div>
                </div>

                {/* PURPOSE (SUBTLE ITALIC) */}
                <div className="hidden lg:block flex-1 border-l border-gray-100 pl-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Purpose
                  </p>
                  <p className="text-sm text-gray-600 font-medium truncate">
                    {req.purpose}
                  </p>
                </div>

                {/* FEE & STATUS */}
                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-gray-50 pt-4 lg:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Fee
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      ₱{req.fee.toFixed(2)}
                    </p>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusStyles(req.status).border} ${getStatusStyles(req.status).bg}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${getStatusStyles(req.status).bullet}`}
                    />
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${getStatusStyles(req.status).text}`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <button className="text-gray-300 group-hover:text-emerald-500 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-3xl">
            <Search size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-sm font-medium text-gray-400">
              No requests found in this category.
            </p>
          </div>
        )}
      </div>

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
  switch (status.toLowerCase()) {
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
