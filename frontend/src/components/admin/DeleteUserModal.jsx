import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

const DeleteUserModal = ({ isOpen, onClose, onConfirm, user }) => {
  const [status, setStatus] = useState("idle"); // idle | loading | success

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      setStatus("idle");
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleConfirm = async () => {
    setStatus("loading");
    try {
      await onConfirm();
      setStatus("success");
      setTimeout(onClose, 700);
    } catch {
      setStatus("idle"); // let parent's toast show the error, reset button
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="flex items-end sm:items-center justify-center min-h-screen">
        <div
          className="relative bg-white rounded-t-3xl sm:rounded-3xl text-left overflow-hidden shadow-2xl w-full sm:max-w-lg sm:my-8 max-h-[90vh]"
          role="dialog"
          aria-modal="true"
        >
          <div className="overflow-y-auto max-h-[90vh]">
            <div className="p-5 sm:p-8">
              <div className="flex justify-center mb-3 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight pr-2">
                  Delete User
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-all"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-5 sm:space-y-6">
                <div className="text-center py-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <AlertTriangle size={32} className="text-red-600" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                    Are you absolutely sure?
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                    You are about to permanently delete{" "}
                    <span className="font-bold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </span>{" "}
                    ({user?.email}).
                  </p>
                  <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs sm:text-sm text-red-800 font-semibold">
                      ⚠️ This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={status === "loading"}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  {status === "loading" ? (
                    <button
                      disabled
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl text-white font-semibold bg-red-400 cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
                    >
                      <Loader2 size={16} className="animate-spin" /> Deleting…
                    </button>
                  ) : status === "success" ? (
                    <button
                      disabled
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl text-white font-semibold bg-emerald-500 cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
                    >
                      <CheckCircle2 size={16} /> Deleted
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirm}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl text-white font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg transition-all shadow-md min-w-[120px]"
                    >
                      Delete User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
