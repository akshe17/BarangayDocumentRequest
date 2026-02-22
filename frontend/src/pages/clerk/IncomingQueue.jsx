import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  CheckCircle,
  ArrowLeft,
  Printer,
  Loader2,
  User,
  MapPin,
  XCircle,
  Calendar,
  Clock,
  AlertCircle,
  Hash,
  Home,
  Heart,
  Download,
  Inbox,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import api from "../../axious/api";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const todayStr = () => new Date().toISOString().split("T")[0];

const openDoc = (p) =>
  window.open(
    `http://127.0.0.1:8000/storage/${p}`,
    "_blank",
    "noopener,noreferrer",
  );

const downloadDoc = (p, name) => {
  const a = document.createElement("a");
  a.href = `${window.location.origin}/storage/${p}`;
  a.download = name || p.split("/").pop();
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/* ─────────────────────────────────────────────────────────────
   STATUS
───────────────────────────────────────────────────────────── */
const STATUS = {
  1: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  2: { label: "Approved", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  3: {
    label: "Ready for Pickup",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  4: { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200" },
};

const StatusPill = ({ statusId }) => {
  const s = STATUS[statusId] ?? {
    label: "Unknown",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[9px] font-black tracking-[0.12em] uppercase text-gray-400 mb-1.5">
    {children}
  </p>
);

const FieldBox = ({ label, value }) => (
  <div>
    <Label>{label}</Label>
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 min-h-[44px] flex items-center">
      {value || (
        <span className="text-gray-300 italic font-normal text-xs">—</span>
      )}
    </div>
  </div>
);

const Divider = () => <div className="h-px bg-gray-100 my-10" />;

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2.5 mb-6">
    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
    <p className="text-[10px] font-black tracking-[0.14em] uppercase text-gray-700">
      {children}
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold shadow-lg
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
   REJECT MODAL
───────────────────────────────────────────────────────────── */
const RejectModal = ({ onConfirm, onCancel, busy }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <XCircle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-base">Reject Request</p>
            <p className="text-xs text-gray-400 mt-1">
              Resident will be notified of this decision.
            </p>
          </div>
        </div>
        <textarea
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm resize-none
                     focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none h-28 mb-5
                     placeholder:text-gray-300 font-medium text-gray-800"
          placeholder="State the reason clearly…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || busy}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold
                       hover:bg-red-600 transition-colors disabled:opacity-40
                       flex items-center justify-center gap-2"
          >
            {busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <XCircle size={14} />
            )}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DETAIL VIEW
───────────────────────────────────────────────────────────── */
const DetailView = ({ requestId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickupDate, setPickupDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api
      .get(`/clerk/requests/${requestId}`)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/clerk/requests/${requestId}/approve`, {
        pickup_date: pickupDate || null,
      });
      setData(res.data.request);
      notify(res.data.message);
    } catch {
      notify("Approval failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (reason) => {
    setBusy(true);
    try {
      const res = await api.post(`/clerk/requests/${requestId}/reject`, {
        reason,
      });
      setData(res.data.request);
      setShowReject(false);
      notify(res.data.message);
    } catch {
      notify("Rejection failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
        <p className="text-xs text-gray-400">Loading request…</p>
      </div>
    );
  if (!data) return null;

  const resi = data.resident;
  const user = resi?.user;
  const zone = user?.zone;
  const doc = data.document_type;
  const isPending = data.status_id === 1;
  const isApprovedOrReady = data.status_id === 2 || data.status_id === 3;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} />
      {showReject && (
        <RejectModal
          onConfirm={handleReject}
          onCancel={() => setShowReject(false)}
          busy={busy}
        />
      )}

      {/* Top bar */}
      <div className=" px-8 h-14 flex items-center justify-between ">
        <button
          onClick={onBack}
          className="flex items-center cursor-pointer gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Queue
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-600 font-mono tracking-wider">
            REQ-{String(data.request_id).padStart(4, "0")}
          </span>
          <StatusPill statusId={data.status_id} />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-0">
        {/* ── 1. Resident ── */}
        <section>
          {/* Name + avatar */}
          <div className="flex items-center gap-5 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xl select-none tracking-tight">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
              {resi?.is_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1.5 tracking-wide uppercase">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
          </div>

          {/* ── 5. Summary ── */}
          <div className="flex flex-col">
            <SectionTitle>Request Information</SectionTitle>
            <div className="grid grid-cols-3 gap-5 pt-2">
              {[
                [
                  "Request ID",
                  `REQ-${String(data.request_id).padStart(4, "0")}`,
                ],
                ["Document", doc?.document_name],
                ["Fee", doc?.fee ? `₱${Number(doc.fee).toFixed(2)}` : "Free"],
                ["Filed", fmt(data.request_date)],
                ["Status", STATUS[data.status_id]?.label ?? "—"],
                ["Pickup", fmt(data.pickup_date)],
              ].map(([k, v]) => (
                <div key={k}>
                  <Label>{k}</Label>
                  <p className="text-sm font-semibold text-gray-700">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <Divider />

          <SectionTitle>Personal Information</SectionTitle>
          <div className="grid grid-cols-3 gap-4">
            <FieldBox label="Zone / Purok" value={zone?.zone_name} />
            <FieldBox label="House No." value={resi?.house_no} />
            <FieldBox label="Gender" value={resi?.gender?.gender_name} />
            <FieldBox
              label="Civil Status"
              value={resi?.civil_status?.status_name}
            />
            <FieldBox label="Birthdate" value={fmt(resi?.birthdate)} />
            <FieldBox label="Date Filed" value={fmt(data.request_date)} />
          </div>
        </section>

        <Divider />

        {/* ── 2. Form answers ── */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <SectionTitle>{doc?.document_name ?? "Document"}</SectionTitle>
            {doc?.fee && (
              <span className="text-sm font-black text-emerald-600">
                ₱{Number(doc.fee).toFixed(2)}
              </span>
            )}
          </div>

          {data.form_data?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {data.form_data.map((item) => (
                <FieldBox
                  key={item.data_id}
                  label={item.field_definition?.field_label}
                  value={item.field_value}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-300 italic">
              No additional fields for this document type.
            </p>
          )}

          {data.purpose && (
            <div className="mt-4">
              <FieldBox label="Purpose / Reason" value={data.purpose} />
            </div>
          )}
        </section>

        <Divider />

        {/* ── 3. Clerk actions ── */}
        {isPending && (
          <section>
            <SectionTitle>Clerk Decision</SectionTitle>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black text-amber-700 tracking-widest uppercase mb-2">
                Pickup Date Behavior
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Leave blank</strong> — marks as{" "}
                <em>Ready for Pickup</em> immediately.
                <br />
                <strong>Select a date</strong> — sets to <em>Approved</em>,
                auto-switches on that date.
              </p>
            </div>

            {/* Date + approve row */}
            <div className="grid grid-cols-1 gap-3 mb-3">
              <div>
                <Label>Pickup Date (optional)</Label>
                <input
                  type="date"
                  min={todayStr()}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800
                             focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                  {pickupDate
                    ? `→ Approved · pickup ${fmt(pickupDate)}`
                    : "→ Ready for pickup today"}
                </p>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                             text-sm font-black transition-colors flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  {!pickupDate ? "Ready for Pickup" : "Approve & Schedule"}
                </button>
              </div>
            </div>

            {/* Reject */}
            <button
              onClick={() => setShowReject(true)}
              disabled={busy}
              className="w-full py-3 border border-red-100 bg-red-50 text-red-500 rounded-xl
                         text-sm font-bold hover:bg-red-100 transition-colors flex items-center
                         justify-center gap-2 disabled:opacity-40"
            >
              <XCircle size={14} /> Reject This Request
            </button>
          </section>
        )}

        {/* ── 4. Post-approval ── */}
        {isApprovedOrReady && (
          <>
            <section>
              <SectionTitle>Status & Document</SectionTitle>

              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-4">
                  <Label>Current Status</Label>
                  <StatusPill statusId={data.status_id} />
                </div>
                {data.pickup_date && (
                  <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-4">
                    <Label>Pickup Date</Label>
                    <p className="text-sm font-bold text-gray-800">
                      {fmt(data.pickup_date)}
                    </p>
                  </div>
                )}
              </div>

              {doc?.template_path ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-4">
                    <FileText size={18} className="text-emerald-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {doc.document_name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                        {doc.template_path}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openDoc(doc.template_path)}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                                 text-sm font-black transition-colors flex items-center justify-center gap-2"
                    >
                      <Printer size={14} /> Open & Print
                    </button>
                    <button
                      onClick={() =>
                        downloadDoc(doc.template_path, doc.document_name)
                      }
                      className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold
                                 text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Download size={14} /> Save
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-300 text-center">
                    Opens in new tab · Ctrl+P / ⌘+P to print
                  </p>
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-2xl py-8 text-center">
                  <p className="text-xs text-gray-300">
                    No template file linked to this document type.
                  </p>
                </div>
              )}
            </section>
            <Divider />
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   LIST VIEW
───────────────────────────────────────────────────────────── */
const IncomingQueue = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("");

  useEffect(() => {
    Promise.all([api.get("/clerk/requests/pending"), api.get("/zones")])
      .then(([rr, zr]) => {
        setRequests(rr.data);
        setZones(zr.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (selectedId) {
    return (
      <DetailView requestId={selectedId} onBack={() => setSelectedId(null)} />
    );
  }

  const filtered = requests.filter((req) => {
    const u = req.resident?.user;
    const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.toLowerCase();
    const matchZone = !selectedZone || u?.zone_id?.toString() === selectedZone;
    return name.includes(searchTerm.toLowerCase()) && matchZone;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className=" border-b border-gray-100 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Title row */}
          <div className="mb-5">
            <p className="text-[10px] font-black tracking-[0.14em] uppercase text-emerald-500 mb-1">
              Document Requests
            </p>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Incoming Queue
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {loading
                ? "Loading…"
                : `${filtered.length} pending ${filtered.length === 1 ? "request" : "requests"}`}
            </p>
          </div>

          {/* Search + filter — full width row, search 80%, filter 20% */}
          <div className="flex gap-3">
            {/* Search — 80% */}
            <div className="relative flex-[4]">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by resident name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl
                           text-sm text-gray-800 placeholder:text-gray-500 font-medium
                           focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
              />
            </div>

            {/* Zone filter — 20% */}
            <div className="relative flex-1">
              <MapPin
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10"
              />
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-400 rounded-xl
                           text-sm text-gray-700 font-medium appearance-none cursor-pointer
                           focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
              >
                <option value="">All Zones</option>
                {zones.map((z) => (
                  <option key={z.zone_id} value={z.zone_id}>
                    {z.zone_name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-6 py-3.5 text-left text-[9px] font-black tracking-[0.12em] uppercase text-gray-400">
                  Resident
                </th>
                <th className="px-6 py-3.5 text-left text-[9px] font-black tracking-[0.12em] uppercase text-gray-400">
                  Zone
                </th>
                <th className="px-6 py-3.5 text-left text-[9px] font-black tracking-[0.12em] uppercase text-gray-400">
                  Document
                </th>
                <th className="px-6 py-3.5 text-left text-[9px] font-black tracking-[0.12em] uppercase text-gray-400">
                  Filed
                </th>
                <th className="px-6 py-3.5 text-right text-[9px] font-black tracking-[0.12em] uppercase text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-emerald-500 mx-auto mb-3"
                    />
                    <p className="text-xs text-gray-300">Loading…</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <Inbox size={28} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">
                      No pending requests
                    </p>
                    <p className="text-xs text-gray-300 mt-1">All caught up!</p>
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const u = req.resident?.user;
                  return (
                    <tr
                      key={req.request_id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* Resident */}
                      <td className="px-6 py-4">
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

                      {/* Zone */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {u?.zone?.zone_name ?? "—"}
                        </span>
                      </td>

                      {/* Document */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {req.document_type?.document_name}
                        </p>
                        {req.document_type?.fee && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            ₱{Number(req.document_type.fee).toFixed(2)}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">
                          {fmt(req.request_date)}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedId(req.request_id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                                     bg-emerald-500 text-white text-xs font-black
                                     hover:bg-emerald-600 transition-colors"
                        >
                          View More <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomingQueue;
