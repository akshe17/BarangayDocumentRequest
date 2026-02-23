import React, { useState } from "react";
import {
  Search,
  ArrowLeft,
  Printer,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Clock,
  RefreshCw,
  ArrowUpRight,
  PackageCheck,
  CreditCard,
  Calendar,
  Hash,
} from "lucide-react";
import { useDocumentRequests } from "../../context/DocumentRequestContext";
import { useFillDocument } from "../../utils/UseFillDocument";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────────────────────── */
const STATUS_DONE = 3; // Done / Collected

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const isPaid = (r) => r?.payment_status === true || r?.payment_status === 1;

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

const Divider = () => <div className="h-px bg-gray-100 my-8" />;

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
    <p className="text-[10px] font-black tracking-[0.14em] uppercase text-gray-700">
      {children}
    </p>
  </div>
);

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3
      rounded-2xl text-sm font-bold shadow-xl
      ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
    >
      {toast.type === "error" ? (
        <AlertCircle size={14} />
      ) : (
        <CheckCircle size={14} />
      )}
      {toast.msg}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TABLE ROW
───────────────────────────────────────────────────────────── */
const CompletedTableRow = ({ req, onSelect, isLast }) => {
  const u = req.resident?.user;

  return (
    <tr
      className="transition-colors hover:bg-gray-50/70"
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

      {/* Fee */}
      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
        <p className="text-sm font-bold text-gray-900">
          ₱
          {req.document_type?.fee
            ? Number(req.document_type.fee).toFixed(2)
            : "0.00"}
        </p>
      </td>

      {/* Pickup date */}
      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-gray-400" />
          <span className="text-sm text-gray-600">{fmt(req.pickup_date)}</span>
        </div>
      </td>

      {/* Payment */}
      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
        <span
          className={`inline-flex items-center text-[10px] font-bold tracking-widest
          uppercase px-2.5 py-1 rounded-full border ${
            isPaid(req)
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          {isPaid(req) ? "Paid" : "Unpaid"}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 sm:px-6 py-4 text-right">
        <button
          onClick={() => onSelect(req)}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl
                     bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600
                     transition-colors"
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
const CompletedDetailView = ({ request, onBack }) => {
  const { fill, filling } = useFillDocument();
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resident = request.resident;
  const user = resident?.user;
  const doc = request.document_type;
  const fee = doc?.fee ?? 0;

  const handlePrint = async () => {
    try {
      await fill(request);
    } catch {
      notify("Failed to generate document.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} />

      {/* Top bar */}
      <div
        className="bg-white border-b border-gray-100 px-4 sm:px-8 h-14 flex items-center
                      justify-between sticky top-0 z-30"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-gray-400
                     hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span className="hidden sm:inline">Back to Completed</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-300 font-mono tracking-wider hidden sm:inline">
            REQ-{String(request.request_id).padStart(4, "0")}
          </span>
          <span
            className="inline-flex items-center text-[10px] font-bold tracking-widest
                           uppercase px-2.5 py-1 rounded-full border
                           bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Completed
          </span>
          {isPaid(request) && (
            <span
              className="inline-flex items-center text-[10px] font-bold tracking-widest
                             uppercase px-2.5 py-1 rounded-full border
                             bg-emerald-50 text-emerald-600 border-emerald-100"
            >
              ✓ Paid
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10
                      grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* LEFT — info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Resident card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
              <div
                className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100
                              flex items-center justify-center"
              >
                <User size={14} className="text-emerald-600" />
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

          {/* Request details card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
              <div
                className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100
                              flex items-center justify-center"
              >
                <FileText size={14} className="text-emerald-600" />
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
              <InfoBlock label="Pickup Date" value={fmt(request.pickup_date)} />
              <div>
                <Label>Payment</Label>
                <span
                  className={`inline-flex items-center text-[10px] font-black tracking-widest
                  uppercase px-2.5 py-1 rounded-full border ${
                    isPaid(request)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  {isPaid(request) ? "✓ Paid" : "Unpaid"}
                </span>
              </div>
              <InfoBlock
                label="Fee"
                value={fee ? `₱${Number(fee).toFixed(2)}` : "Free"}
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

          {/* Form data (if any) */}
          {request.form_data?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
                <div
                  className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100
                                flex items-center justify-center"
                >
                  <Hash size={14} className="text-emerald-600" />
                </div>
                <p className="text-sm font-black text-gray-900">Form Data</p>
              </div>
              <div className="px-4 sm:px-6 py-6 grid grid-cols-2 gap-4">
                {request.form_data.map((item) => (
                  <FieldBox
                    key={item.data_id}
                    label={item.field_definition?.field_label}
                    value={item.field_value}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — actions */}
        <div className="space-y-4">
          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 space-y-4">
            <div>
              <Label>Document</Label>
              <p className="text-base font-black text-gray-900">
                {doc?.document_name}
              </p>
            </div>
            <div>
              <Label>Total Fee</Label>
              <p className="text-2xl font-black text-gray-900">
                ₱{Number(fee).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div
                className={`w-2 h-2 rounded-full ${isPaid(request) ? "bg-emerald-500" : "bg-gray-300"}`}
              />
              <span className="text-xs font-bold text-gray-500">
                {isPaid(request) ? "Payment collected" : "No payment recorded"}
              </span>
            </div>
          </div>

          {/* Completed badge */}
          <div
            className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4
                          flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center
                            justify-center shrink-0"
            >
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-800">
                Document Released
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5">
                Collected on {fmt(request.pickup_date)}
              </p>
            </div>
          </div>

          {/* Print button */}
          {doc?.template_path ? (
            <button
              onClick={handlePrint}
              disabled={filling}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl
                         text-sm font-black transition-colors flex items-center justify-center gap-2
                         disabled:opacity-50"
            >
              {filling ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating PDF…
                </>
              ) : (
                <>
                  <Printer size={14} /> Reprint Document
                </>
              )}
            </button>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-xl py-5 px-4 text-center">
              <Printer size={18} className="text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-300">
                No template linked to this document type.
              </p>
            </div>
          )}

          {/* Info note */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Reprinting does not change the request status. This is for
              record-keeping or replacement copy purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN — COMPLETED REQUESTS
───────────────────────────────────────────────────────────── */
const CompletedRequests = () => {
  const { byStatus, loading, error, refresh, lastFetched } =
    useDocumentRequests();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("all"); // all | paid | unpaid

  if (selectedRequest) {
    return (
      <CompletedDetailView
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  // Cast status_id to Number to handle string "6" vs number 6
  const completed = (byStatus ? byStatus(STATUS_DONE) : []).filter
    ? byStatus(STATUS_DONE)
    : [];

  const filtered = completed
    .filter((req) => {
      if (filter === "paid") return isPaid(req);
      if (filter === "unpaid") return !isPaid(req);
      return true;
    })
    .filter((req) => {
      const u = req.resident?.user;
      const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.toLowerCase();
      return (
        name.includes(searchTerm.toLowerCase()) ||
        String(req.request_id).includes(searchTerm) ||
        (req.document_type?.document_name ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });

  const paidCount = completed.filter((r) => isPaid(r)).length;
  const unpaidCount = completed.filter((r) => !isPaid(r)).length;

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
                Completed Transactions
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {loading
                  ? "Loading…"
                  : `${filtered.length} completed request${filtered.length !== 1 ? "s" : ""}`}
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

          <div className="flex items-center gap-2 mb-4 flex-wrap"></div>

          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name, Request ID, or document type…"
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
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {[
                  { label: "Resident", cls: "" },
                  { label: "Document", cls: "hidden sm:table-cell" },
                  { label: "Fee", cls: "hidden md:table-cell" },
                  { label: "Pickup Date", cls: "hidden lg:table-cell" },
                  { label: "Payment", cls: "hidden sm:table-cell" },
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
                  <td colSpan="6" className="py-24 text-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-emerald-500 mx-auto mb-3"
                    />
                    <p className="text-xs text-gray-300">
                      Loading completed requests…
                    </p>
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
                      {filter !== "all"
                        ? `No ${filter} requests`
                        : "No completed requests yet"}
                    </p>
                    {filter === "all" && (
                      <p className="text-xs text-gray-300 mt-1">
                        Collected requests (status_id = 6) will appear here
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((req, i) => (
                  <CompletedTableRow
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

        {/* Summary footer */}
        {!loading && completed.length > 0 && (
          <div className="mt-4 flex items-center justify-between px-1 text-xs text-gray-400">
            <span>{completed.length} total completed</span>
            <span className="font-semibold text-emerald-600">
              ₱
              {completed
                .filter(isPaid)
                .reduce((sum, r) => sum + Number(r.document_type?.fee ?? 0), 0)
                .toFixed(2)}{" "}
              collected
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedRequests;
