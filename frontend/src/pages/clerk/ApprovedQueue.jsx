import React, { useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowLeft,
  User,
  FileText,
  Clock,
  CheckCircle,
  CalendarDays,
  ChevronRight,
  ArrowUpRight,
  PackageCheck,
  CalendarCheck,
  RotateCcw,
} from "lucide-react";
import api from "../../axious/api";
import { useDocumentRequests } from "../../context/DocumentRequestContext";

/* ─────────────────────────────────────────────────────────────
   HELPERS
   status_id may arrive as string OR number from the API,
   so always cast with Number() before comparing.
───────────────────────────────────────────────────────────── */
const STATUS_APPROVED = 2;

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const today = () => new Date().toISOString().split("T")[0];

const isOverdue = (pickup_date) => {
  if (!pickup_date) return false;
  const d = new Date(pickup_date);
  d.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
};

const isToday = (pickup_date) => {
  if (!pickup_date) return false;
  return pickup_date.split("T")[0] === today();
};

/* ─────────────────────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[9px] font-black tracking-[0.12em] uppercase text-gray-400 mb-1">
    {children}
  </p>
);

const InfoBlock = ({ label, value }) => (
  <div>
    <Label>{label}</Label>
    <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
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

const PickupDateBadge = ({ date }) => {
  if (!date) return <span className="text-gray-400 text-sm">—</span>;
  const overdue = isOverdue(date);
  const todayFlg = isToday(date);
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Clock
        size={11}
        className={
          overdue
            ? "text-red-400"
            : todayFlg
              ? "text-amber-400"
              : "text-gray-400"
        }
      />
      <span
        className={`text-sm font-semibold ${overdue ? "text-red-600" : todayFlg ? "text-amber-600" : "text-gray-600"}`}
      >
        {fmt(date)}
      </span>
      {overdue && (
        <span
          className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5
                         bg-red-50 text-red-500 border border-red-200 rounded-full"
        >
          Overdue
        </span>
      )}
      {todayFlg && (
        <span
          className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5
                         bg-amber-50 text-amber-600 border border-amber-200 rounded-full"
        >
          Today
        </span>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TABLE ROW
───────────────────────────────────────────────────────────── */
const ApprovedTableRow = ({ req, onSelect, isLast }) => {
  const u = req.resident?.user;
  const overdue = isOverdue(req.pickup_date);

  return (
    <tr
      className="transition-colors hover:bg-gray-50/70"
      style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
    >
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${overdue ? "bg-red-500" : "bg-emerald-500"}`}
          >
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

      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
        <p className="text-sm font-semibold text-gray-800">
          {req.document_type?.document_name}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {u?.zone?.zone_name ?? "—"}
        </p>
      </td>

      <td className="px-4 sm:px-6 py-4">
        <PickupDateBadge date={req.pickup_date} />
      </td>

      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
        <span className="text-sm text-gray-500">{fmt(req.request_date)}</span>
      </td>

      <td className="px-4 sm:px-6 py-4 text-right">
        <button
          onClick={() => onSelect(req)}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl
                     bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition-colors"
        >
          Reschedule <ArrowUpRight size={12} />
        </button>
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────────────────────
   DETAIL PAGE
───────────────────────────────────────────────────────────── */
const ApprovedDetailPage = ({ request: initialReq, onBack }) => {
  const { updateRequest } = useDocumentRequests();
  const [request, setRequest] = useState(initialReq);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [customDate, setCustomDate] = useState(
    request.pickup_date?.split("T")[0] ?? today(),
  );
  const [mode, setMode] = useState(null); // null | "custom"

  const resident = request.resident;
  const user = resident?.user;
  const doc = request.document_type;

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const doReschedule = useCallback(
    async (date) => {
      setBusy(true);
      try {
        const res = await api.post(
          `/clerk/requests/${request.request_id}/reschedule`,
          { pickup_date: date },
        );
        const updated = res.data.request;
        setRequest(updated);
        updateRequest(updated);
        setCustomDate(date);
        setMode(null);
        notify(`Pickup date updated to ${fmt(date)}.`);
      } catch (err) {
        notify(
          err?.response?.data?.message ?? "Failed to update pickup date.",
          "error",
        );
      } finally {
        setBusy(false);
      }
    },
    [request.request_id, updateRequest],
  );

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
          <span className="hidden sm:inline">Back to Approved Queue</span>
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
            Approved
          </span>
          {isOverdue(request.pickup_date) && (
            <span
              className="inline-flex items-center text-[10px] font-bold tracking-widest
                             uppercase px-2.5 py-1 rounded-full border
                             bg-red-50 text-red-600 border-red-200"
            >
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10
                      grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {/* Resident */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <User size={14} className="text-emerald-600" />
              </div>
              <p className="text-sm font-black text-gray-900">Resident</p>
            </div>
            <div className="px-4 sm:px-6 py-6">
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-50">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
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
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <FileText size={14} className="text-emerald-600" />
              </div>
              <p className="text-sm font-black text-gray-900">
                Request Details
              </p>
            </div>
            <div className="px-4 sm:px-6 py-6 grid grid-cols-2 gap-5">
              <InfoBlock label="Document" value={doc?.document_name} />
              <InfoBlock label="Date Filed" value={fmt(request.request_date)} />
              <div>
                <Label>Current Pickup Date</Label>
                <PickupDateBadge date={request.pickup_date} />
              </div>
              <InfoBlock
                label="Fee"
                value={doc?.fee ? `₱${Number(doc.fee).toFixed(2)}` : "₱0.00"}
              />
              <div className="col-span-2">
                <Label>Purpose</Label>
                <p
                  className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100
                              rounded-xl px-4 py-3 italic"
                >
                  "{request.purpose || "Not specified"}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Current scheduled date */}
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5">
            <Label>Scheduled Pickup</Label>
            <p
              className={`text-2xl font-black mt-1 ${isOverdue(request.pickup_date) ? "text-red-600" : "text-gray-900"}`}
            >
              {fmt(request.pickup_date)}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              {isOverdue(request.pickup_date)
                ? "⚠ Past the scheduled date"
                : isToday(request.pickup_date)
                  ? "📅 Scheduled for today"
                  : "Resident has been notified via email"}
            </p>
          </div>

          {/* Set to Today */}
          <button
            onClick={() => doReschedule(today())}
            disabled={busy || isToday(request.pickup_date)}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                       text-sm font-black transition-colors flex items-center justify-center gap-2
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy && mode !== "custom" ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Updating…
              </>
            ) : (
              <>
                <CalendarCheck size={14} /> Set Pickup to Today
              </>
            )}
          </button>

          {/* Custom date — collapsible */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setMode(mode === "custom" ? null : "custom")}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays size={15} className="text-gray-400" />
                <span className="text-sm font-black text-gray-900">
                  Pick a Custom Date
                </span>
              </div>
              <ChevronRight
                size={14}
                className={`text-gray-300 transition-transform duration-200 ${mode === "custom" ? "rotate-90" : ""}`}
              />
            </button>

            {mode === "custom" && (
              <div className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-4">
                <div>
                  <Label>New Pickup Date</Label>
                  <input
                    type="date"
                    value={customDate}
                    min={today()}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                               font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-400
                               focus:border-emerald-400 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => doReschedule(customDate)}
                  disabled={busy || !customDate}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl
                             text-sm font-black transition-colors flex items-center justify-center gap-2
                             disabled:opacity-40"
                >
                  {busy && mode === "custom" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <RotateCcw size={13} /> Reschedule to{" "}
                      {customDate ? fmt(customDate) : "—"}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Info callout */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle
              size={13}
              className="text-emerald-500 shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              When the pickup date arrives, the system automatically moves this
              request to <strong>Ready for Pickup</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN — APPROVED QUEUE
───────────────────────────────────────────────────────────── */
const ApprovedQueue = () => {
  const { allRequests, byStatus, loading, error, refresh, lastFetched } =
    useDocumentRequests();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("all");

  if (selectedRequest) {
    return (
      <ApprovedDetailPage
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  // ── Get approved requests ─────────────────────────────────────
  // Try byStatus first (uses context filter), fall back to manual
  // filter on allRequests. Cast status_id to Number to handle
  // string "2" vs number 2 from the API.
  const approved = (() => {
    if (typeof byStatus === "function") {
      const via = byStatus(STATUS_APPROVED);
      if (via?.length > 0) return via;
    }
    return (allRequests ?? []).filter(
      (r) => Number(r.status_id) === STATUS_APPROVED,
    );
  })();

  const filtered = approved
    .filter((req) => {
      if (filter === "overdue") return isOverdue(req.pickup_date);
      if (filter === "today") return isToday(req.pickup_date);
      return true;
    })
    .filter((req) => {
      const u = req.resident?.user;
      const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.toLowerCase();
      return (
        name.includes(searchTerm.toLowerCase()) ||
        String(req.request_id).includes(searchTerm)
      );
    });

  const overdueCount = approved.filter((r) => isOverdue(r.pickup_date)).length;
  const todayCount = approved.filter((r) => isToday(r.pickup_date)).length;

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
                Approved Queue
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {loading
                  ? "Loading…"
                  : `${filtered.length} approved request${filtered.length !== 1 ? "s" : ""}`}
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

          {/* Filter chips */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              {
                key: "all",
                label: "All",
                count: approved.length,
                active: "bg-emerald-500 text-white border-emerald-500",
              },
              {
                key: "overdue",
                label: "Overdue",
                count: overdueCount,
                active: "bg-red-500 text-white border-red-500",
              },
              {
                key: "today",
                label: "Today",
                count: todayCount,
                active: "bg-amber-500 text-white border-amber-500",
              },
            ].map(({ key, label, count, active }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold
                  border transition-all ${
                    filter === key
                      ? active
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
              >
                {label}
                {count > 0 && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      filter === key
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
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
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle size={14} /> {error}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {[
                  { label: "Resident", cls: "" },
                  { label: "Document", cls: "hidden sm:table-cell" },
                  { label: "Pickup Date", cls: "" },
                  { label: "Filed", cls: "hidden lg:table-cell" },
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
                    <p className="text-xs text-gray-300">Loading requests…</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <PackageCheck
                      size={28}
                      className="text-gray-200 mx-auto mb-3"
                    />
                    <p className="text-sm font-bold text-gray-400">
                      {filter !== "all"
                        ? `No ${filter} requests`
                        : "No approved requests"}
                    </p>
                    {filter === "all" && (
                      <p className="text-xs text-gray-300 mt-1">
                        Requests with status_id = 2 will appear here
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((req, i) => (
                  <ApprovedTableRow
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

export default ApprovedQueue;
