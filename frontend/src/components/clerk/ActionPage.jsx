import React, { useState, useCallback } from "react";
import {
  ArrowLeft,
  FileText,
  User,
  Printer,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../axious/api";
import { useDocumentRequests } from "../../context/DocumentRequestContext";
import { useFillDocument } from "../../utils/UseFillDocument";
import { isPaid, fmt } from "../../utils/PickupHelpers";

import { Label, InfoBlock, Toast } from "./PickupAtoms";
import PaymentFlow from "./PaymentFlow";
const ActionPage = ({ request: initialReq, tab, onBack }) => {
  const { updateRequest } = useDocumentRequests();
  const { fill, filling } = useFillDocument();
  const [request, setRequest] = useState(initialReq);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resident = request.resident;
  const user = resident?.user;
  const doc = request.document_type;
  const fee = doc?.fee ?? 0;

  // ── Collect (called by PaymentFlow) ──────────────────────────
  const handleCollected = useCallback(async () => {
    setBusy(true);
    try {
      const res = await api.post(
        `/clerk/requests/${request.request_id}/collect`,
        { payment_status: true },
      );
      const updated = res.data.request;
      setRequest(updated);
      updateRequest(updated);
      notify("Payment confirmed. Request marked as Done.");
      setTimeout(onBack, 1400);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to confirm payment.";
      notify(msg, "error");
      throw new Error("collect failed");
    } finally {
      setBusy(false);
    }
  }, [request.request_id, updateRequest, onBack]);

  // ── Reschedule pickup to today ────────────────────────────────
  const handleReschedule = async () => {
    setBusy(true);
    try {
      const res = await api.post(
        `/clerk/requests/${request.request_id}/reschedule`,
        { pickup_date: new Date().toISOString().split("T")[0] },
      );
      const updated = res.data.request;
      setRequest(updated);
      updateRequest(updated);
      notify("Pickup date updated to today.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Failed to update pickup date.";
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} />

      {/* Top bar */}
      <div
        className="bg-gray-50 border-b border-gray-200 px-4 sm:px-8 h-14 flex items-center
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
          <span className="hidden sm:inline">Back to Pickup Queue</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-300 font-mono tracking-wider hidden sm:inline">
            REQ-{String(request.request_id).padStart(4, "0")}
          </span>
          <span
            className={`inline-flex items-center text-[10px] font-bold tracking-widest
            uppercase px-2.5 py-1 rounded-full border ${
              tab === "ready"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {tab === "ready" ? "Ready for Pickup" : "Collected"}
          </span>
        </div>
      </div>

      {/* Body — responsive grid: 1-col on mobile, 3-col on lg */}
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10
                      grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* LEFT (spans 2 on lg) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Resident card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-200">
              <div
                className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100
                              flex items-center justify-center"
              >
                <User size={14} className="text-emerald-600" />
              </div>
              <p className="text-sm font-black text-gray-900">Resident</p>
            </div>
            <div className="px-4 sm:px-6 py-6">
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-200">
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

          {/* Request card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-200">
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

        {/* RIGHT (1 col) */}
        <div className="space-y-4">
          {/* Fee */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 px-5 py-5">
            <Label>Total Fee Due</Label>
            <p className="text-3xl font-black text-gray-900 mt-1">
              ₱{Number(fee).toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              {isPaid(request)
                ? "✓ Already paid"
                : "Collect before releasing document"}
            </p>
          </div>

          {/* Print — always available */}
          <button
            onClick={() => fill(request)}
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
                <Printer size={14} /> Print Filled Document
              </>
            )}
          </button>

          {/* Payment flow (Ready tab only) */}
          {tab === "ready" && (
            <PaymentFlow
              request={request}
              fee={fee}
              onCollected={handleCollected}
            />
          )}

          {/* Reschedule (Done tab only) */}
          {tab === "done" && (
            <button
              onClick={handleReschedule}
              disabled={busy}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                         text-sm font-black transition-colors flex items-center justify-center gap-2
                         disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Updating…
                </>
              ) : (
                <>
                  <Calendar size={14} /> Set Pickup Date to Today
                </>
              )}
            </button>
          )}

          {/* Info callout */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              {tab === "ready"
                ? "Payment confirms collection and moves this to Done. Ensure the printed copy is signed by the Punong Barangay."
                : "Rescheduling updates the pickup date to today. Reprint the document after updating."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPage;
