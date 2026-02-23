import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  Loader2,
  Lock,
  X,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Wifi,
} from "lucide-react";

/* ── inject keyframes once ──────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .pm-root { font-family: 'Sora', sans-serif; }

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes modalUp {
    from { opacity: 0; transform: translateY(24px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes successBounce {
    0%   { transform: scale(0); opacity: 0; }
    55%  { transform: scale(1.2); }
    75%  { transform: scale(0.92); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes cardTilt {
    0%, 100% { transform: rotate(-3deg) translateY(0px); }
    50%       { transform: rotate(-3deg) translateY(-5px); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes ripple {
    0%   { transform: scale(1);   opacity: 0.4; }
    100% { transform: scale(2.4); opacity: 0;   }
  }
  @keyframes spin360 {
    to { transform: rotate(360deg); }
  }

  .pm-overlay   { animation: overlayFadeIn 180ms ease forwards; }
  .pm-modal     { animation: modalUp 340ms cubic-bezier(.22,.68,0,1.15) forwards; }
  .pm-card-tilt { animation: cardTilt 3.5s ease-in-out infinite; }
  .pm-success   { animation: successBounce 550ms cubic-bezier(.22,.68,0,1.2) forwards; }
  .pm-ripple    { animation: ripple 1.6s ease-out infinite; }
  .pm-spin      { animation: spin360 0.8s linear infinite; }

  .pm-shimmer {
    background: linear-gradient(90deg,
      rgba(255,255,255,0.0) 0%,
      rgba(255,255,255,0.12) 50%,
      rgba(255,255,255,0.0) 100%
    );
    background-size: 600px 100%;
    animation: shimmer 2.2s infinite linear;
  }

  .pm-input-wrap .StripeElement { padding: 0 !important; }

  .pm-pay-btn {
    position: relative;
    overflow: hidden;
    transition: transform 80ms ease, box-shadow 200ms ease;
  }
  .pm-pay-btn:active { transform: scale(0.975); }
  .pm-pay-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 100%);
    pointer-events: none;
  }
`;

function injectCSS() {
  if (document.getElementById("pm-styles")) return;
  const el = document.createElement("style");
  el.id = "pm-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ── virtual card visual ────────────────────────────────────── */
const VirtualCard = ({ fee }) => (
  <div
    className="pm-card-tilt relative w-52 h-32 rounded-2xl select-none"
    style={{
      background:
        "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
      boxShadow:
        "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
    }}
  >
    {/* shimmer overlay */}
    <div className="pm-shimmer absolute inset-0 rounded-2xl" />

    {/* chip */}
    <div
      className="absolute top-5 left-5 w-8 h-6 rounded-md"
      style={{
        background: "linear-gradient(135deg, #d4a843, #f0c060, #b8882e)",
      }}
    >
      <div className="absolute inset-0 grid grid-cols-3 gap-px p-px opacity-60">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-yellow-900/40 rounded-sm" />
        ))}
      </div>
    </div>

    {/* wifi contactless */}
    <div className="absolute top-5 right-5 opacity-50">
      <Wifi size={16} className="text-white rotate-90" />
    </div>

    {/* amount */}
    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
      <div>
        <p
          className="text-white/40 text-[8px] uppercase tracking-widest mb-0.5"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Amount Due
        </p>
        <p
          className="text-white font-bold text-lg leading-none"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          ₱{Number(fee).toFixed(2)}
        </p>
      </div>
      {/* mastercard-ish circles */}
      <div className="flex -space-x-2">
        <div
          className="w-7 h-7 rounded-full opacity-80"
          style={{ background: "#eb5757" }}
        />
        <div
          className="w-7 h-7 rounded-full opacity-80"
          style={{ background: "#f5a623", mixBlendMode: "screen" }}
        />
      </div>
    </div>
  </div>
);

/* ── success screen ─────────────────────────────────────────── */
const SuccessScreen = ({ fee }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-4">
    <div className="relative">
      {/* ripple rings */}
      <div className="pm-ripple absolute inset-0 rounded-full bg-emerald-400 opacity-40" />
      <div
        className="pm-ripple absolute inset-0 rounded-full bg-emerald-400 opacity-20"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="pm-success w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center
                      shadow-lg shadow-emerald-500/40 relative z-10"
      >
        <CheckCircle size={30} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
    <div className="text-center">
      <p className="text-gray-900 font-bold text-lg">Payment Successful</p>
      <p className="text-gray-400 text-sm mt-1">
        ₱{Number(fee).toFixed(2)} collected
      </p>
    </div>
    <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
      <p className="text-emerald-700 text-xs font-semibold">
        Marking request as Done…
      </p>
    </div>
  </div>
);

/* ── processing overlay ─────────────────────────────────────── */
const ProcessingOverlay = () => (
  <div
    className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col
                  items-center justify-center z-20 gap-3"
  >
    <div className="w-12 h-12 rounded-full border-[3px] border-gray-100 border-t-emerald-500 pm-spin" />
    <p className="text-sm font-semibold text-gray-600">Processing payment…</p>
    <p className="text-[11px] text-gray-400">Please don't close this window</p>
  </div>
);

