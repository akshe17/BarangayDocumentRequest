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

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
    <div
      className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100
                    flex items-center justify-center shrink-0 mt-0.5"
    >
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
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-sm font-black
                         text-slate-500 hover:text-emerald-600 hover:border-emerald-300
                         transition-all shadow-sm"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex-1 bg-slate-100 rounded-2xl border-2 border-slate-200
                      overflow-hidden flex items-center justify-center min-h-[300px]"
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
   DETAIL PAGE — approve anyway only
───────────────────────────────────────────────────────────── */
const DetailPage = ({ resident, onBack, onUpdate, showToast }) => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await api.post(`/zone-leader/residents/${resident.id}/verify`);
      onUpdate(resident.id, { status: "Verified", rejectionReason: null });
      showToast("Resident approved successfully.", "success");
      setTimeout(onBack, 1000);
    } catch {
      showToast("Failed to approve resident.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div
        className="bg-white border-b border-slate-100 h-14 px-5 md:px-8
                      flex items-center justify-between sticky top-0 z-30 shadow-sm"
      >
        <button
          onClick={onBack}
          disabled={actionLoading}
          className="flex items-center gap-2 text-sm font-bold text-slate-400
                     hover:text-slate-900 transition-colors group disabled:opacity-40"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Rejected
        </button>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-slate-300 font-mono hidden sm:block">
            ID-{String(resident.id).padStart(5, "0")}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-black
            tracking-widest uppercase px-3 py-1 rounded-full border
            bg-green-50 text-emerald-700 border-red-200"
          >
            <XCircle size={11} /> Rejected
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 grid md:grid-cols-2 gap-6">
        {/* LEFT — ID */}
        <div
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5
                        flex flex-col min-h-[460px]"
        >
          <IdViewer url={resident.idUrl} />
        </div>

        {/* RIGHT — Info + actions */}
        <div className="flex flex-col gap-5">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div
                className="w-8 h-8 rounded-xl bg-emerald-50 border border-red-100
                              flex items-center justify-center shrink-0"
              >
                <UserCheck size={14} className="text-emerald-500" />
              </div>
              <p className="text-sm font-black text-slate-900">
                Resident Details
              </p>
            </div>
            <div className="px-5 py-5 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center
                                justify-center text-white font-black text-xl shadow-lg
                                shadow-red-100 shrink-0 select-none"
                >
                  {resident.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-black text-slate-900 truncate">
                    {resident.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {resident.email}
                  </p>
                </div>
              </div>

              {/* Registered */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Registered
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Calendar size={11} className="text-slate-400 shrink-0" />
                  {resident.date}
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

              {/* Rejection reason */}
              {resident.rejectionReason && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1">
                    Rejection Reason
                  </p>
                  <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                    {resident.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 bg-slate-50/50">
              <div
                className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100
                              flex items-center justify-center shrink-0"
              >
                <FileCheck size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  Override Decision
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Review the ID carefully before approving a previously rejected
                  resident.
                </p>
              </div>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-4">
                This resident was previously rejected. If their ID looks valid
                now, you can approve their account anyway and they will receive
                a verification email.
              </p>
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white
                           rounded-xl font-black text-sm shadow-lg shadow-emerald-100
                           transition-all flex items-center justify-center gap-2
                           disabled:opacity-50 active:scale-[0.98]"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Approving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} /> Approve Anyway
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex gap-3 items-start">
            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Use the <strong>+ − ↺</strong> controls to zoom and inspect the ID
              before overriding the rejection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN — REJECTED LIST
───────────────────────────────────────────────────────────── */
const RejectedResidents = () => {
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

  const rejected = useMemo(
    () =>
      residents
        .filter((r) => r.status === "Rejected")
        .filter((r) => {
          const q = searchTerm.toLowerCase();
          return (
            r.name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q)
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
              Rejected <span className="text-emerald-500">Residents</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {isLoading
                ? "Loading…"
                : `${rejected.length} rejected resident${rejected.length !== 1 ? "s" : ""}`}
              {lastFetched && !isLoading && (
                <span className="text-slate-300 ml-2 text-[10px]">
                  · synced {lastFetched.toLocaleTimeString()}
                </span>
              )}
            </p>
            {error && (
              <p className="text-xs text-emerald-500 font-semibold mt-1">
                {error}
              </p>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            title="Refresh"
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-emerald-50
                       hover:border-red-200 hover:text-emerald-500 transition-all
                       text-slate-500 shadow-sm disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={16}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl
                         focus:ring-2 focus:ring-red-200 focus:border-red-400 focus:bg-white
                         outline-none transition-all text-sm font-medium placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={6} cols={4} />
            </div>
          ) : rejected.length === 0 ? (
            <div className="flex flex-col items-center py-28 gap-3">
              <XCircle size={40} className="text-slate-200" />
              <p className="font-black text-slate-400 text-sm">
                No rejected residents
              </p>
              <p className="text-slate-300 text-xs">
                Try adjusting your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      "Resident",
                      "Email",
                      "Rejection Reason",
                      "Registered",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.1em]
                                   text-slate-400 last:text-center"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rejected.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center
                                          justify-center text-white font-black text-sm
                                          shadow-sm shrink-0 select-none"
                          >
                            {r.avatar}
                          </div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">
                            {r.name}
                          </p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {r.email}
                      </td>

                      {/* Rejection reason */}
                      <td className="px-6 py-4 max-w-[220px]">
                        {r.rejectionReason ? (
                          <p className="text-xs text-emerald-600 font-medium leading-relaxed line-clamp-2">
                            {r.rejectionReason}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                        {r.date}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setReviewing(r)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                                     text-xs font-black transition-all active:scale-95
                                     bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          <CheckCircle2 size={13} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RejectedResidents;
