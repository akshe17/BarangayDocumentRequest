import React, { useState } from "react";
import { Search, AlertCircle, RefreshCw } from "lucide-react";

import {
  ZoneClearanceProvider,
  useZoneClearance,
} from "../../context/ZoneClearanceContext";

import DetailView from "../../components/zoneleader/DetailView";
import { StatusSection } from "../../components/zoneleader/ClearanceTable";
import { TABS } from "../../components/zoneleader/ClearanceConstraints";

/* ─────────────────────────────────────────────────────────────
   INNER COMPONENT — consumes ZoneClearanceContext
───────────────────────────────────────────────────────────── */
const QueueInner = () => {
  const { byStatus, loading, error, refresh, lastFetched } = useZoneClearance();

  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  if (selectedId) {
    return (
      <DetailView requestId={selectedId} onBack={() => setSelectedId(null)} />
    );
  }

  const visibleRequests = byStatus(activeTab).filter((req) => {
    if (!searchTerm) return true;
    const u = req.resident?.user;
    const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const activeTabCfg = TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="border-b border-gray-100 px-4 sm:px-8 py-6 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Title + refresh */}
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[0.14em] uppercase text-emerald-500 mb-1">
                Clearance Requests
              </p>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Request Queue
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {loading
                  ? "Loading…"
                  : `${visibleRequests.length} ${activeTabCfg?.label.toLowerCase()} ${
                      visibleRequests.length === 1 ? "request" : "requests"
                    }`}
                {lastFetched && (
                  <span className="text-gray-300 ml-2 text-[10px]">
                    · synced {lastFetched.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={refresh}
              className="p-2 rounded-xl border border-gray-200 text-gray-400
                         hover:text-emerald-600 hover:border-emerald-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by resident name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl
                         text-sm text-gray-800 placeholder:text-gray-400 font-medium
                         focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 border-b border-gray-100 -mb-px overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = byStatus(tab.id).length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm("");
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-black tracking-wide
                              border-b-2 transition-colors whitespace-nowrap shrink-0
                              ${isActive ? tab.active : tab.inactive}`}
                >
                  <Icon size={13} />
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px]
                                  rounded-full text-[10px] font-black text-white px-1
                                  ${isActive ? tab.dot : "bg-gray-200 !text-gray-500"}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-4">
          <div
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 text-sm text-red-600"
          >
            <AlertCircle size={14} /> {error}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <StatusSection
          tab={activeTabCfg}
          requests={visibleRequests}
          loading={loading}
          onView={setSelectedId}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   OUTER WRAPPER — provides the dedicated clearance context
   so this page never touches the clerk's DocumentRequestContext
───────────────────────────────────────────────────────────── */
const ZoneClearanceQueue = () => (
  <ZoneClearanceProvider>
    <QueueInner />
  </ZoneClearanceProvider>
);

export default ZoneClearanceQueue;
