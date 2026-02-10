// src/components/ui/Toast.jsx
import React from "react";
import { X, Check, AlertTriangle, Info } from "lucide-react";

const Toast = ({ show, message, type = "success", onClose }) => {
  if (!show) return null;

  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: <Check className="w-6 h-6 text-emerald-600" />, // Bigger icon
    error: <AlertTriangle className="w-6 h-6 text-red-600" />, // Bigger icon
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />, // Bigger icon
    info: <Info className="w-6 h-6 text-blue-600" />, // Bigger icon
  };

  return (
    // --- UPDATED POSITIONS ---
    // fixed: keeps it on screen
    // top-20: distance from top
    // left-1/2 -translate-x-1/2: centers it horizontally
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down w-full px-4 md:max-w-xl">
      {/* --- UPDATED SIZING --- */}
      {/* p-5: more padding inside */}
      <div
        className={`flex items-center gap-4 p-5 rounded-2xl border shadow-2xl ${styles[type]}`}
      >
        {icons[type]}
        {/* text-base: bigger text */}
        <p className="text-base font-semibold flex-1">{message}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={22} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
