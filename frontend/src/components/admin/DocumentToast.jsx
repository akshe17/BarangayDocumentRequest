import React, { useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const DocumentToast = ({ toast, onClose }) => {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => onClose(), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, onClose]);

  if (!toast.show) return null;

  const isError = toast.type === "error";

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-down w-full px-4 md:max-w-xl">
      <div
        className={`flex items-center gap-4 p-5 rounded-2xl shadow-2xl border-none transition-all ${
          isError ? "bg-red-600" : "bg-emerald-500"
        } text-white`}
      >
        <div className="shrink-0">
          {isError ? (
            <AlertCircle className="w-6 h-6 text-white" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-white" />
          )}
        </div>

        <p className="text-base font-bold flex-1 tracking-tight">
          {toast.message}
        </p>

        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors p-1"
        >
          <X size={22} />
        </button>
      </div>
    </div>
  );
};

export default DocumentToast;
