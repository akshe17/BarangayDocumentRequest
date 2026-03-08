import React, { useState } from "react";
import {
  Search,
  PackageCheck,
  History,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useDocumentRequests } from "../../context/DocumentRequestContext";
import { STATUS_DONE, STATUS_READY } from "../../utils/PickupHelpers";
import ActionPage from "../../components/clerk/ActionPage";
import PickupTableRow from "../../components/clerk/PickupTableRow";
/* ─────────────────────────────────────────────────────────────
   PICKUP QUEUE — main list view
───────────────────────────────────────────────────────────── */
const PickupQueue = () => {
  const { byStatus, loading, error, refresh, lastFetched } =
    useDocumentRequests();
  const [activeTab, setActiveTab] = useState("ready");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  if (selectedRequest) {
    return (
      <ActionPage
        request={selectedRequest}
        tab={activeTab}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  const tabRequests = byStatus(
    activeTab === "ready" ? STATUS_READY : STATUS_DONE,
  );
  const filtered = tabRequests.filter((req) => {
    const u = req.resident?.user;
    const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      String(req.request_id).includes(searchTerm)
    );
  });

  const tabs = [
    {
      key: "ready",
      label: "Ready for Pickup",
      Icon: PackageCheck,
      status: STATUS_READY,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4 sm:mb-5 flex-wrap gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[0.14em] uppercase text-emerald-500 mb-1">
                Clerk Management
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Pickup Queue
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {loading
                  ? "Loading…"
                  : `${filtered.length} ${activeTab === "ready" ? "ready for pickup" : "collected"}`}
                {lastFetched && (
                  <span className="text-gray-300 ml-2 text-[10px]">
                    · synced {lastFetched.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={refresh}
                className="p-2 rounded-xl border border-gray-200 text-gray-400
                           hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>

              {/* Tab switcher */}
              <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                {tabs.map(({ key, label, Icon, status }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setSelectedRequest(null);
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-black
                      transition-all ${
                        activeTab === key
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-gray-500 hover:text-emerald-600"
                      }`}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{label}</span>
                    {byStatus(status).length > 0 && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          activeTab === key
                            ? "bg-white/30 text-white"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {byStatus(status).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by resident name or Request ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                         text-sm text-gray-800 placeholder:text-gray-300 font-medium
                         focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-4">
          <div
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 text-sm text-red-600"
          >
            <AlertCircle size={14} /> {error}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                {[
                  "Resident",
                  "Document",
                  "Fee",
                  "Pickup Date",
                  "Payment",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 sm:px-6 py-3.5 text-left text-[9px] font-black
                                tracking-[0.12em] uppercase text-gray-400 last:text-right
                                ${h === "Document" ? "hidden sm:table-cell" : ""}
                                ${h === "Fee" ? "hidden md:table-cell" : ""}
                                ${h === "Pickup Date" ? "hidden lg:table-cell" : ""}
                                ${h === "Payment" ? "hidden sm:table-cell" : ""}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-emerald-500 mx-auto mb-3"
                    />
                    <p className="text-xs text-gray-300">Loading requests…</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <PackageCheck
                      size={28}
                      className="text-gray-200 mx-auto mb-3"
                    />
                    <p className="text-sm font-bold text-gray-400">
                      {activeTab === "ready"
                        ? "No requests ready for pickup"
                        : "No collected requests yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((req, i) => (
                  <PickupTableRow
                    key={req.request_id}
                    req={req}
                    isLast={i === filtered.length - 1}
                    onSelect={setSelectedRequest}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PickupQueue;
