import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  RefreshCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertCircle,
  UserCheck,
  Calendar,
  MapPin,
  Home,
  User,
  Users,
  Image as ImageIcon,
  Loader2,
  Clock,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

import api from "../../axious/api";
import Toast from "../../components/toast";
import { SkeletonTable } from "../../components/Skeleton";
import { useZoneResidents } from "../../context/ZoneResidentContext";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmtDate = (raw) => {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return raw;
  }
};

const getFullName = (resident) => {
  const parts = [
    resident.first_name ?? resident.firstName,
    resident.middle_name ?? resident.middleName,
    resident.last_name ?? resident.lastName,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : (resident.name ?? "—");
};

const getInitials = (resident) => {
  const first = (resident.first_name ?? resident.firstName ?? "")[0] ?? "";
  const last = (resident.last_name ?? resident.lastName ?? "")[0] ?? "";
  return (
    (first + last).toUpperCase() || (resident.name?.[0] ?? "?").toUpperCase()
  );
};

/* ─────────────────────────────────────────────────────────────
   REJECTION SUGGESTIONS
───────────────────────────────────────────────────────────── */
const REJECTION_SUGGESTIONS = [
  "The ID image is blurry or unclear. Please resubmit a clearer photo.",
  "The ID document appears to be expired. Please provide a valid, current ID.",
  "The name on the ID does not match the registered account name.",
  "The ID is partially obscured or cropped. Please submit the full document.",
  "The uploaded file is not a valid government-issued ID.",
  "The ID photo and the person's face are not clearly visible.",
  "The document shows signs of tampering or alteration.",
];

/* ─────────────────────────────────────────────────────────────
   INFO ROW
───────────────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={12} className="text-slate-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-700 break-words">
        {value || "—"}
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   ID VIEWER
───────────────────────────────────────────────────────────── */
const IdViewer = ({ url }) => {
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 flex items-center gap-1.5">
          <ImageIcon size={11} /> Valid ID Document
        </p>
        <div className="flex gap-1">
          {[
            {
              label: "−",
              action: () => setZoom((z) => Math.max(z - 0.25, 0.5)),
              title: "Zoom out",
            },
            {
              label: "+",
              action: () => setZoom((z) => Math.min(z + 0.25, 3)),
              title: "Zoom in",
            },
            {
              label: "↺",
              action: () => setRotate((r) => (r + 90) % 360),
              title: "Rotate 90°",
            },
          ].map(({ label, action, title }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-sm font-black text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md transition-all shadow-sm cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex-1 bg-[#f0f2f5] rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center"
        style={{ minHeight: "200px" }}
      >
        {url ? (
          <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
            <img
              src={url}
              alt="Resident ID"
              style={{
                transform: `scale(${zoom}) rotate(${rotate}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x400?text=Image+Not+Found";
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400 select-none">
            <ImageIcon size={44} className="opacity-30" />
            <p className="text-xs font-black uppercase tracking-widest opacity-50">
              No ID Uploaded
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
        {Math.round(zoom * 100)}% · {rotate}°
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DETAIL PAGE
───────────────────────────────────────────────────────────── */
const DetailPage = ({ resident, onBack, onUpdate, showToast }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const fullName = getFullName(resident);
  const initials = getInitials(resident);

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await api.post(`/zone-leader/residents/${resident.id}/verify`);
      onUpdate(resident.id, { status: "Verified", rejectionReason: null });
      showToast("Resident verified successfully.", "success");
      setTimeout(onBack, 1000);
    } catch {
      showToast("Failed to verify resident.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      showToast("Please provide a rejection reason.", "warning");
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/zone-leader/residents/${resident.id}/reject`, {
        rejection_reason: reason,
      });
      onUpdate(resident.id, { status: "Rejected", rejectionReason: reason });
      showToast("Resident rejected and notified.", "success");
      setTimeout(onBack, 1000);
    } catch {
      showToast("Failed to reject resident.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Top bar */}
      <div className="bg-white/90 backdrop-blur border-b border-slate-100 h-14 px-5 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button
          onClick={onBack}
          disabled={actionLoading}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors group disabled:opacity-40 cursor-pointer"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Pending
        </button>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-slate-300 font-mono hidden sm:block">
            ID-{String(resident.id).padStart(5, "0")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
            <Clock size={11} /> Pending
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-6 items-start">
        {/* LEFT — ID sticky */}
        <div
          className="md:sticky md:top-14 md:w-[400px] w-full shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col"
          style={{ height: "calc(100vh - 56px - 4rem)" }}
        >
          <IdViewer url={resident.idUrl} />
        </div>

        {/* RIGHT — Info + actions scrollable */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200">
                <UserCheck size={14} className="text-white" />
              </div>
              <p className="text-sm font-black text-slate-900">
                Resident Details
              </p>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Avatar + full name breakdown */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 select-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                    boxShadow: "0 8px 20px -4px rgba(16,185,129,0.35)",
                  }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black text-slate-900 leading-tight">
                    {fullName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {resident.email}
                  </p>
                </div>
              </div>

              {/* Name breakdown */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                {[
                  {
                    label: "First Name",
                    value: resident.first_name ?? resident.firstName,
                  },
                  {
                    label: "Middle Name",
                    value: resident.middle_name ?? resident.middleName,
                  },
                  {
                    label: "Last Name",
                    value: resident.last_name ?? resident.lastName,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-white border border-slate-100 rounded-lg px-3 py-2.5"
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                      {label}
                    </p>
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Registered */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                  <Calendar size={12} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                    Registered
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {resident.date}
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="rounded-xl border border-slate-100 overflow-hidden px-4">
                <InfoRow icon={MapPin} label="Zone" value={resident.zone} />
                <InfoRow
                  icon={Home}
                  label="House No."
                  value={resident.houseNo}
                />
                <InfoRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={fmtDate(resident.birthdate)}
                />
                <InfoRow icon={User} label="Gender" value={resident.gender} />
                <InfoRow
                  icon={Users}
                  label="Civil Status"
                  value={resident.civilStatus}
                />
              </div>
            </div>
          </div>

          {/* Action card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 bg-slate-50/50">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isRejecting ? "bg-red-50 border border-red-100" : "bg-emerald-50 border border-emerald-100"}`}
              >
                <FileCheck
                  size={14}
                  className={isRejecting ? "text-red-500" : "text-emerald-600"}
                />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  {isRejecting
                    ? "Provide Rejection Reason"
                    : "Verification Action"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isRejecting
                    ? "This message will be sent to the resident."
                    : "Review the ID document carefully before acting."}
                </p>
              </div>
            </div>

            <div className="px-5 py-5">
              {isRejecting ? (
                <div className="space-y-4">
                  {/* Warning */}
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                    <AlertCircle
                      size={13}
                      className="text-red-400 shrink-0 mt-0.5"
                    />
                    <p className="text-[11px] text-red-600 leading-relaxed font-medium">
                      Describe clearly why the ID is being rejected so the
                      resident can resubmit.
                    </p>
                  </div>

                  {/* Textarea + chip suggestions */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">
                      Rejection Reason <span className="text-red-400">*</span>
                    </p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={actionLoading}
                      rows={4}
                      placeholder="Type a reason or pick a suggestion below…"
                      className="w-full p-4 bg-red-50 border-2 border-red-100 rounded-xl text-sm
                                 focus:border-red-400 outline-none resize-none transition-all
                                 placeholder:text-red-300 text-red-800 font-medium
                                 disabled:opacity-60 leading-relaxed"
                    />
                    {/* Suggestion chips — 3 shown, chat-style */}
                    <div className="flex flex-wrap flex-col gap-1.5 mt-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        Suggestions <span className="text-red-400">*</span>
                      </p>
                      {REJECTION_SUGGESTIONS.slice(0, 3).map(
                        (suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => setReason(suggestion)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-semibold
                            transition-all cursor-pointer whitespace-nowrap
                            bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50
                            disabled:opacity-40"
                          >
                            <Sparkles
                              size={9}
                              className="shrink-0 opacity-50"
                            />
                            {suggestion.length > 36
                              ? suggestion.slice(0, 36) + "…"
                              : suggestion}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => {
                        setIsRejecting(false);
                        setReason("");
                      }}
                      disabled={actionLoading}
                      className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="flex-[2] py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl
                                 text-sm font-black shadow-lg shadow-red-100 transition-all
                                 flex items-center justify-center gap-2 disabled:opacity-50
                                 active:scale-[0.98] cursor-pointer"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />{" "}
                          Rejecting…
                        </>
                      ) : (
                        "Confirm Rejection"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-sm text-slate-500 leading-relaxed font-medium mb-3">
                    Confirm the name on the ID matches the registered account.
                    Ensure the ID is current, unobstructed, and clearly
                    readable.
                  </p>
                  <button
                    onClick={handleVerify}
                    disabled={actionLoading}
                    className="w-full py-3.5 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                      boxShadow: "0 6px 16px -2px rgba(16,185,129,0.4)",
                    }}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />{" "}
                        Approving…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} /> Approve Verification
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsRejecting(true)}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-white border-2 border-slate-100 text-red-500
                               hover:bg-red-50 hover:border-red-200 rounded-xl font-black text-sm
                               transition-all flex items-center justify-center gap-2
                               disabled:opacity-40 cursor-pointer"
                  >
                    <XCircle size={15} /> Reject Document
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex gap-3 items-start">
            <AlertCircle
              size={14}
              className="text-emerald-500 shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Use the <strong>+ − ↺</strong> controls to zoom and inspect the ID
              before approving or rejecting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN — PENDING LIST
───────────────────────────────────────────────────────────── */
const PendingResidents = () => {
  const { residents, isLoading, error, lastFetched, refresh, updateResident } =
    useZoneResidents();

  const [searchTerm, setSearchTerm] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const handleUpdate = useCallback(
    (id, patch) => {
      updateResident(id, patch);
      setReviewing((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
    },
    [updateResident],
  );

  const pending = useMemo(
    () =>
      residents
        .filter((r) => r.status === "Pending")
        .filter((r) => {
          const q = searchTerm.toLowerCase();
          const fullName = getFullName(r).toLowerCase();
          return (
            fullName.includes(q) || (r.email ?? "").toLowerCase().includes(q)
          );
        }),
    [residents, searchTerm],
  );

  if (reviewing) {
    return (
      <>
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((p) => ({ ...p, show: false }))}
        />
        <DetailPage
          resident={reviewing}
          onBack={() => setReviewing(null)}
          onUpdate={handleUpdate}
          showToast={showToast}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.14em] uppercase text-emerald-500 mb-1">
              Zone Leader
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Pending <span className="text-emerald-500">Residents</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {isLoading
                ? "Loading…"
                : `${pending.length} resident${pending.length !== 1 ? "s" : ""} awaiting verification`}
              {lastFetched && !isLoading && (
                <span className="text-slate-500 ml-2 text-[10px]">
                  · synced {lastFetched.toLocaleTimeString()}
                </span>
              )}
            </p>
            {error && (
              <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            title="Refresh"
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-500 transition-all text-slate-500 shadow-sm disabled:opacity-50 self-start md:self-auto cursor-pointer"
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-100 rounded-xl
                         focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 focus:bg-white
                         outline-none transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={6} cols={5} />
            </div>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center py-28 gap-3">
              <BadgeCheck size={40} className="text-slate-200" />
              <p className="font-black text-slate-400 text-sm">
                No pending residents
              </p>
              <p className="text-slate-300 text-xs">
                All residents have been reviewed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      "Resident",
                      "Full Name",
                      "Email",
                      "Registered",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 last:text-center"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pending.map((r) => {
                    const fullName = getFullName(r);
                    const initials = getInitials(r);
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Avatar */}
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0 select-none">
                            {initials}
                          </div>
                        </td>

                        {/* Full name breakdown */}
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-900 text-sm leading-tight">
                            {fullName}
                          </p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {[
                              r.first_name ?? r.firstName,
                              r.middle_name ?? r.middleName,
                              r.last_name ?? r.lastName,
                            ]
                              .filter(Boolean)
                              .map((part, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] text-slate-400 font-medium"
                                >
                                  {part}
                                </span>
                              ))}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {r.email}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-sm text-slate-400 font-medium whitespace-nowrap">
                          {r.date}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setReviewing(r)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 bg-emerald-500 text-white shadow-md shadow-emerald-100 hover:bg-emerald-600 cursor-pointer"
                          >
                            <FileCheck size={13} /> Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingResidents;
