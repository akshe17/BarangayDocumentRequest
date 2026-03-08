import React from "react";
import { Clock, ArrowUpRight } from "lucide-react";
import { isPaid, fmt } from "../../utils/PickupHelpers";

const PickupTableRow = ({ req, onSelect, isLast }) => {
  const u = req.resident?.user;

  return (
    <tr
      className="transition-colors bg-gray-50 hover:bg-gray-100"
      style={{ borderBottom: isLast ? "none" : "1px solid #e5e7eb" }}
    >
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black select-none">
              {u?.first_name?.[0]}
              {u?.last_name?.[0]}
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
      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
        <p className="text-sm font-semibold text-gray-800">
          {req.document_type?.document_name}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {u?.zone?.zone_name ?? "—"}
        </p>
      </td>
      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
        <p className="text-sm font-bold text-gray-900">
          ₱
          {req.document_type?.fee
            ? Number(req.document_type.fee).toFixed(2)
            : "0.00"}
        </p>
      </td>
      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-gray-400" />
          <span className="text-sm text-gray-600">{fmt(req.pickup_date)}</span>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
        <span
          className={`inline-flex items-center text-[10px] font-bold tracking-widest uppercase
          px-2.5 py-1 rounded-full border ${
            isPaid(req)
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
          }`}
        >
          {isPaid(req) ? "Paid" : "Unpaid"}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 text-right">
        <button
          onClick={() => onSelect(req)}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-500
                     text-white text-xs font-black hover:bg-emerald-600 transition-colors"
        >
          Process <ArrowUpRight size={12} />
        </button>
      </td>
    </tr>
  );
};

export default PickupTableRow;
