import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import api from "../../axious/api";
import { useFillDocument } from "../../utils/UseFillDocument";
import { useZoneClearance } from "../../context/ZoneClearanceContext";
import { fmt, STATUS } from "./ClearanceConstraints";
import {
  Label,
  FieldBox,
  Divider,
  SectionTitle,
  StatusPill,
  Toast,
} from "./ClearanceAtoms";
import { RejectModal, PaymentModal } from "./ClearanceModals";
import {
  PendingActions,
  ApprovedActions,
  ReadyActions,
  CompletedBanner,
  RejectedBanner,
} from "./ClearanceActions";

const DetailView = ({ requestId, onBack }) => {
  const { getById, updateRequest } = useZoneClearance();
  const { fill, filling } = useFillDocument();

  const [data, setData] = useState(() => getById(requestId));
  const [loadingDetail, setLoading] = useState(!getById(requestId));
  const [pickupDate, setPickupDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch from API if not already in context cache
  useEffect(() => {
    if (data) return;
    setLoading(true);
    api
      .get(`/zone-leader/clearance/${requestId}`)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [requestId]);

  // Auto-generate document template after a successful status transition
  const autoFill = (updated) => {
    if (updated?.document_type?.template_path) {
      fill(updated).catch(console.error);
    }
  };

  // ── Approve (schedule) or Ready Immediately ─────────────────────────────────
  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await api.post(
        `/zone-leader/clearance/${requestId}/approve`,
        {
          pickup_date: pickupDate || null,
        },
      );
      const updated = res.data.request;
      setData(updated);
      updateRequest(updated);
      notify(
        res.data.message ??
          (pickupDate
            ? "Approved & scheduled."
            : "Marked as ready for pickup."),
      );
      autoFill(updated);
    } catch {
      notify("Approval failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  // ── Advance Approved → Ready for Pickup ─────────────────────────────────────
  const handleMarkReady = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/zone-leader/clearance/${requestId}/ready`);
      const updated = res.data.request;
      setData(updated);
      updateRequest(updated);
      notify("Marked as ready for pickup.");
      autoFill(updated);
    } catch {
      notify("Failed to update status.", "error");
    } finally {
      setBusy(false);
    }
  };

  // ── Confirm payment → Completed ─────────────────────────────────────────────
  const handleComplete = async () => {
    setBusy(true);
    try {
      const res = await api.post(
        `/zone-leader/clearance/${requestId}/complete`,
      );
      const updated = res.data.request;
      setData(updated);
      updateRequest(updated);
      setShowPayment(false);
      notify("Request completed. Payment confirmed.");
    } catch {
      notify("Failed to complete request.", "error");
    } finally {
      setBusy(false);
    }
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const handleReject = async (reason) => {
    setBusy(true);
    try {
      const res = await api.post(`/zone-leader/clearance/${requestId}/reject`, {
        reason,
      });
      const updated = res.data.request;
      setData(updated);
      updateRequest(updated);
      setShowReject(false);
      notify(res.data.message ?? "Request rejected.");
    } catch {
      notify("Rejection failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  // ── Loading / empty guards ──────────────────────────────────────────────────
  if (loadingDetail)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
        <p className="text-xs text-gray-400">Loading request…</p>
      </div>
    );
  if (!data) return null;

  const resi = data.resident;
  const user = resi?.user;
  const zone = resi?.zone;
  const doc = data.document_type;
  const statusId = Number(data.status_id);

  const isPending = statusId === 1;
  const isApproved = statusId === 2;
  const isReady = statusId === 5;
  const isCompleted = statusId === 3;
  const isRejected = statusId === 4;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} />

      {/* Modals */}
      {showReject && (
        <RejectModal
          onConfirm={handleReject}
          onCancel={() => setShowReject(false)}
          busy={busy}
        />
      )}
      {showPayment && (
        <PaymentModal
          fee={doc?.fee}
          onConfirm={handleComplete}
          onCancel={() => setShowPayment(false)}
          busy={busy}
        />
      )}

      {/* ── Sticky top bar ── */}
      <div
        className="px-4 sm:px-8 h-14 flex items-center justify-between bg-white
                      border-b border-gray-100 sticky top-0 z-30"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500
                     hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Queue
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 font-mono tracking-wider hidden sm:inline">
            REQ-{String(data.request_id).padStart(4, "0")}
          </span>
          <StatusPill statusId={statusId} />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Resident header */}
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
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold
                               text-emerald-600 mt-1.5 tracking-wide uppercase"
              >
                <CheckCircle size={10} /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Request Info */}
        <SectionTitle>Request Information</SectionTitle>
        <div className="grid grid-cols-3 gap-5 mb-10">
          {[
            ["Request ID", `REQ-${String(data.request_id).padStart(4, "0")}`],
            ["Document", doc?.document_name],
            ["Fee", doc?.fee ? `₱${Number(doc.fee).toFixed(2)}` : "Free"],
            ["Filed", fmt(data.request_date)],
            ["Status", STATUS[statusId]?.label ?? "—"],
            ["Pickup", fmt(data.pickup_date)],
          ].map(([k, v]) => (
            <div key={k}>
              <Label>{k}</Label>
              <p className="text-sm font-semibold text-gray-700">{v ?? "—"}</p>
            </div>
          ))}
        </div>

        <Divider />

        {/* Personal Info */}
        <SectionTitle>Personal Information</SectionTitle>
        <div className="grid grid-cols-3 gap-4 mb-0">
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

        <Divider />

        {/* Document form data */}
        <div className="flex items-baseline justify-between mb-6">
          <SectionTitle>{doc?.document_name ?? "Document"}</SectionTitle>
          {doc?.fee > 0 && (
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

        <Divider />

        {/* ── Status-specific action panels ── */}
        {isPending && (
          <PendingActions
            pickupDate={pickupDate}
            setPickupDate={setPickupDate}
            onApprove={handleApprove}
            onReject={() => setShowReject(true)}
            busy={busy}
          />
        )}
        {isApproved && (
          <ApprovedActions
            data={data}
            doc={doc}
            filling={filling}
            fill={fill}
            onMarkReady={handleMarkReady}
            busy={busy}
          />
        )}
        {isReady && (
          <ReadyActions
            data={data}
            doc={doc}
            filling={filling}
            fill={fill}
            onComplete={() => setShowPayment(true)}
            busy={busy}
          />
        )}
        {isCompleted && (
          <CompletedBanner
            doc={doc}
            data={data}
            fill={fill}
            filling={filling}
          />
        )}
        {isRejected && <RejectedBanner reason={data.rejection_reason} />}
      </div>
    </div>
  );
};

export default DetailView;
