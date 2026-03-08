import React, { useState, useCallback } from "react";
import { Banknote, CheckCircle, Loader2 } from "lucide-react";
import { isPaid } from "../../utils/PickupHelpers";

/**
 * PaymentFlow — walk-in cash only.
 * Online/Stripe payment removed.
 */
const PaymentFlow = ({ request, fee, onCollected }) => {
  const [collecting, setCollecting] = useState(false);

  const alreadyPaid = isPaid(request);

  const handleWalkin = useCallback(async () => {
    setCollecting(true);
    try {
      await onCollected();
    } finally {
      setCollecting(false);
    }
  }, [onCollected]);

  // ── Already paid ──────────────────────────────────────────────
  if (alreadyPaid) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-5 text-center">
        <CheckCircle size={20} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-black text-emerald-800">Payment Received</p>
        <p className="text-[11px] text-emerald-600 mt-0.5">
          This request has already been paid.
        </p>
      </div>
    );
  }

  // ── Collect cash button ───────────────────────────────────────
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <p className="text-sm font-black text-gray-900">Collect Payment</p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Confirm cash received over the counter
        </p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <Banknote size={15} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">
              Cash · Walk-in
            </span>
          </div>
          <span className="text-lg font-black text-gray-900">
            ₱{Number(fee).toFixed(2)}
          </span>
        </div>
        <button
          onClick={handleWalkin}
          disabled={collecting}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                     text-sm font-black transition-colors flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {collecting ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Confirming…
            </>
          ) : (
            <>
              <CheckCircle size={14} /> Confirm Payment Received
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentFlow;
