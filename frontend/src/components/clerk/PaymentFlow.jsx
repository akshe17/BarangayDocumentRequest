import React, { useState, useCallback } from "react";
import { Elements } from "@stripe/react-stripe-js";
import {
  CreditCard,
  Banknote,
  Wifi,
  ChevronRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import api from "../../axious/api";
import { stripePromise } from "./stripeUtils";
import StripeCardForm from "./StripeCardForm";
import { isPaid } from "./pickupHelpers";

/**
 * PaymentFlow — inline payment steps.
 * Steps: idle → choose → stripe (full-screen modal) → success
 */
const PaymentFlow = ({ request, fee, onCollected }) => {
  const [step, setStep] = useState("idle");
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingPI, setLoadingPI] = useState(false);
  const [piError, setPiError] = useState(null);
  const [collecting, setCollecting] = useState(false);

  const alreadyPaid = isPaid(request);

  // ── Shared: mark as collected on backend ─────────────────────
  const markCollected = useCallback(async () => {
    setCollecting(true);
    try {
      await onCollected();
    } finally {
      setCollecting(false);
    }
  }, [onCollected]);

  // ── Walk-in cash ──────────────────────────────────────────────
  const handleWalkin = () => markCollected();

  // ── Online: create PaymentIntent → show Stripe modal ─────────
  const handleOnlineClick = async () => {
    setLoadingPI(true);
    setPiError(null);
    try {
      const res = await api.post(
        `/clerk/requests/${request.request_id}/create-payment-intent`,
      );
      setClientSecret(res.data.client_secret);
      setStep("stripe");
    } catch (err) {
      const msg =
        err?.response?.data?.error ??
        "Could not start online payment. Please try again.";
      setPiError(msg);
    } finally {
      setLoadingPI(false);
    }
  };

  // ── Stripe success → mark collected ──────────────────────────
  const handleStripeSuccess = async () => {
    setStep("success");
    await markCollected();
  };

  // ── Already paid ──────────────────────────────────────────────
  if (alreadyPaid) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-5 text-center">
        <CheckCircle size={20} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-black text-emerald-800">Payment Received</p>
        <p className="text-[11px] text-emerald-600 mt-0.5">
          This request has been paid.
        </p>
      </div>
    );
  }

  // ── Stripe modal (rendered as fixed overlay via StripeCardForm) ──
  if (step === "stripe" && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripeCardForm
          clientSecret={clientSecret}
          fee={fee}
          onSuccess={handleStripeSuccess}
          onCancel={() => setStep("choose")}
        />
      </Elements>
    );
  }

  // ── Success state ─────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={20} className="text-white" />
        </div>
        <p className="text-sm font-black text-emerald-800">
          Payment Successful!
        </p>
        <p className="text-[11px] text-emerald-600 mt-1">Marking as done…</p>
      </div>
    );
  }

  // ── Idle: single button ───────────────────────────────────────
  if (step === "idle") {
    return (
      <button
        onClick={() => setStep("choose")}
        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                   text-sm font-black transition-colors flex items-center justify-center gap-2"
      >
        <CreditCard size={14} /> Collect Payment
      </button>
    );
  }

  // ── Choose: Walk-in or Online ─────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-black text-gray-900">Payment Method</p>
          <button
            onClick={() => setStep("idle")}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-3 space-y-2">
          {/* Walk-in Cash */}
          <button
            onClick={handleWalkin}
            disabled={collecting}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100
                       hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group text-left
                       disabled:opacity-50"
          >
            <div
              className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center
                            justify-center shrink-0 group-hover:bg-emerald-100 group-hover:border-emerald-200
                            transition-colors"
            >
              {collecting ? (
                <Loader2 size={15} className="text-emerald-500 animate-spin" />
              ) : (
                <Banknote
                  size={16}
                  className="text-gray-500 group-hover:text-emerald-600 transition-colors"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-gray-900">
                Walk-in Payment
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Cash · Over the counter
              </p>
            </div>
            <ChevronRight
              size={13}
              className="text-gray-300 group-hover:text-emerald-400 transition-colors shrink-0"
            />
          </button>

          {/* Online / Stripe */}
          <button
            onClick={handleOnlineClick}
            disabled={loadingPI}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100
                       hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group text-left
                       disabled:opacity-50"
          >
            <div
              className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center
                            justify-center shrink-0 group-hover:bg-emerald-100 group-hover:border-emerald-200
                            transition-colors"
            >
              {loadingPI ? (
                <Loader2 size={15} className="text-emerald-500 animate-spin" />
              ) : (
                <Wifi
                  size={16}
                  className="text-gray-500 group-hover:text-emerald-600 transition-colors"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-gray-900 flex items-center gap-2">
                Online Payment
                <span
                  className="text-[9px] font-black bg-violet-100 text-violet-600 px-1.5 py-0.5
                                 rounded-full uppercase tracking-wide"
                >
                  Stripe
                </span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Credit / debit card
              </p>
            </div>
            <ChevronRight
              size={13}
              className="text-gray-300 group-hover:text-emerald-400 transition-colors shrink-0"
            />
          </button>
        </div>

        {piError && (
          <div className="px-4 pb-4">
            <p className="text-[11px] text-red-500 flex items-center gap-1">
              <AlertCircle size={11} /> {piError}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentFlow;