/* ── main component ─────────────────────────────────────────── */
const StripeCardForm = ({ clientSecret, fee, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    injectCSS();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !cardComplete) return;
    setProcessing(true);
    setCardError(null);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card: elements.getElement(CardElement) },
      },
    );

    if (error) {
      setCardError(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === "succeeded") {
      setSucceeded(true);
      setTimeout(() => onSuccess(paymentIntent.id), 1800);
    }
  };

  return (
    /* ── backdrop ── */
    <div
      className="pm-root pm-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      {/* ── modal shell ── */}
      <div
        className="pm-modal relative w-full max-w-sm bg-white rounded-3xl overflow-hidden"
        style={{
          boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        {/* processing overlay */}
        {processing && !succeeded && <ProcessingOverlay />}

        {/* ── dark header ── */}
        <div
          className="relative px-6 pt-6 pb-8 flex flex-col items-center gap-4 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
          }}
        >
          {/* close btn */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20
                       flex items-center justify-center transition-colors text-white/60 hover:text-white"
          >
            <X size={13} />
          </button>

          {/* merchant info */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center
                            shadow-lg shadow-emerald-500/30"
            >
              <CreditCard size={18} className="text-white" />
            </div>
            <p className="text-white/50 text-[10px] uppercase tracking-[0.15em] mt-1">
              Barangay Document Request
            </p>
            <p className="text-white font-bold text-2xl leading-none">
              ₱{Number(fee).toFixed(2)}
            </p>
          </div>

          {/* floating card */}
          <VirtualCard fee={fee} />

          {/* bottom fade */}
          <div
            className="absolute bottom-0 inset-x-0 h-8 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent, white)",
            }}
          />
        </div>

        {/* ── form body ── */}
        <div className="px-6 pb-6 pt-2">
          {succeeded ? (
            <SuccessScreen fee={fee} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* test mode badge */}
              <div
                className="flex items-center gap-2 bg-amber-50 border border-amber-200
                              rounded-xl px-3 py-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <p className="text-[10px] text-amber-700 font-semibold">
                  Test mode —{" "}
                  <span className="font-mono">4242 4242 4242 4242</span> · any
                  MM/YY · any CVC
                </p>
              </div>

              {/* card input */}
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest
                                  text-gray-400 mb-2"
                >
                  Card Information
                </label>
                <div
                  className="pm-input-wrap border border-gray-200 rounded-xl overflow-hidden
                                focus-within:border-emerald-400 focus-within:ring-2
                                focus-within:ring-emerald-400/20 transition-all"
                >
                  {/* number row */}
                  <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-3">
                    <CreditCard size={15} className="text-gray-300 shrink-0" />
                    <div className="flex-1">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "14px",
                              color: "#111827",
                              fontFamily: "'Sora', system-ui, sans-serif",
                              fontWeight: "500",
                              "::placeholder": { color: "#d1d5db" },
                            },
                            invalid: { color: "#ef4444" },
                          },
                          hidePostalCode: true,
                        }}
                        onChange={(e) => {
                          setCardError(e.error?.message ?? null);
                          setCardComplete(e.complete);
                        }}
                      />
                    </div>
                    <ShieldCheck
                      size={14}
                      className="text-emerald-400 shrink-0"
                    />
                  </div>
                </div>

                {cardError && (
                  <div className="mt-2 flex items-center gap-1.5 text-red-500">
                    <AlertCircle size={12} />
                    <p className="text-[11px] font-medium">{cardError}</p>
                  </div>
                )}
              </div>

              {/* summary row */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Total Due
                  </p>
                  <p className="text-gray-900 font-bold text-base">
                    ₱{Number(fee).toFixed(2)}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50
                                border border-emerald-100 rounded-lg px-2.5 py-1.5"
                >
                  <ShieldCheck size={11} />
                  <span className="text-[10px] font-bold">Stripe Secured</span>
                </div>
              </div>

              {/* actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-24 py-3 border border-gray-200 rounded-xl text-sm font-semibold
                             text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!stripe || processing || !cardComplete}
                  className="pm-pay-btn flex-1 py-3 rounded-xl text-sm font-bold text-white
                             flex items-center justify-center gap-2 disabled:opacity-40
                             disabled:cursor-not-allowed transition-opacity"
                  style={{
                    background:
                      cardComplete && !processing
                        ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                        : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                    boxShadow:
                      cardComplete && !processing
                        ? "0 4px 20px rgba(5,150,105,0.35)"
                        : "none",
                  }}
                >
                  {processing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      Pay ₱{Number(fee).toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              {/* footnote */}
              <p
                className="text-center text-[10px] text-gray-300 flex items-center
                            justify-center gap-1 pt-1"
              >
                <Lock size={9} />
                256-bit SSL · Powered by Stripe
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeCardForm;
