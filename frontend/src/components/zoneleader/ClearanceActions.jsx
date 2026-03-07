import React from "react";
import {
  Loader2,
  CalendarClock,
  PackageCheck,
  XCircle,
  BadgeCheck,
  Printer,
  FileText,
} from "lucide-react";
import { fmt, todayStr } from "./ClearanceConstraints";
import { SectionTitle } from "./ClearanceAtoms";

// ── Pending: schedule pickup date OR mark ready immediately, or reject ────────
export const PendingActions = ({
  pickupDate,
  setPickupDate,
  onApprove,
  onReject,
  busy,
}) => (
  <section>
    <SectionTitle>Zone Leader Decision</SectionTitle>

    {/* Option A — Schedule a pickup date (→ Approved) */}
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <CalendarClock size={14} className="text-emerald-500" />
        <p className="text-xs font-black text-gray-700 uppercase tracking-wider">
          Schedule Pickup Date
        </p>
        <span className="text-[9px] text-gray-400 font-medium normal-case tracking-normal ml-auto">
          → sets status to <strong>Approved</strong>
        </span>
      </div>
      <input
        type="date"
        min={todayStr()}
        value={pickupDate}
        onChange={(e) => setPickupDate(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                   text-gray-800 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
      />
      <button
        onClick={onApprove}
        disabled={busy || !pickupDate}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                   text-sm font-black transition-colors flex items-center justify-center gap-2
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <CalendarClock size={14} />
        )}
        Approve &amp; Schedule for {pickupDate ? fmt(pickupDate) : "…"}
      </button>
    </div>

    {/* OR divider */}
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        or
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>

    {/* Option B — Mark ready for pickup immediately (→ status 5) */}
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <PackageCheck size={14} className="text-emerald-500" />
        <p className="text-xs font-black text-gray-700 uppercase tracking-wider">
          Ready for Pickup Now
        </p>
        <span className="text-[9px] text-gray-400 font-medium normal-case tracking-normal ml-auto">
          → sets status to <strong>Ready for Pickup</strong>
        </span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">
        Document is ready immediately. Resident can come in to claim it today.
      </p>
      <button
        onClick={() => {
          setPickupDate("");
          onApprove();
        }}
        disabled={busy}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                   text-sm font-black transition-colors flex items-center justify-center gap-2
                   disabled:opacity-40"
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <PackageCheck size={14} />
        )}
        Mark as Ready for Pickup
      </button>
    </div>

    {/* Reject */}
    <button
      onClick={onReject}
      disabled={busy}
      className="w-full py-3 border border-red-100 bg-red-50 text-red-500 rounded-xl
                 text-sm font-bold hover:bg-red-100 transition-colors
                 flex items-center justify-center gap-2 disabled:opacity-40"
    >
      <XCircle size={14} /> Reject This Request
    </button>
  </section>
);

// ── Approved (scheduled): show pickup date, print button, manual advance ──────
export const ApprovedActions = ({
  data,
  doc,
  filling,
  fill,
  onMarkReady,
  busy,
}) => (
  <section>
    <SectionTitle>Scheduled Pickup</SectionTitle>

    {/* Info banner */}
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-5 flex items-start gap-4">
      <CalendarClock size={18} className="text-emerald-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-black text-emerald-800">
          Pickup scheduled for {fmt(data.pickup_date)}
        </p>
        <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
          The request will automatically move to{" "}
          <strong>Ready for Pickup</strong> on that date. You can also advance
          it manually below.
        </p>
      </div>
    </div>

    {/* Print document */}
    {doc?.template_path && (
      <div className="space-y-3 mb-5">
        <button
          onClick={() => fill(data)}
          disabled={filling}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl
                     text-sm font-black transition-all flex items-center justify-center gap-3
                     shadow-sm disabled:opacity-50"
        >
          {filling ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Printer size={16} /> Generate Document
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-300 text-center">
          Template: <span className="font-mono">{doc.template_path}</span>
        </p>
      </div>
    )}

    {/* Manual advance to Ready for Pickup */}
    <button
      onClick={onMarkReady}
      disabled={busy}
      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                 text-sm font-black transition-colors flex items-center justify-center gap-2
                 disabled:opacity-40"
    >
      {busy ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <PackageCheck size={14} />
      )}
      Mark as Ready for Pickup Now
    </button>
  </section>
);

// ── Ready for Pickup: print doc + confirm payment → Completed ─────────────────
export const ReadyActions = ({
  data,
  doc,
  filling,
  fill,
  onComplete,
  busy,
}) => (
  <section>
    <SectionTitle>Ready for Pickup</SectionTitle>

    {/* Info banner */}
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-5 flex items-start gap-4">
      <PackageCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-black text-emerald-800">
          Awaiting Resident Pickup
        </p>
        <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
          Once the resident claims the document and pays{" "}
          <strong>
            {doc?.fee ? `₱${Number(doc.fee).toFixed(2)}` : "₱0.00 (Free)"}
          </strong>
          , confirm completion below.
        </p>
      </div>
    </div>

    {/* Print document */}
    {doc?.template_path && (
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-4">
          <FileText size={16} className="text-emerald-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-800 truncate">
              {doc.document_name}
            </p>
            <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
              Template: {doc.template_path}
            </p>
          </div>
        </div>
        <button
          onClick={() => fill(data)}
          disabled={filling}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl
                     text-sm font-black transition-all flex items-center justify-center gap-3
                     shadow-sm disabled:opacity-50"
        >
          {filling ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Printer size={16} /> Print Document
            </>
          )}
        </button>
      </div>
    )}

    {/* Confirm payment & complete */}
    <button
      onClick={onComplete}
      disabled={busy}
      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl
                 text-sm font-black transition-colors flex items-center justify-center gap-2
                 shadow-lg shadow-emerald-100 disabled:opacity-40"
    >
      {busy ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <BadgeCheck size={16} />
      )}
      Confirm Payment &amp; Mark Completed
    </button>
  </section>
);

// ── Completed: status banner + reprint button ─────────────────────────────────
export const CompletedBanner = ({ doc, data, fill, filling }) => (
  <section>
    <SectionTitle>Request Completed</SectionTitle>

    {/* Status banner */}
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4 mb-5">
      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
        <BadgeCheck size={18} className="text-emerald-600" />
      </div>
      <div>
        <p className="text-sm font-black text-emerald-800">
          This request has been completed.
        </p>
        <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
          Payment was confirmed and the document was issued to the resident.
        </p>
      </div>
    </div>

    {/* Reprint — only shown when a template exists */}
    {doc?.template_path && (
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-4">
          <FileText size={16} className="text-emerald-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-800 truncate">
              {doc.document_name}
            </p>
            <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
              Template: {doc.template_path}
            </p>
          </div>
        </div>
        <button
          onClick={() => fill(data)}
          disabled={filling}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl
                     text-sm font-black transition-all flex items-center justify-center gap-3
                     shadow-sm disabled:opacity-50"
        >
          {filling ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Printer size={16} /> Reprint Document
            </>
          )}
        </button>
      </div>
    )}
  </section>
);

// ── Rejected: show rejection reason ──────────────────────────────────────────
export const RejectedBanner = ({ reason }) => {
  if (!reason) return null;
  return (
    <section>
      <SectionTitle>Rejection Reason</SectionTitle>
      <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
        <p className="text-sm text-red-700 leading-relaxed">{reason}</p>
      </div>
    </section>
  );
};
