import React from "react";
import { ArrowUpRight, Loader2, Inbox } from "lucide-react";
import { fmt } from "./ClearanceConstraints";
// ── Single table row for a document request ───────────────────────────────────
export const RequestRow = ({ req, statusId, onView }) => {
  const u = req.resident?.user;
  const initials = `${u?.first_name?.[0] ?? ""}${u?.last_name?.[0] ?? ""}`;

  return (
    <tr className="hover:bg-emerald-50/40 transition-colors">
      {/* Resident */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black select-none">
              {initials}
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

      {/* Document */}
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-gray-800">
          {req.document_type?.document_name ?? "—"}
        </p>
        {req.document_type?.fee > 0 && (
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
            ₱{Number(req.document_type.fee).toFixed(2)}
          </p>
        )}
      </td>

      {/* Context-aware date / reason column */}
      <td className="px-6 py-4">
        {statusId === 2 && req.pickup_date ? (
          <div>
            <p className="text-xs font-bold text-emerald-700">
              {fmt(req.pickup_date)}
            </p>
            <p className="text-[10px] text-gray-400">pickup date</p>
          </div>
        ) : statusId === 3 ? (
          <div>
            <p className="text-xs font-bold text-gray-700">
              {fmt(req.updated_at)}
            </p>
            <p className="text-[10px] text-gray-400">completed on</p>
          </div>
        ) : statusId === 4 && req.rejection_reason ? (
          <p
            className="text-xs text-red-500 max-w-[160px] truncate"
            title={req.rejection_reason}
          >
            {req.rejection_reason}
          </p>
        ) : (
          <p className="text-sm text-gray-500">{fmt(req.request_date)}</p>
        )}
      </td>

      {/* View action */}
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onView(req.request_id)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500
                     text-white text-xs font-black hover:bg-emerald-600 transition-colors"
        >
          View <ArrowUpRight size={12} />
        </button>
      </td>
    </tr>
  );
};

// ── Table scoped to one status tab ────────────────────────────────────────────
export const StatusSection = ({ tab, requests, loading, onView }) => {
  const colLabel =
    tab.id === 2
      ? "Pickup Date"
      : tab.id === 3
        ? "Completed On"
        : tab.id === 4
          ? "Reason"
          : "Filed";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="border-b border-gray-100 bg-emerald-50/50">
            {["Resident", "Document", colLabel, ""].map((h) => (
              <th
                key={h}
                className="px-6 py-3.5 text-left text-[9px] font-black tracking-[0.12em]
                           uppercase text-emerald-700/60 last:text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan="4" className="py-16 text-center">
                <Loader2
                  size={20}
                  className="animate-spin text-emerald-500 mx-auto mb-2"
                />
                <p className="text-xs text-gray-300">Loading…</p>
              </td>
            </tr>
          ) : requests.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-16 text-center">
                <Inbox size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-400">
                  {tab.emptyMsg}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">{tab.emptyHint}</p>
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <RequestRow
                key={req.request_id}
                req={req}
                statusId={tab.id}
                onView={onView}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
