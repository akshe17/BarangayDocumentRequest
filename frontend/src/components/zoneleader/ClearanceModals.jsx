import React, { useState } from "react";
import { XCircle, Loader2, BadgeCheck, Banknote } from "lucide-react";

// ── Modal: reject a clearance request ────────────────────────────────────────
export const RejectModal = ({ onConfirm, onCancel, busy }) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100
                          flex items-center justify-center shrink-0"
          >
            <XCircle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-base">Reject Request</p>
            <p className="text-xs text-gray-400 mt-1">
              Resident will be notified of this decision.
            </p>
          </div>
        </div>

        {/* Reason textarea */}
        <textarea
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm resize-none
                     focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none
                     h-28 mb-5 placeholder:text-gray-300 font-medium text-gray-800"
          placeholder="State the reason clearly…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold
                       text-gray-500 hover:bg-gray-50 transition-colors"
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
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal: confirm payment and mark completed ─────────────────────────────────
export const PaymentModal = ({ fee, onConfirm, onCancel, busy }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100
                        flex items-center justify-center shrink-0"
        >
          <Banknote size={18} className="text-emerald-500" />
        </div>
        <div>
          <p className="font-black text-gray-900 text-base">Confirm Payment</p>
          <p className="text-xs text-gray-400 mt-1">
            Confirm that the resident has paid{" "}
            <strong className="text-gray-700">
              {fee ? `₱${Number(fee).toFixed(2)}` : "₱0.00 (Free)"}
            </strong>{" "}
            and received the document.
          </p>
        </div>
      </div>

      {/* Warning note */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-6">
        <p className="text-xs text-emerald-700 leading-relaxed">
          This will mark the request as <strong>Completed</strong> and cannot be
          undone.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold
                     text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-bold
                     hover:bg-emerald-600 transition-colors disabled:opacity-40
                     flex items-center justify-center gap-2"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <BadgeCheck size={14} />
          )}
          Mark as Completed
        </button>
      </div>
    </div>
  </div>
);
