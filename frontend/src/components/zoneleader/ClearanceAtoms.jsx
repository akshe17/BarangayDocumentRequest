import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { STATUS } from "./ClearanceConstraints";
// ── Tiny label above a field ──────────────────────────────────────────────────
export const Label = ({ children }) => (
  <p className="text-[9px] font-black tracking-[0.12em] uppercase text-gray-400 mb-1.5">
    {children}
  </p>
);

// ── Read-only field display box ───────────────────────────────────────────────
export const FieldBox = ({ label, value }) => (
  <div>
    <Label>{label}</Label>
    <div
      className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium
                    text-gray-800 min-h-[44px] flex items-center"
    >
      {value || (
        <span className="text-gray-300 italic font-normal text-xs">—</span>
      )}
    </div>
  </div>
);

// ── Horizontal rule ───────────────────────────────────────────────────────────
export const Divider = () => <div className="h-px bg-gray-100 my-10" />;

// ── Section heading with emerald accent bar ───────────────────────────────────
export const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2.5 mb-6">
    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
    <p className="text-[10px] font-black tracking-[0.14em] uppercase text-gray-700">
      {children}
    </p>
  </div>
);

// ── Status badge pill ─────────────────────────────────────────────────────────
export const StatusPill = ({ statusId }) => {
  const s = STATUS[Number(statusId)] ?? {
    label: "Unknown",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold tracking-widest uppercase
                      px-2.5 py-1 rounded-full border ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

// ── Toast notification (fixed top-right) ─────────────────────────────────────
export const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-5 py-3
                     rounded-2xl text-sm font-bold shadow-lg
                     ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
    >
      {toast.type === "error" ? (
        <AlertCircle size={14} />
      ) : (
        <CheckCircle size={14} />
      )}
      {toast.msg}
    </div>
  );
};
