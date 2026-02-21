import React, { useEffect } from "react";
import { X, Check, AlertTriangle, Info } from "lucide-react";

const Toast = ({ show, message, type = "success", onClose }) => {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const styles = {
    success: "bg-emerald-500",
    error: "bg-red-600",
    warning: "bg-amber-500",
    info: "bg-blue-600",
  };

  const icons = {
    success: <Check className="w-6 h-6 text-white" />,
    error: <AlertTriangle className="w-6 h-6 text-white" />,
    warning: <AlertTriangle className="w-6 h-6 text-white" />,
    info: <Info className="w-6 h-6 text-white" />,
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-down w-full px-4 md:max-w-xl">
      <div
        className={`flex items-center gap-4 p-5 rounded-2xl shadow-2xl ${styles[type]} text-white border-none`}
      >
        {/* Simple white icon without background box for a flatter look */}
        <div className="shrink-0">{icons[type]}</div>

        <p className="text-base font-bold flex-1 tracking-tight">{message}</p>

        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={22} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
