import React, { useState } from "react";
import {
  Search,
  ArrowLeft,
  Loader2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  User,
  FileText,
  Hash,
} from "lucide-react";
import { useDocumentRequests } from "../../context/DocumentRequestContext";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const STATUS_REJECTED = 4;

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

/* ─────────────────────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[9px] font-black tracking-[0.12em] uppercase text-gray-400 mb-1.5">
    {children}
  </p>
);

const InfoBlock = ({ label, value, mono }) => (
  <div>
    <Label>{label}</Label>
    <p
      className={`text-sm font-semibold text-gray-800 ${mono ? "font-mono" : ""}`}
    >
      {value || "—"}
    </p>
  </div>
);

const FieldBox = ({ label, value }) => (
  <div>
    <Label>{label}</Label>
    <div
      className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm
                    font-medium text-gray-800 min-h-[44px] flex items-center"
    >
      {value || (
        <span className="text-gray-300 italic font-normal text-xs">—</span>
      )}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
    <p className="text-[10px] font-black tracking-[0.14em] uppercase text-gray-700">
      {children}
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   TABLE ROW
───────────────────────────────────────────────────────────── */
const RejectedTableRow = ({ req, onSelect, isLast }) => {
  const u = req.resident?.user;

  return (
    <tr
      className="transition-colors hover:bg-emerald-50/30"
      style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
    >
      {/* Resident */}
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black select-none">
              {u?.first_name?.[0]}
              {u?.last_name?.[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {u?.first_name} {u?.last_name}
            </p>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
              REQ-{String(req.request_id).padStart(4, "0")}
            </p>
          </div>
        </div>
      </td>

      {/* Document */}
      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
        <p className="text-sm font-semibold text-gray-800">
          {req.document_type?.document_name}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {u?.zone?.zone_name ?? "—"}
        </p>
      </td>

      {/* Date filed */}
      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
        <p className="text-sm text-gray-500">{fmt(req.request_date)}</p>
      </td>

      {/* Rejection reason preview */}
      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell max-w-[220px]">
        {req.rejection_reason ? (
          <p className="text-xs text-red-500 font-medium truncate">
            {req.rejection_reason}
          </p>
        ) : (
          <span className="text-xs text-gray-300 italic">
            No reason provided
          </span>
        )}
      </td>

      {/* Action */}
      <td className="px-4 sm:px-6 py-4 text-right">
        <button
          onClick={() => onSelect(req)}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl
                     bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600
                     transition-colors shadow-sm shadow-emerald-200"
        >
          View <ArrowUpRight size={12} />
        </button>
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────────────────────
   DETAIL VIEW
───────────────────────────────────────────────────────────── */
const RejectedDetailView = ({ request, onBack }) => {
  const resident = request.resident;
  const user = resident?.user;
  const doc = request.document_type;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div
        className="bg-white border-b border-gray-100 px-4 sm:px-8 h-14 flex items-center
                      justify-between sticky top-0 z-30"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-gray-400
                      hover:text-emerald-600 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span className="hidden sm:inline">Back to Rejected</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-300 font-mono tracking-wider hidden sm:inline">
            REQ-{String(request.request_id).padStart(4, "0")}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest
                            uppercase px-2.5 py-1 rounded-full border
                            bg-red-50 text-red-600 border-red-200"
          >
            <XCircle size={10} /> Rejected
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10
                      grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {/* Rejection reason */}
          <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm shadow-red-50">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-red-50 bg-red-50/30">
              <div
                className="w-8 h-8 rounded-xl bg-red-100 border border-red-200
                               flex items-center justify-center"
              >
                <XCircle size={14} className="text-red-500" />
              </div>
              <p className="text-sm font-black text-red-700">
                Rejection Reason
              </p>
            </div>
            <div className="px-4 sm:px-6 py-5">
              {request.rejection_reason ? (
                <p className="text-sm text-red-700 leading-relaxed font-medium">
                  {request.rejection_reason}
                </p>
              ) : (
                <p className="text-sm text-red-300 italic">
                  No reason was recorded.
                </p>
              )}
            </div>
          </div>

          {/* Resident card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
              <div
                className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100
                               flex items-center justify-center"
              >
                <User size={14} className="text-emerald-500" />
              </div>
              <p className="text-sm font-black text-gray-900">Resident</p>
            </div>
            <div className="px-4 sm:px-6 py-6">
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-50">
                <div
                  className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center
                                 justify-center shrink-0"
                >
                  <span className="text-white font-black text-lg select-none">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-base font-black text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Zone" value={user?.zone?.zone_name} />
                <InfoBlock label="House No." value={resident?.house_no} />
                <InfoBlock
                  label="Civil Status"
                  value={resident?.civil_status?.status_name}
                />
                <InfoBlock label="Birthdate" value={fmt(resident?.birthdate)} />
              </div>
            </div>
          </div>

          {/* Request details */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
              <div
                className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100
                               flex items-center justify-center"
              >
                <FileText size={14} className="text-emerald-500" />
              </div>
              <p className="text-sm font-black text-gray-900">
                Request Details
              </p>
            </div>
            <div className="px-4 sm:px-6 py-6 grid grid-cols-2 gap-5">
              <InfoBlock label="Document" value={doc?.document_name} />
              <InfoBlock
                label="Request ID"
                value={`REQ-${String(request.request_id).padStart(4, "0")}`}
                mono
              />
              <InfoBlock label="Date Filed" value={fmt(request.request_date)} />
              <InfoBlock
                label="Fee"
                value={doc?.fee ? `₱${Number(doc.fee).toFixed(2)}` : "Free"}
              />
              {request.purpose && (
                <div className="col-span-2">
                  <Label>Purpose</Label>
                  <p
                    className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100
                                rounded-xl px-4 py-3 italic"
                  >
                    "{request.purpose}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 space-y-4">
            <div>
              <Label>Document Requested</Label>
              <p className="text-base font-black text-gray-900">
                {doc?.document_name}
              </p>
            </div>
            <div>
              <Label>Date Filed</Label>
              <p className="text-sm font-semibold text-gray-700">
                {fmt(request.request_date)}
              </p>
            </div>
            <div>
              <Label>Fee</Label>
              <p className="text-sm font-semibold text-gray-700">
                {doc?.fee ? `₱${Number(doc.fee).toFixed(2)}` : "Free"}
              </p>
            </div>
          </div>

          {/* Rejected status card */}
          <div
            className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4
                         flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-xl bg-red-500 flex items-center
                             justify-center shrink-0"
            >
              <XCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-red-800">
                Request Rejected
              </p>
              <p className="text-[10px] text-red-500 mt-0.5">
                Resident has been notified via email.
              </p>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle
              size={13}
              className="text-emerald-500 shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Rejected requests are for record-keeping only. The resident may
              file a new request after resolving the issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN — REJECTED REQUESTS
───────────────────────────────────────────────────────────── */
const RejectedRequests = () => {
  const { byStatus, loading, error, refresh, lastFetched } =
    useDocumentRequests();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  if (selectedRequest) {
    return (
      <RejectedDetailView
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  const rejected = byStatus(STATUS_REJECTED);

  const filtered = rejected.filter((req) => {
    const u = req.resident?.user;
    const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      String(req.request_id).includes(searchTerm) ||
      (req.document_type?.document_name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (req.rejection_reason ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[0.14em] uppercase text-emerald-500 mb-1">
                Clerk Management
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Rejected Requests
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {loading
                  ? "Loading…"
                  : `${filtered.length} rejected request${filtered.length !== 1 ? "s" : ""}`}
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
                         hover:text-emerald-500 hover:border-emerald-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name, Request ID, document, or rejection reason…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                         text-sm text-gray-800 placeholder:text-gray-300 font-medium
                         focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 outline-none"
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
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {[
                  { label: "Resident", cls: "" },
                  { label: "Document", cls: "hidden sm:table-cell" },
                  { label: "Date Filed", cls: "hidden md:table-cell" },
                  { label: "Rejection Reason", cls: "hidden lg:table-cell" },
                  { label: "", cls: "" },
                ].map(({ label, cls }) => (
                  <th
                    key={label}
                    className={`px-4 sm:px-6 py-3.5 text-left text-[9px] font-black
                                tracking-[0.12em] uppercase text-gray-400 last:text-right ${cls}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-emerald-500 mx-auto mb-3"
                    />
                    <p className="text-xs text-gray-300">
                      Loading rejected requests…
                    </p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <XCircle size={28} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">
                      {searchTerm
                        ? "No results match your search"
                        : "No rejected requests"}
                    </p>
                    {!searchTerm && (
                      <p className="text-xs text-gray-300 mt-1">
                        Requests with status_id = 4 will appear here
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((req, i) => (
                  <RejectedTableRow
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

        {!loading && rejected.length > 0 && (
          <div className="mt-4 px-1">
            <p className="text-xs text-gray-400">
              {rejected.length} total rejected
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RejectedRequests;
