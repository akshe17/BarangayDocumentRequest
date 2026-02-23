import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export const Label = ({ children }) => (
  <p className="text-[9px] font-black tracking-[0.12em] uppercase text-gray-400 mb-1">
    {children}
  </p>
);

export const InfoBlock = ({ label, value }) => (
  <div>
    <Label>{label}</Label>
    <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
  </div>
);

export const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3
      rounded-2xl text-sm font-bold shadow-xl
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
